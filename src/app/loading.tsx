import { Compass } from "lucide-react";

/**
 * loading.tsx — Route Loading UI
 * ---------------------------------
 * Next.js shows this automatically (via React Suspense) while a route
 * segment's server data is being fetched — no need to import or call
 * it anywhere. Drop this file next to a page.tsx (e.g. app/loading.tsx
 * for global, or app/Packages/[id]/loading.tsx to scope it to just
 * that route) and Next.js wires it up on its own.
 *
 * Same brand tokens as error.tsx / not-found.tsx (signal blue #2563EB,
 * trail orange #F97316). Signature element: the compass from the 404
 * page, but spinning purposefully — "still finding the way" rather
 * than "lost".
 */
export default function Loading() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-5 bg-white px-6 py-20 text-center">
      {/* Spinning compass, built from two rings + a needle so the
          motion reads as "searching" rather than a generic spinner */}
      <div className="relative h-16 w-16">
        <span className="absolute inset-0 rounded-full border-2 border-dashed border-blue-200 animate-[spin_3s_linear_infinite] motion-reduce:animate-none" />
        <span className="absolute inset-2 flex items-center justify-center rounded-full bg-blue-50">
          <Compass
            size={28}
            className="text-blue-600 animate-[spin_1.6s_ease-in-out_infinite] motion-reduce:animate-none"
          />
        </span>
      </div>

      <div>
        <p className="text-sm font-semibold text-slate-700">Finding your way…</p>
        <p className="mt-1 text-xs text-slate-400">This will just take a moment</p>
      </div>
    </div>
  );
}