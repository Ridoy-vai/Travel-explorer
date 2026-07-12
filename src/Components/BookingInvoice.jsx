'use client'

import { useRef, useState } from 'react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export default function BookingInvoice({
    pkg,
    customerEmail,
    metadata,
    totalPaid,
    currency,
    sessionId,
    invoiceId,
}) {
    const invoiceRef = useRef(null)
    const [downloading, setDownloading] = useState(false)

    const {
        packageId,
        childCount,
        totalChildPrice,
        adultCount,
        totalFemale,
        totalMale,
    } = metadata || {}

    const totalTravelers =
        (parseInt(adultCount, 10) || 0) + (parseInt(childCount, 10) || 0)

    const handleDownload = async () => {
        if (!invoiceRef.current) return
        setDownloading(true)
        try {
            const canvas = await html2canvas(invoiceRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
            })
            const imgData = canvas.toDataURL('image/png')
            const pdf = new jsPDF('p', 'mm', 'a4')
            const pdfWidth = pdf.internal.pageSize.getWidth()
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
            pdf.save(`booking-invoice-${invoiceId?.slice(-8) ?? 'confirmation'}.pdf`)
        } catch (err) {
            console.error('PDF generation failed:', err)
        } finally {
            setDownloading(false)
        }
    }

    return (
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                <button
                    onClick={handleDownload}
                    disabled={downloading}
                    style={{
                        background: '#12332E',
                        color: '#C9A227',
                        border: 'none',
                        padding: '0.65rem 1.4rem',
                        borderRadius: 8,
                        fontWeight: 600,
                        cursor: downloading ? 'not-allowed' : 'pointer',
                        opacity: downloading ? 0.7 : 1,
                        fontSize: '0.95rem',
                    }}
                >
                    {downloading ? 'Preparing PDF…' : '⬇ Download Invoice (PDF)'}
                </button>
            </div>

            {/* ===== Invoice card (this is what gets captured to PDF) ===== */}
            <div
                ref={invoiceRef}
                style={{
                    position: 'relative',
                    background: '#fff',
                    border: '1px solid #e5e0d5',
                    borderRadius: 16,
                    overflow: 'hidden',
                    fontFamily: 'Georgia, serif',
                    boxShadow: '0 8px 30px rgba(18,51,46,0.08)',
                }}
            >
                {/* PAID stamp watermark */}
                <div
                    style={{
                        position: 'absolute',
                        top: '38%',
                        left: '50%',
                        transform: 'translate(-50%, -50%) rotate(-18deg)',
                        border: '6px solid #16794f',
                        color: '#16794f',
                        fontFamily: 'Arial, sans-serif',
                        fontWeight: 900,
                        fontSize: '4.2rem',
                        letterSpacing: '0.35rem',
                        padding: '0.3rem 1.5rem',
                        borderRadius: 12,
                        opacity: 0.18,
                        pointerEvents: 'none',
                        userSelect: 'none',
                        whiteSpace: 'nowrap',
                        zIndex: 1,
                    }}
                >
                    PAID
                </div>

                {/* Header */}
                <div
                    style={{
                        background: '#12332E',
                        padding: '1.75rem 2rem',
                        color: '#fff',
                        position: 'relative',
                        zIndex: 2,
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.75rem', letterSpacing: '0.1em', color: '#C9A227', textTransform: 'uppercase' }}>
                                Booking Confirmation
                            </p>
                            <h1 style={{ margin: '0.25rem 0 0', fontSize: '1.6rem' }}>
                                {pkg?.title ?? 'Tour Package'}
                            </h1>
                        </div>
                        <div style={{ textAlign: 'right', fontSize: '0.85rem', color: '#d8d8d8' }}>
                            <p style={{ margin: 0 }}>Invoice ID</p>
                            <p style={{ margin: 0, fontFamily: 'monospace', color: '#C9A227' }}>
                                {sessionId?.slice(-12) ?? 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>

                <div style={{ padding: '2rem', position: 'relative', zIndex: 2 }}>
                    {pkg?.coverImage && (
                        <img
                            src={pkg.coverImage}
                            alt={pkg.title}
                            crossOrigin="anonymous"
                            style={{ width: '100%', height: 220, objectFit: 'cover', borderRadius: 12, marginBottom: '1.5rem' }}
                        />
                    )}

                    <p style={{ color: '#444', lineHeight: 1.6 }}>{pkg?.shortDescription}</p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem 1.5rem', margin: '1.5rem 0', fontSize: '0.9rem', color: '#333' }}>
                        <InfoRow label="Destination" value={pkg?.destination} />
                        <InfoRow label="Duration" value={pkg ? `${pkg.durationDays}D / ${pkg.durationNights}N` : '—'} />
                        <InfoRow label="Departure" value={pkg?.departureLocation} />
                        <InfoRow label="Transportation" value={pkg?.transportation} />
                        <InfoRow label="Accommodation" value={pkg?.accommodation} />
                        <InfoRow label="Agency" value={pkg?.agencyName} />
                    </div>

                    {/* Traveler breakdown */}
                    <div style={{ background: '#faf8f2', borderRadius: 12, padding: '1.25rem 1.5rem', margin: '1.5rem 0' }}>
                        <h3 style={{ margin: '0 0 0.75rem', color: '#12332E', fontSize: '1rem' }}>Traveler Breakdown</h3>
                        <SummaryRow label="Total Travelers" value={totalTravelers} />
                        <SummaryRow label="Adults" value={adultCount ?? 0} />
                        <SummaryRow label="Children" value={childCount ?? 0} />
                        <SummaryRow label="Male" value={totalMale ?? 0} />
                        <SummaryRow label="Female" value={totalFemale ?? 0} />
                        <SummaryRow label="Child Subtotal" value={totalChildPrice ? `৳${totalChildPrice}` : '—'} />
                    </div>

                    {/* Total */}
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderTop: '2px dashed #C9A227',
                            paddingTop: '1rem',
                            marginTop: '1rem',
                        }}
                    >
                        <span style={{ fontSize: '1rem', color: '#12332E', fontWeight: 600 }}>Total Paid</span>
                        <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#16794f' }}>
                            {totalPaid ? `${currency?.toUpperCase()} ${totalPaid}` : '—'}
                        </span>
                    </div>

                    <p style={{ marginTop: '2rem', fontSize: '0.85rem', color: '#777', textAlign: 'center' }}>
                        A confirmation email has been sent to <strong>{customerEmail ?? 'your email'}</strong>.
                        Questions? <a href="mailto:orders@example.com" style={{ color: '#12332E' }}>orders@example.com</a>
                    </p>
                </div>
            </div>
        </div>
    )
}

function InfoRow({ label, value }) {
    if (!value) return null
    return (
        <div>
            <p style={{ margin: 0, fontSize: '0.7rem', color: '#999', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
            <p style={{ margin: 0 }}>{value}</p>
        </div>
    )
}

function SummaryRow({ label, value }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', padding: '0.2rem 0', color: '#444' }}>
            <span>{label}</span>
            <span style={{ fontWeight: 600 }}>{value}</span>
        </div>
    )
}