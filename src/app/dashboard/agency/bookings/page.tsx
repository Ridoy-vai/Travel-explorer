// import { AgencyBookingsSummaryTable } from '@/components/AgencyBookingsSummaryTable'
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { AgencyBookingsSummaryTable } from "@/Components/agency/AgencyBookingsSummaryTable"

export default async function AgencyBookingsPage() {
      const session = await auth.api.getSession({
        headers: await headers(),
    });
    // ⚠️ replace with actual logged-in agency's ID from your auth/session
    const agencyId = session?.user?.id;

    return (
        <div className="p-6">
            <h1 className="text-xl font-semibold mb-4">Package Bookings</h1>
            <AgencyBookingsSummaryTable agencyId={agencyId} />
        </div>
    )
}