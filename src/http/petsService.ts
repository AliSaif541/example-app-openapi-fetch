import { IPet } from "../types/petTypes.tsx";
import { createClient, type NormalizeOAS } from "fets";
import { openapi } from "../Schema/schema.ts";

const BASE_URL = "http://localhost:3020";

const client = createClient<NormalizeOAS<typeof openapi>>({
  endpoint: "/",
});

export const getPets = async (): Promise<IPet[]> => {
  try {
    const response = await client[`${BASE_URL}/petsapp/pet`].get();
    const data = await response.json();
    return data as IPet[];
  } catch (error) {
    console.error("Cannot Get");
    return [];
  }
};
