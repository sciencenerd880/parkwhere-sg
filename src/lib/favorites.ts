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
  const { error } = await supabase
    .from("parkwhere_favorites")
    .insert({ user_id: userId, carpark_no: carparkNo })

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
