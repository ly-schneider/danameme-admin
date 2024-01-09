import supabase from "../supabase";

export default async function getBotProfile() {
  const { data, error } = await supabase
    .from("profile")
    .select("*")
    .eq("id_profile", 30);

  if (error) {
    console.log(error);
    return;
  }

  return data[0];
}
