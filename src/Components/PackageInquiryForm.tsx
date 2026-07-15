"use client";

import { Button, Input, TextArea } from "@heroui/react";
import { useState } from "react";

const BACKEND_BASE = process.env.NEXT_PUBLIC_API_URL;

export function PackageInquiryForm({
    packageId,
    agencyId,
}: {
    packageId: string;
    agencyId: string;
}) {
    const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (field: string, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            const res = await fetch(`${BACKEND_BASE}/api/inquiries`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, packageId, agencyId }),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || "Failed to submit inquiry.");
            }

            setSuccess(true);
            setForm({ name: "", email: "", phone: "", message: "" });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="w-full rounded-2xl border border-success-200 bg-success-50 p-5 text-sm text-success-700">
                Thank you! Your inquiry has been sent. The agency will contact you soon.
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto flex flex-col gap-3">
            <label className="text-sm font-semibold">Your Name</label>
            <Input
                required
                value={form.name}
                onChange={(e) => handleChange("name", (e.target as HTMLInputElement).value)}
                className="w-full"
            />

            <label className="text-sm font-semibold">Email</label>
            <Input
                required
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", (e.target as HTMLInputElement).value)}
                className="w-full"
            />

            <label className="text-sm font-semibold">Phone</label>
            <Input
                required
                type="tel"
                value={form.phone}
                onChange={(e) => handleChange("phone", (e.target as HTMLInputElement).value)}
                className="w-full"
            />

            <label className="text-sm font-semibold">Message (optional)</label>
            <TextArea
                value={form.message}
                onChange={(e) => handleChange("message", (e.target as HTMLTextAreaElement).value)}
                placeholder="Any specific questions about this tour?"
                className="w-full"
            />
            {error && <p className="text-xs text-danger">{error}</p>}
            <Button
                type="submit"
                isDisabled={submitting}
                className="w-full rounded-md bg-[#C9A227] text-[#12332E] font-semibold hover:bg-[#DBB53B]"
            >
                {submitting ? "Sending…" : "Send Inquiry"}
            </Button>
        </form>
    );
}