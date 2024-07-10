import createClient, { type Middleware } from "openapi-fetch";
import type { paths } from "../Schema/schema.ts";
import { IPet } from "../types/petTypes.tsx";

let accessToken: string | null = null;
const getAccessToken = async (): Promise<{ accessToken: string | null }> => {
    return { accessToken: 'abc-xyz' };
};

const myInterceptor: Middleware = {
    async onRequest({ request, schemaPath }) {
        if (schemaPath === "/petsapp/pet/single") {
            return undefined;
        }

        if (!accessToken) {
            const authRes = await getAccessToken();
            if (authRes.accessToken) {
                accessToken = authRes.accessToken;
            } else {
                throw new Error("Authentication failed");
            }
        }

        request.headers.set("Authorization", accessToken);
        return request;
    },

    async onResponse({ response }) {
        const { body, ...resOptions } = response;
        return new Response(body, { ...resOptions, status: 200 });
    },
};

const client = createClient<paths>({ baseUrl: "http://localhost:3020" });

client.use(myInterceptor);

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

export const getAPet = async (): Promise<IPet> => {
    try {
        const { data, error } = await client.GET("/petsapp/pet/single", {
            params: {
                query: {
                    name: "vf"
                }
            }
        });

        if (error) {
            console.error("Error fetching pet:", error);
            throw new Error("Cannot Get");
        }

        return data as IPet;
    } catch (error) {
        console.error("Cannot Get");
        return {} as IPet;
    }
};
