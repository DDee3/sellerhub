import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const editOrderSchema = z.object({
  items: z
    .array(
      z.object({
        product_id: z.string().min(1, "ပစ္စည်း ရွေးချယ်ပါ"),
        quantity: z.preprocess(
          (val) => (val === "" || val === undefined ? 1 : val),
          z.coerce
            .number()
            .int()
            .min(1, "အရေအတွက် အနည်းဆုံး ၁ ခု ထည့်ပါ")
            .default(1)
        ),
      })
    )
    .min(1, "ပစ္စည်း အနည်းဆုံး ၁ မျိုး ထည့်ပါ"),
  deposit_paid: z.preprocess(
    (val) => (val === "" || val === undefined ? 0 : val),
    z.coerce.number().min(0).default(0)
  ),
  payment_method: z.enum(["kbz_pay", "wave_pay", "cash", "cod"]),
  note: z.string().optional().or(z.literal("")),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // 1. Auth user + shop
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

    // 2. Fetch existing order
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("id, status, order_type, shop_id")
      .eq("id", id)
      .eq("shop_id", shop.id)
      .maybeSingle();

    if (orderErr || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status === "delivered" || order.status === "cancelled") {
      return NextResponse.json(
        { error: "ဤအော်ဒါကို ပြင်၍ မရပါ" },
        { status: 400 }
      );
    }

    // 3. Fetch existing order_items
    const { data: oldItemsData, error: oldItemsErr } = await supabase
      .from("order_items")
      .select("product_id, quantity")
      .eq("order_id", id);

    if (oldItemsErr) {
      return NextResponse.json(
        { error: "Failed to fetch existing order items" },
        { status: 500 }
      );
    }

    const oldItems = oldItemsData ?? [];

    // 4. Parse & validate request body
    const rawBody: unknown = await request.json();
    const parseResult = editOrderSchema.safeParse(rawBody);

    if (!parseResult.success) {
      const firstIssue = parseResult.error.issues[0];
      return NextResponse.json(
        { error: firstIssue?.message || "Invalid order data" },
        { status: 400 }
      );
    }

    const body = parseResult.data;
    const normalizedItems = body.items.map((item) => ({
      product_id: item.product_id,
      quantity: Math.max(1, Number(item.quantity) || 1),
    }));

    // 5. Fetch new products
    const newIds = Array.from(new Set(normalizedItems.map((i) => i.product_id)));
    const { data: newProducts, error: prodErr } = await supabase
      .from("products")
      .select("id, name, price, type, stock_qty")
      .in("id", newIds)
      .eq("shop_id", shop.id);

    if (prodErr || !newProducts || newProducts.length !== newIds.length) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 400 }
      );
    }

    // 6. If order_type === 'stock', perform stock adjustments
    if (order.order_type === "stock") {
      // STEP A: reverse old items (only for stock/hybrid products)
      for (const oldItem of oldItems) {
        if (!oldItem.product_id) continue;
        const { data: prod } = await supabase
          .from("products")
          .select("stock_qty, type")
          .eq("id", oldItem.product_id)
          .single();

        if (prod && (prod.type === "stock" || prod.type === "hybrid")) {
          await supabase
            .from("products")
            .update({ stock_qty: prod.stock_qty + oldItem.quantity })
            .eq("id", oldItem.product_id);

          await supabase.from("stock_movements").insert({
            shop_id: shop.id,
            product_id: oldItem.product_id,
            change: oldItem.quantity,
            reason: "returned",
            note: `Order ${id} edit - reverse`,
          });
        }
      }

      // STEP B: verify new stock available after reversal (only for stock/hybrid products)
      const { data: freshProducts, error: freshErr } = await supabase
        .from("products")
        .select("id, name, price, type, stock_qty")
        .in("id", newIds)
        .eq("shop_id", shop.id);

      if (freshErr || !freshProducts) {
        return NextResponse.json(
          { error: "Failed to verify fresh product stock" },
          { status: 500 }
        );
      }

      const freshProductMap = new Map(freshProducts.map((p) => [p.id, p]));

      for (const newItem of normalizedItems) {
        const p = freshProductMap.get(newItem.product_id);
        if (!p) {
          return NextResponse.json(
            { error: "Product not found" },
            { status: 400 }
          );
        }

        if (p.type === "stock" || p.type === "hybrid") {
          if (p.stock_qty < newItem.quantity) {
            // Rollback STEP A reversal before failing
            for (const oldItem of oldItems) {
              if (!oldItem.product_id) continue;
              const { data: prod } = await supabase
                .from("products")
                .select("stock_qty, type")
                .eq("id", oldItem.product_id)
                .single();

              if (prod && (prod.type === "stock" || prod.type === "hybrid")) {
                await supabase
                  .from("products")
                  .update({ stock_qty: prod.stock_qty - oldItem.quantity })
                  .eq("id", oldItem.product_id);

                await supabase.from("stock_movements").insert({
                  shop_id: shop.id,
                  product_id: oldItem.product_id,
                  change: -oldItem.quantity,
                  reason: "sale",
                  note: `Order ${id} edit rollback`,
                });
              }
            }

            return NextResponse.json(
              { error: `လက်ကျန် မလုံလောက်ပါ: ${p.name}` },
              { status: 400 }
            );
          }
        }
      }

      // STEP C: apply new items (only for stock/hybrid products)
      for (const newItem of normalizedItems) {
        const p = freshProductMap.get(newItem.product_id)!;
        if (p.type === "stock" || p.type === "hybrid") {
          await supabase
            .from("products")
            .update({ stock_qty: p.stock_qty - newItem.quantity })
            .eq("id", newItem.product_id);

          p.stock_qty -= newItem.quantity;

          await supabase.from("stock_movements").insert({
            shop_id: shop.id,
            product_id: newItem.product_id,
            change: -newItem.quantity,
            reason: "sale",
            note: `Order ${id} edit - apply`,
          });
        }
      }
    }

    // 7. Compute total_price and balance_due
    const productMap = new Map(newProducts.map((p) => [p.id, p]));
    const totalPrice = normalizedItems.reduce((sum, item) => {
      const product = productMap.get(item.product_id)!;
      return sum + Number(product.price) * item.quantity;
    }, 0);

    const depositPaid = Number(body.deposit_paid) || 0;
    const balanceDue = Math.max(0, totalPrice - depositPaid);

    // 8. Delete old order_items
    const { error: delErr } = await supabase
      .from("order_items")
      .delete()
      .eq("order_id", id);

    if (delErr) {
      return NextResponse.json(
        { error: delErr.message || "Failed to remove old order items" },
        { status: 500 }
      );
    }

    // 9. Insert new order_items
    const orderItemsRows = normalizedItems.map((item) => {
      const product = productMap.get(item.product_id)!;
      return {
        order_id: id,
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

    // 10. Update order
    const { error: updateErr } = await supabase
      .from("orders")
      .update({
        total_price: totalPrice,
        deposit_paid: depositPaid,
        balance_due: balanceDue,
        payment_method: body.payment_method,
        note: body.note?.trim() || null,
      })
      .eq("id", id);

    if (updateErr) {
      return NextResponse.json(
        { error: updateErr.message || "Failed to update order" },
        { status: 500 }
      );
    }

    return NextResponse.json({ id });
  } catch (error) {
    console.error("Order edit error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

