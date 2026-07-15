import { AgencyBookingsSummaryTable } from "@/Components/agency/AgencyBookingsSummaryTable";

export default function AgencyBookingsPage() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Package Bookings</h1>
      <AgencyBookingsSummaryTable agencyId={undefined} />
    </div>
  );
}