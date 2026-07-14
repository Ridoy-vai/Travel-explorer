
// import AgencyPackagesManager from "@/Components/agency/agencypacagepostpage";
import TravelerProfilePage from "@/Components/traveler/TravelerProfilePage";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function post() {
      const session = await auth.api.getSession({
        headers: await headers(),
    });
    // ⚠️ replace with actual logged-in traveler's ID from your auth/session
    const travelerId = session?.user?.id;

    return <TravelerProfilePage travelerId={travelerId} />;
}