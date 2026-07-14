import React from "react";
import { Star, Construction } from "lucide-react";

const page = () => {
    return (
        <div className="min-h-[70vh] flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center bg-white rounded-2xl border border-gray-100 shadow-sm p-10">
                <div className="mx-auto h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-5">
                    <Construction className="text-blue-600" size={26} />
                </div>

                <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-600 border border-amber-200 px-2.5 py-1 rounded-full text-[11px] font-bold mb-3">
                    <Star size={11} />
                    Coming Soon
                </div>

                <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">
                    Traveler Reviews
                </h1>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                    This feature is on the way. Soon you&apos;ll be able to see and share
                    reviews for the trips you&apos;ve booked, right here.
                </p>
            </div>
        </div>
    );
};

export default page;