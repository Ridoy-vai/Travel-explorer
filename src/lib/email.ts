import nodemailer from "nodemailer";

interface SendEmailParams {
    to: string;
    subject: string;
    text: string;
    html?: string;
}

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

// Optional: verify connection on startup (helpful for debugging in dev)
if (process.env.NODE_ENV !== "production") {
    transporter.verify((error) => {
        if (error) {
            console.error("❌ Email transporter error:", error);
        } else {
            console.log("✅ Email transporter is ready to send messages");
        }
    });
}

export async function sendEmail({ to, subject, text, html }: SendEmailParams) {
    try {
        const info = await transporter.sendMail({
            from: `"Travel Explore" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html: html || `<p>${text}</p>`,
        });

        console.log("Email sent:", info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
}