import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { sendEmail } from "./email";

const client = new MongoClient(process.env.MONGODB_URI || "mongodb://localhost:27017/mydatabase");
const db = client.db("Travel-Explore");

export const auth = betterAuth({
    database: mongodbAdapter(db, {
        client
    }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
    },
    emailVerification: {
        sendVerificationEmail: async ({ user, url, token }, request) => {
            try {
                await sendEmail({
                    to: user.email,
                    subject: "Verify your email address",
                    text: `Click the link to verify your email: ${url}`,
                });
                console.log("Verification email sent to:", user.email);
            } catch (err) {
                console.error("Failed to send verification email:", err);
            }
        },
    },
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
        },
    },
});