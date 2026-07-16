import { AgencyBookingsSummaryTable } from "@/Components/agency/AgencyBookingsSummaryTable";
import { auth } from "@/lib/auth";
import { getUserToken } from "@/lib/session";
import { headers } from "next/headers";
export default async function AgencyBookingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.id) {
    return null;
  }
  const token = await getUserToken();

  // ⚠️ replace with actual logged-in traveler's ID from your auth/session
  const agencyId = session?.user?.id;
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Package Bookings</h1>
      <AgencyBookingsSummaryTable agencyId={agencyId} token={token} />
    </div>
  );
}