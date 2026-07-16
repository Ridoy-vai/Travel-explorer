
// import AgencyPackagesManager from "@/Components/agency/agencypacagepostpage";
import TravelerProfilePage from "@/Components/traveler/TravelerProfilePage";
import { auth } from "@/lib/auth";
import { getUserToken } from "@/lib/session";
import { headers } from "next/headers";

export default async function post() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    // ⚠️ replace with actual logged-in traveler's ID from your auth/session
    const travelerId = session?.user?.id;
    const token = await getUserToken();

    if (!travelerId) {
        return (
            <div className="py-16 text-center text-muted">
                We could not determine your traveler ID. Please sign in and try again.
            </div>
        );
    }

    return <TravelerProfilePage travelerId={travelerId} token={token} />;
}