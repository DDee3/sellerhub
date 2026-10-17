import { connection } from "next/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SettingsForm, type ShopData } from "@/components/settings/settings-form";

export const metadata = {
  title: "Settings | exchange",
};

export default async function SettingsPage() {
  await connection();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch shop for current user
  let { data: shop } = await supabase
    .from("shops")
    .select("id, name, rate_display_mode")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // If the shop doesn't exist, create it first so it always has a valid UUID
  if (!shop) {
    const { data: newShop, error: createError } = await supabase
      .from("shops")
      .insert({
        owner_id: user.id,
        name: "My Store",
        rate_display_mode: "mmk_per_thb",
      })
      .select("id, name, rate_display_mode")
      .single();

    if (createError) {
      console.error("[SettingsPage] Error creating initial shop:", createError);
    } else if (newShop) {
      shop = newShop;
    }
  }

  if (!shop?.id) {
    return (
      <div className="space-y-4 max-w-2xl">
        <h1 className="text-xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-sm text-destructive">
          Unable to locate or create a shop for your account. Please log out and sign up again.
        </p>
      </div>
    );
  }

  const initialShop: ShopData = {
    id: shop.id,
    name: shop.name,
    rate_display_mode:
      (shop.rate_display_mode as "mmk_per_thb" | "thb_per_lakh") || "mmk_per_thb",
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="text-xs text-muted-foreground">
          Manage your rate display preferences and shop settings
        </p>
      </div>

      <SettingsForm initialShop={initialShop} />
    </div>
  );
}
