"use client";

type Props = {
  textTop: string; // e.g., SSS / SS+
  colorFrom?: string;
  colorTo?: string;
};

export default function RarityBadgeWing({
  textTop,
  colorFrom = "from-rose-600",
  colorTo = "to-amber-500",
}: Props) {
  return (
    <div className="relative inline-flex items-center justify-center select-none">
      {/* Halo ring */}
      <div className="absolute -z-10 h-10 w-10 rounded-full border-2 border-white/40 shadow-[0_0_24px_rgba(255,255,255,0.25)]" />

      {/* Wings - layered */}
      <div className="absolute -left-10 top-1/2 -translate-y-1/2">
        <div className="relative h-8 w-10">
          <div className="absolute right-0 top-1/2 -translate-y-1/2 h-6 w-8 bg-gradient-to-tr from-yellow-200 to-white rounded-l-full shadow-[inset_0_0_2px_rgba(0,0,0,0.2)]" />
          <div className="absolute right-6 top-1/2 -translate-y-1/2 h-6 w-2 bg-yellow-300 rounded-full rotate-12" />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-2 bg-yellow-200 rounded-full rotate-[18deg]" />
        </div>
      </div>
      <div className="absolute -right-10 top-1/2 -translate-y-1/2">
        <div className="relative h-8 w-10">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-8 bg-gradient-to-tl from-yellow-200 to-white rounded-r-full shadow-[inset_0_0_2px_rgba(0,0,0,0.2)]" />
          <div className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-2 bg-yellow-300 rounded-full -rotate-12" />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-2 bg-yellow-200 rounded-full -rotate-[18deg]" />
        </div>
      </div>

      {/* Core badge with gold frame and inner pattern */}
      <div
        className={`relative px-5 py-2.5 text-white font-extrabold tracking-wide uppercase shadow-[0_8px_22px_rgba(0,0,0,0.25)] bg-gradient-to-r ${colorFrom} ${colorTo}`}>
        <div className="absolute -inset-1 rounded-md bg-gradient-to-r from-yellow-500 via-amber-300 to-yellow-500 opacity-95 -z-10" />
        <div className="absolute inset-0.5 rounded-[6px] bg-gradient-to-r from-rose-700/90 to-amber-600/90 -z-10" />
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 h-3 w-3 rotate-45 bg-amber-300 shadow-[0_0_0_2px_rgba(255,255,255,0.5)]" />
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-3 w-3 rotate-45 bg-amber-300 shadow-[0_0_0_2px_rgba(255,255,255,0.5)]" />
        <div className="absolute inset-0 rounded-[6px] bg-[repeating-linear-gradient(45deg,rgba(255,255,255,0.08)_0px,rgba(255,255,255,0.08)_2px,transparent_2px,transparent_6px)] pointer-events-none" />
        <div className="text-[10px] sm:text-xs leading-none text-center drop-shadow">
          {textTop}
        </div>
      </div>
    </div>
  );
}
