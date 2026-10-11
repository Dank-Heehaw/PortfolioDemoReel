import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "../env";

export const client = createClient({
  projectId: projectId || "00000000",
  dataset,
  apiVersion,
  useCdn: true,
  perspective: "published",
});
