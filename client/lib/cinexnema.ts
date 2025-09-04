import { supabase } from "./supabase";

export interface CinexnemaRow {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  plan?: string;
  some_column?: string;
  other_column?: string;
  created_at?: string;
}

export async function insertCinexnema(row: CinexnemaRow) {
  const payload = {
    ...row,
    created_at: new Date().toISOString(),
  } as CinexnemaRow;

  const { data, error } = await supabase.from("Cinexnema").insert([payload]).select();
  if (error) throw error;
  return data;
}

export async function listCinexnema(limit = 10, offset = 0) {
  const { data, error } = await supabase
    .from("Cinexnema")
    .select("*")
    .range(offset, offset + limit - 1);
  if (error) throw error;
  return data;
}
