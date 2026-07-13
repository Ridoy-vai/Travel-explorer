
import AgencyPackagesManager from "@/Components/agency/AgencyPacagePostPage";
// import AgencyPackagesManager from "@/Components/agency/agencypacagepostpage";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function post() {
      const session = await auth.api.getSession({
        headers: await headers(),
    });
    // ⚠️ replace with actual logged-in agency's ID from your auth/session
    const agencyId = session?.user?.id;

    return <AgencyPackagesManager agencyId={agencyId} />;
}