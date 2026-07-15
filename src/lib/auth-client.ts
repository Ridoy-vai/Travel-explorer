import { createAuthClient } from "better-auth/react"
import type { BetterAuthOptions } from "@better-auth/core"

const authClientOptions: BetterAuthOptions = {
    
    user: {
        additionalFields: {
            role: {
                type: "string",
                required: true,
                defaultValue: "traveler",
            },
            phone: {
                type: "string",
                required: false,
            },
            tradeLicense: {
                type: "string",
                required: false,
            },
            operatingRegion: {
                type: "string",
                required: false,
            },
            status: {
                type: "string",
                required: true,
                defaultValue: "active",
            },
        },
    },
}

export const authClient = createAuthClient({
    
    /** The base URL of the server (optional if you're using the same domain) */
    baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
    $InferAuth: authClientOptions,
    
})

export const { signIn, signUp, useSession } = authClient
