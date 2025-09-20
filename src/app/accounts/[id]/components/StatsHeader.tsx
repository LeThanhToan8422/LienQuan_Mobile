"use client";

export type Stats = {
  level: string | number;
  skins: number | undefined;
  heroes: number | undefined;
  matches: number;
  winRate: number;
  reputation: number;
};

type Props = {
  stats: Stats;
};

export default function StatsHeader({ stats }: Props) {
  return (
    <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 p-6 rounded-2xl mb-8 shadow-xl border border-amber-200/60 relative overflow-hidden backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-r from-amber-400/5 to-orange-400/5 animate-pulse"></div>
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-400"></div>
      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-yellow-400 via-orange-500 to-amber-400"></div>

      <div className="relative z-10">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {[
            {
              icon: "⭐",
              label: "Level",
              value: stats.level,
              color: "text-amber-800",
            },
            {
              icon: "👗",
              label: "Trang phục",
              value: stats.skins,
              color: "text-purple-600",
            },
            {
              icon: "⚔️",
              label: "Tướng",
              value: stats.heroes,
              color: "text-green-600",
            },
            {
              icon: "🎮",
              label: "Trận",
              value: stats.matches,
              color: "text-blue-600",
            },
            {
              icon: "🏆",
              label: "Tỷ lệ thắng",
              value: `${stats.winRate}%`,
              color: "text-red-600",
            },
            {
              icon: "💎",
              label: "Uy tín",
              value: stats.reputation,
              color: "text-orange-600",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="text-center group cursor-pointer p-2 rounded-lg hover:bg-white/30 transition-all duration-300 hover:shadow-sm">
              <div className="mb-1">
                <div className="text-lg mb-1">{item.icon}</div>
                <div className="text-xs font-semibold text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                  {item.label}
                </div>
              </div>
              <div
                className={`text-2xl font-bold ${item.color} group-hover:scale-105 transition-transform duration-300`}>
                {item.value}
              </div>
              <div className="w-6 h-0.5 bg-gradient-to-r from-amber-400 to-orange-400 mx-auto mt-1 rounded-full group-hover:w-8 transition-all duration-300"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
