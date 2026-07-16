// import { MyBookingsPage } from '@/components/MyBookingsPage'
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { MyBookingsPage } from "@/Components/traveler/MyBookingsPage"
import { getUserToken } from "@/lib/session";

export default async function BookingsPage() {
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

    return <MyBookingsPage travelerId={travelerId} token={token} />
}