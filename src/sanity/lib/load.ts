import { client } from "./client";
import { sanityConfigured } from "../env";

export async function loadSanity<T>(query: string): Promise<T | null> {
  if (!sanityConfigured()) return null;

  try {
    return await client.fetch<T>(query);
  } catch {
    return null;
  }
}
