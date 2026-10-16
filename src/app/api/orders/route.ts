import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { orderSchema, type OrderFormValues } from "@/lib/validations/order";

export async function POST(request: Request) {
  try {
    // 1. Auth + shop
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: shop, error: shopErr } = await supabase
      .from("shops")
      .select("id")
      .eq("owner_id", user.id)
      .single();

    if (shopErr || !shop) {
      return NextResponse.json({ error: "Shop not found" }, { status: 400 });
    }

    // 2. Validate body with zod schema
    const rawBody: unknown = await request.json();
    const parseResult = orderSchema.safeParse(rawBody);

    if (!parseResult.success) {
      const firstIssue = parseResult.error.issues[0];
      return NextResponse.json(
        { error: firstIssue?.message || "Invalid order data" },
        { status: 400 }
      );
    }

    const body: OrderFormValues = parseResult.data;

    // 3. Customer handling
    let customerId: string;

    if (body.customer_mode === "existing") {
      if (!body.customer_id) {
        return NextResponse.json(
          { error: "Customer ID is required" },
          { status: 400 }
        );
      }

      const { data: existingCustomer, error: custFindErr } = await supabase
        .from("customers")
        .select("id")
        .eq("id", body.customer_id)
        .eq("shop_id", shop.id)
        .single();

      if (custFindErr || !existingCustomer) {
        return NextResponse.json(
          { error: "Customer not found" },
          { status: 400 }
        );
      }

      customerId = existingCustomer.id;
    } else {
      const { data: newCustomer, error: custInsertErr } = await supabase
        .from("customers")
        .insert({
          shop_id: shop.id,
          name: body.new_customer_name!,
          phone: body.new_customer_phone || null,
          facebook_name: body.new_customer_facebook || null,
        })
        .select("id")
        .single();

      if (custInsertErr || !newCustomer) {
        return NextResponse.json(
          { error: custInsertErr?.message || "Failed to create customer" },
          { status: 500 }
        );
      }

      customerId = newCustomer.id;
    }

    // 4. Fetch products to snapshot prices and check stock
    const uniqueProductIds = Array.from(
      new Set(body.items.map((i) => i.product_id))
    );

    const { data: products, error: prodErr } = await supabase
      .from("products")
      .select("id, name, price, type, stock_qty")
      .in("id", uniqueProductIds)
      .eq("shop_id", shop.id);

    if (prodErr || !products || products.length !== uniqueProductIds.length) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 400 }
      );
    }

    const productMap = new Map(products.map((p) => [p.id, p]));

    const depositPaid = Number(body.deposit_paid) || 0;
    const normalizedItems = body.items.map((item) => ({
      product_id: item.product_id,
      quantity: Math.max(1, Number(item.quantity) || 1),
    }));

    // 5. Compute totals server-side (do NOT trust client)
    const totalPrice = normalizedItems.reduce((sum, item) => {
      const product = productMap.get(item.product_id)!;
      return sum + product.price * item.quantity;
    }, 0);

    const balanceDue = Math.max(0, totalPrice - depositPaid);

    // 6. If order_type === 'stock': verify stock for each item (only for stock and hybrid products)
    if (body.order_type === "stock") {
      for (const item of normalizedItems) {
        const product = productMap.get(item.product_id)!;
        if (product.type === "stock" || product.type === "hybrid") {
          if (product.stock_qty < item.quantity) {
            return NextResponse.json(
              { error: `လက်ကျန် မလုံလောက်ပါ: ${product.name}` },
              { status: 400 }
            );
          }
        }
      }
    }

    // 7. Insert order
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        shop_id: shop.id,
        customer_id: customerId,
        shipment_id: null,
        order_type: body.order_type,
        total_price: totalPrice,
        deposit_paid: depositPaid,
        balance_due: balanceDue,
        payment_method: body.payment_method,
        status: "pending",
        note: body.note || null,
      })
      .select("id")
      .single();

    if (orderErr || !order) {
      return NextResponse.json(
        { error: orderErr?.message || "Failed to create order" },
        { status: 500 }
      );
    }

    const orderId = order.id;

    // 8. Insert order_items (batch insert)
    const orderItemsRows = normalizedItems.map((item) => {
      const product = productMap.get(item.product_id)!;
      return {
        order_id: orderId,
        product_id: item.product_id,
        product_name: product.name,
        quantity: item.quantity,
        unit_price: product.price,
        subtotal: product.price * item.quantity,
      };
    });

    const { error: itemsErr } = await supabase
      .from("order_items")
      .insert(orderItemsRows);

    if (itemsErr) {
      return NextResponse.json(
        { error: itemsErr.message || "Failed to create order items" },
        { status: 500 }
      );
    }

    // 9. If order_type === 'stock': decrement stock + log movements (only for stock/hybrid products)
    if (body.order_type === "stock") {
      for (const item of normalizedItems) {
        const product = productMap.get(item.product_id)!;

        if (product.type === "stock" || product.type === "hybrid") {
          const { error: stockErr } = await supabase
            .from("products")
            .update({ stock_qty: product.stock_qty - item.quantity })
            .eq("id", item.product_id);

          if (stockErr) {
            console.error("Failed to decrement stock:", stockErr);
          }

          const { error: movementErr } = await supabase
            .from("stock_movements")
            .insert({
              shop_id: shop.id,
              product_id: item.product_id,
              change: -item.quantity,
              reason: "sale",
              note: `Order ${orderId}`,
            });

          if (movementErr) {
            console.error("Failed to log stock movement:", movementErr);
          }
        }
      }
    }

    // 10. Return order ID
    return NextResponse.json({ id: orderId });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
