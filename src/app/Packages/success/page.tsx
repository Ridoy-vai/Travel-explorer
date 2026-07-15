import { redirect } from 'next/navigation'
import { stripe } from '../../../lib/stripe'
// import BookingInvoice from '../../../components/BookingInvoice'
import BookingInvoice from '@/components/BookingInvoice'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

const BACKEND_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:2000";

async function getPackageDetails(packageId) {
    try {
        const res = await fetch(`${BACKEND_BASE}/api/agency/packages/${packageId}`, {
            cache: 'no-store',
        })
        if (!res.ok) return null
        return res.json()
    } catch (err) {
        console.error('Failed to fetch package details:', err)
        return null
    }
}

async function saveBooking(payload) {
    try {
        const res = await fetch(`${BACKEND_BASE}/api/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        })
        if (!res.ok) {
            const text = await res.text()
            console.error('Booking save failed:', res.status, text)
        }
    } catch (err) {
        console.error('Booking save request error:', err)
    }
}

export default async function Success({ searchParams }) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    const user = session?.user;
    // console.log('Authenticated user:', user);
    const { session_id } = await searchParams

    if (!session_id) {
        throw new Error('Please provide a valid session_id (`cs_test_...`)')
    }

    const CheckoutSession = await stripe.checkout.sessions.retrieve(session_id, {
        expand: ['line_items', 'payment_intent'],
    })

    const { status, metadata, customer_details, amount_total, currency, payment_intent } = CheckoutSession
    const customerEmail = customer_details?.email

    if (status === 'open') {
        return redirect('/')
    }

    if (status !== 'complete') {
        return (
            <section id="success" style={{ textAlign: 'center', padding: '3rem' }}>
                <p>Your payment is still processing. Please check back shortly.</p>
            </section>
        )
    }

    const rawPkg = metadata?.packageId ? await getPackageDetails(metadata.packageId) : null
    const pkg = rawPkg?.data ?? rawPkg // handles both {data: {...}} and direct object shapes
    const travelerId = user?.id ?? 'N/A'
    const totalPaid = amount_total != null ? (amount_total / 100).toFixed(2) : null
    const invoiceId = typeof payment_intent === 'string' ? payment_intent : payment_intent?.id
    const invoice = session_id?.slice(-12) ?? 'N/A'
    // Save booking (idempotent — Express checks sessionId before inserting)
    if (metadata?.packageId && customerEmail) {
        await saveBooking({
            sessionId: session_id,
            travelerId: travelerId,
            invoiceId: invoice,
            packageId: metadata.packageId,
            agencyId: pkg.agencyId,
            email: customerEmail,
            adultCount: metadata.adultCount,
            childCount: metadata.childCount,
            totalMale: metadata.totalMale,
            totalFemale: metadata.totalFemale,
            totalChildPrice: metadata.totalChildPrice,
            totalAmount: totalPaid,
            currency,
        })
    }

    return (
        <BookingInvoice
            pkg={pkg}
            customerEmail={customerEmail}
            metadata={metadata}
            totalPaid={totalPaid}
            currency={currency}
            sessionId={session_id}
            invoiceId={invoiceId}
        />
    )
}