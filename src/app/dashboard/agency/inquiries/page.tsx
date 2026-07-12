// import { AgencyInquiriesPage } from '@/components/AgencyInquiriesPage'

import { AgencyInquiriesPage } from "@/Components/agency/AgencyInquiriesPage"
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function InquiriesPage() {
      const session = await auth.api.getSession({
        headers: await headers(),
    });
    // ⚠️ replace with actual logged-in agency's ID from your auth/session
    const agencyId = session?.user?.id;

    return <AgencyInquiriesPage agencyId={agencyId} />
}