import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { sendEmail } from "./email";

const client = new MongoClient(process.env.MONGODB_URI || "mongodb://localhost:27017/mydatabase");
const db = client.db("Travel-Explore");

export const auth = betterAuth({
    database: mongodbAdapter(db, {
        client
    }), socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        }
    },
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
                    text: `
                    Hi ${user.name || "Traveler"},

Welcome! We're excited to have you join our travel community.

Thank you for creating an account with us. You're now just one step away from exploring amazing destinations, planning unforgettable trips, and enjoying all the features our platform has to offer.

To protect your account and ensure that your email address belongs to you, please verify your email by clicking the link below:

${url}

If the button or link does not open automatically, simply copy and paste the URL into your browser.

Email verification helps us:

* Keep your account secure.
* Protect your personal information.
* Enable important account notifications.
* Allow password recovery if you ever forget your password.
* Provide a safer experience for all travelers.

For your security, this verification link may expire after a limited time. If it expires, you can request a new verification email from the sign-in page.

If you did not create an account on our website, you can safely ignore this email. No further action is required, and no account will be activated without verification.

We're looking forward to helping you discover incredible destinations, book memorable experiences, and make your travel planning simple and enjoyable.

Thank you for choosing us. We can't wait to be part of your next adventure.

Safe travels,
The Travel Explore Team

---

Need help?

If you have any questions or experience any issues verifying your email, feel free to contact our support team. We're always happy to help.

This is an automated email. Please do not reply directly to this message.

                    `,
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
            status: {
                type: "string",
                required: true,
                defaultValue: "active",
            },
        },
    },
});