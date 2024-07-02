import createClient from "openapi-fetch";
import type { paths } from "../Schema/schema.ts";
import { IPet } from "../types/petTypes.tsx";

const client = createClient<paths>({ baseUrl: "http://localhost:3020" });

export const getPets = async (): Promise<IPet[]> => {
    try {
        const { data, error } = await client.GET("/petsapp/pet");

        if (error) {
            console.error("Error fetching pets:", error);
            throw new Error("Cannot Get");
        }

        return data as IPet[];
    } catch (error) {
        console.error("Cannot Get");
        return [];
    }
};
