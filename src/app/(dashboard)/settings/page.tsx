import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SettingsForm, type ShopData } from "@/components/settings/settings-form";
import { SettingsHeader } from "@/components/settings/settings-header";

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: shop } = await supabase
    .from("shops")
    .select("id, name, phone, facebook_url, telegram_username")
    .eq("owner_id", user.id)
    .single();

  if (!shop) {
    redirect("/signup");
  }

  const initialShop: ShopData = {
    id: shop.id,
    name: shop.name,
    phone: shop.phone,
    facebook_url: shop.facebook_url,
    telegram_username: shop.telegram_username,
  };

  return (
    <div className="space-y-6 pb-12">
      <SettingsHeader />
      <SettingsForm initialShop={initialShop} />
    </div>
  );
}

