import { AgencyInquiriesPage } from "@/Components/agency/AgencyInquiriesPage";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
export default async function InquiriesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.id) {
    return null;
  }

  // ⚠️ replace with actual logged-in traveler's ID from your auth/session
  const agencyId = session?.user?.id;
  return <AgencyInquiriesPage agencyId={agencyId} />;
}