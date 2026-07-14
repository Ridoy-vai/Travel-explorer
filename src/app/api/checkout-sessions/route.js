import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '../../../lib/stripe'
import { auth } from '../../../lib/auth' // ⚠️ adjust this path to wherever your auth instance actually lives

export async function POST(request) {
    const headersList = await headers()

    const usersession = await auth.api.getSession({
        headers: headersList,
    })

    // Optional but recommended: block unauthenticated checkouts
    if (!usersession) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const origin = headersList.get('origin')
        const formData = await request.formData()

        const packageId = formData.get('packageId')
        const totalAmount = formData.get('totalAmount')
        const tourName = formData.get('tourName')
        const tourDescription = formData.get('tourDescription')
        const childCount = formData.get('childCount')
        const totalChildPrice = formData.get('totalChildPrice')
        const adultCount = formData.get('adultCount')
        const totalFemale = formData.get('totalFemale')
        const totalMale = formData.get('totalMale')

        if (!packageId || !totalAmount || !tourName) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const amountInCents = Math.round(parseFloat(totalAmount) * 100)
        if (!Number.isFinite(amountInCents) || amountInCents <= 0) {
            return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
        }

        const session = await stripe.checkout.sessions.create({
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        unit_amount: amountInCents,
                        product_data: {
                            name: tourName,
                            description: tourDescription || undefined,
                        },
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            metadata: {
                packageId,
                childCount: childCount ?? '',
                totalChildPrice: totalChildPrice ?? '',
                adultCount: adultCount ?? '',
                totalFemale: totalFemale ?? '',
                totalMale: totalMale ?? '',
            },
            success_url: `${origin}/Packages/success?session_id={CHECKOUT_SESSION_ID}`,
        })

        return NextResponse.redirect(session.url, 303)
    } catch (err) {
        return NextResponse.json(
            { error: err.message },
            { status: err.statusCode || 500 }
        )
    }
}