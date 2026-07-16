import { AgencyEarningsPage } from "@/Components/agency/AgencyEarningsPage";
import { auth } from "@/lib/auth";
import { getUserToken } from "@/lib/session";
import { headers } from "next/headers";
export default async function EarningsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.id) {
    return null;
  }
  const token = await getUserToken();

  // ⚠️ replace with actual logged-in traveler's ID from your auth/session
  const agencyId = session?.user?.id;
  return <AgencyEarningsPage agencyId={agencyId}  token={token}/>;
}