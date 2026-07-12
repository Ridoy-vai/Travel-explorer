// import { AgencyEarningsPage } from '@/components/AgencyEarningsPage'
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { AgencyEarningsPage } from "@/Components/agency/AgencyEarningsPage"

export default async function EarningsPage() {
      const session = await auth.api.getSession({
        headers: await headers(),
    });
    // ⚠️ replace with actual logged-in agency's ID from your auth/session
    const agencyId = session?.user?.id;

    return <AgencyEarningsPage agencyId={agencyId} />
}