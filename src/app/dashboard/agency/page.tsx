import { AgencyOverviewPage } from "@/Components/agency/AgencyOverviewPage";
import { auth } from "@/lib/auth";
import { getUserToken } from "@/lib/session";
import { headers } from "next/headers";

export default async function OverviewPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const token = await getUserToken();


  if (!session?.user?.id) {
    return <p className="text-sm text-danger p-6">Please log in.</p>;
  }

  // এখানে user.id দিয়ে DB থেকে actual agency ডকুমেন্ট খুঁজে বের করো
  // উদাহরণ: const agency = await Agency.findOne({ userId: session.user.id });
  // const agencyId = agency?._id?.toString();

  const agencyId = session.user.id; // <-- এইটা যদি সঠিক agency _id না হয়, এটাই সমস্যা

  if (!agencyId) {
    return <p className="text-sm text-danger p-6">Agency profile not found.</p>;
  }

  return <AgencyOverviewPage agencyId={agencyId} token={token} />;
}