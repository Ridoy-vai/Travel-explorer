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
            <Input
                label="Your Name"
                value={form.name}
                onValueChange={(v) => handleChange("name", v)}
                isRequired
                className="w-full"
            />
            <Input
                label="Email"
                type="email"
                value={form.email}
                onValueChange={(v) => handleChange("email", v)}
                isRequired
                className="w-full"
            />
            <Input
                label="Phone"
                type="tel"
                value={form.phone}
                onValueChange={(v) => handleChange("phone", v)}
                isRequired
                className="w-full"
            />
            <TextArea
                label="Message (optional)"
                value={form.message}
                onValueChange={(v) => handleChange("message", v)}
                placeholder="Any specific questions about this tour?"
                className="w-full"
            />
            {error && <p className="text-xs text-danger">{error}</p>}
            <Button
                type="submit"
                isDisabled={submitting}
                className="w-full bg-[#C9A227] text-[#12332E] font-semibold hover:bg-[#DBB53B]"
                radius="sm"
            >
                {submitting ? "Sending…" : "Send Inquiry"}
            </Button>
        </form>
    );
}