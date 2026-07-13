// import { MyBookingsPage } from '@/components/MyBookingsPage'
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { MyBookingsPage } from "@/Components/traveler/MyBookingsPage"

export default async function BookingsPage() {
     const session = await auth.api.getSession({
        headers: await headers(),
    });
    // ⚠️ replace with actual logged-in traveler's ID from your auth/session
    const travelerId = session?.user?.id

    return <MyBookingsPage travelerId={travelerId} />
}