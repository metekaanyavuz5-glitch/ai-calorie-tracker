import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Dashboard from "@/components/Dashboard";
import type { Meal } from "@/lib/types";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: meals } = await supabase
    .from("meals")
    .select("*")
    .order("created_at", { ascending: false });

  return <Dashboard userEmail={user.email ?? ""} initialMeals={(meals as Meal[]) ?? []} />;
}
