import { createClient } from "@/lib/supabase/client"

export async function fetchFavorites(userId: string): Promise<string[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("parkwhere_favorites")
    .select("carpark_no")
    .eq("user_id", userId)

  if (error) throw error
  return data.map((row) => row.carpark_no)
}

export async function addFavorite(userId: string, carparkNo: string) {
  const supabase = createClient()
  // upsert with onConflict makes add idempotent — a second insert for the
  // same (user_id, carpark_no) becomes a no-op update instead of throwing a
  // unique-violation error. This is what makes the optimistic-UI pattern
  // in `toggleFavorite` safe under rapid double-taps.
  const { error } = await supabase
    .from("parkwhere_favorites")
    .upsert(
      { user_id: userId, carpark_no: carparkNo },
      { onConflict: "user_id,carpark_no" },
    )

  if (error) throw error
}

export async function removeFavorite(userId: string, carparkNo: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from("parkwhere_favorites")
    .delete()
    .eq("user_id", userId)
    .eq("carpark_no", carparkNo)

  if (error) throw error
}
