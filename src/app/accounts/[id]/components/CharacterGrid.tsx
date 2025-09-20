"use client";

import { Image as AntImage } from "antd";
import RarityBadgeWing from "./RarityBadgeWing";

function getWingStyleByRarity(rarity?: string): {
  from: string;
  to: string;
} {
  const r = (rarity || "").toUpperCase();
  if (r.includes("SSM")) {
    return { from: "from-violet-600", to: "to-fuchsia-500" };
  }
  if (r.includes("SS")) {
    return { from: "from-rose-600", to: "to-amber-500" };
  }
  if (r.includes("S+")) {
    return { from: "from-sky-600", to: "to-cyan-400" };
  }
  if (r.startsWith("A")) {
    return { from: "from-emerald-600", to: "to-green-400" };
  }
  return { from: "from-slate-600", to: "to-slate-400" };
}

export type CharacterCard = {
  character?: string;
  skin?: string;
  rarity?: string;
  avatar: string;
  background?: string;
};

type Props = {
  items: CharacterCard[];
  getRarityClasses: (rarity?: string) => {
    ring: string;
    badge: string;
    glow: string;
  };
};

export default function CharacterGrid({ items, getRarityClasses }: Props) {
  if (!items?.length) return null;
  return (
    <div className="mb-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-5 sm:gap-7">
        {items.map((char, index) => {
          const rc = getRarityClasses(char.rarity);
          return (
            <div
              key={`${char.character}-${index}`}
              className={`group relative z-0 rounded-2xl p-5 text-center transform-gpu transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.05] hover:z-10 backdrop-blur-sm border border-white/40 shadow-lg cursor-pointer min-w-[150px]`}
              style={{
                backgroundImage: char.background
                  ? `url(${char.background})`
                  : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
              onMouseMove={(e) => {
                const target =
                  e.currentTarget.querySelector<HTMLDivElement>(".tilt");
                if (!target) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const px = (e.clientX - rect.left) / rect.width; // 0..1
                const py = (e.clientY - rect.top) / rect.height; // 0..1
                const rx = (0.5 - py) * 8; // max 8deg tilt X
                const ry = (px - 0.5) * 8; // max 8deg tilt Y
                target.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
              }}
              onMouseLeave={(e) => {
                const target =
                  e.currentTarget.querySelector<HTMLDivElement>(".tilt");
                if (target)
                  target.style.transform = "rotateX(0deg) rotateY(0deg)";
              }}>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/80 via-white/70 to-white/90 pointer-events-none" />
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 blur-sm"></div>
              <div className="relative z-10 tilt transition-transform duration-300 ease-out will-change-transform">
                <div
                  className={`mx-auto mb-3 w-18 h-18 rounded-full overflow-hidden ${rc.ring} transition-all duration-500 group-hover:scale-125 group-hover:rotate-6 relative`}>
                  <div
                    className={`absolute inset-0 rounded-full ${rc.ring} opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-md`}></div>
                  <AntImage
                    src={char.avatar}
                    alt={char.character || "avatar"}
                    width={72}
                    height={72}
                    className="w-18 h-18 rounded-full object-cover relative z-10"
                    fallback="/favicon.ico"
                    preview={false}
                  />
                </div>
                {/* Skin name as primary headline with rarity gradient */}
                <div
                  className={`text-lg font-extrabold bg-gradient-to-r ${rc.badge} bg-clip-text text-transparent drop-shadow-sm mb-1 group-hover:opacity-95 transition-all duration-300 text-center`}>
                  {char.skin || "Default"}
                </div>
                {/* Character name - Impactful & readable: backplate + gradient + strong outline + shimmer */}
                <div className="relative mb-3 inline-block overflow-hidden">
                  {/* Glow halo behind text */}
                  <span className="pointer-events-none absolute inset-x-4 top-1/2 -translate-y-1/2 h-6 rounded-full bg-gradient-to-r from-amber-300/25 via-rose-300/20 to-fuchsia-300/25 blur-md -z-10" />
                  {/* Backplate for contrast */}
                  <span
                    className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded-md bg-white/80 backdrop-blur-[1.5px] ring-1 ring-white/70 shadow-sm"
                    aria-hidden></span>
                  {/* Gradient text with stronger outline */}
                  <span
                    className={`relative z-10 text-[13px] font-black tracking-wide bg-gradient-to-r ${rc.badge} bg-clip-text text-transparent [text-shadow:0_1px_0_#fff,0_0_3px_rgba(0,0,0,.6),0_2px_10px_rgba(0,0,0,.35)]`}>
                    {char.character || "Unknown"}
                  </span>
                  {/* Shimmer sweep on hover */}
                  <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/45 to-transparent group-hover:translate-x-full duration-700 ease-linear" />
                  {/* Animated underline */}
                  <div className="mx-auto mt-1 h-0.5 w-6 rounded-full bg-gradient-to-r from-amber-400 via-rose-400 to-fuchsia-400 group-hover:w-10 transition-all duration-500" />
                </div>
                <div className="w-10 h-0.5 mx-auto mb-2 bg-gradient-to-r from-rose-400 via-amber-300 to-yellow-300 rounded-full opacity-70 group-hover:w-12 transition-all duration-300"></div>
                <div className="scale-95 group-hover:scale-100 transition-transform duration-300">
                  {(() => {
                    const { from, to } = getWingStyleByRarity(char.rarity);
                    return (
                      <RarityBadgeWing
                        textTop={(char.rarity || "N/A").toString()}
                        colorFrom={from}
                        colorTo={to}
                      />
                    );
                  })()}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
