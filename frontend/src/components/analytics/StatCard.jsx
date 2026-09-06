/**
 * StatCard
 * --------
 * The headline metric tile on the analytics page.
 *
 * Anatomy, top to bottom: a tinted icon chip with an optional trailing badge,
 * the figure, its label, and then either a hint line or a thin meter — never
 * both, so every card in a row keeps the same height.
 *
 * The figure uses the page's proportional figures rather than tabular ones:
 * equal-width digits make a short number like "121" look gappy at this size.
 */

const tones = {
  pink: {
    chip: "bg-pink-50 text-pink-600",
    glow: "bg-pink-500/10",
    meter: "bg-pink-500",
    badge: "bg-pink-50 text-pink-700",
  },
  blue: {
    chip: "bg-blue-50 text-blue-600",
    glow: "bg-blue-500/10",
    meter: "bg-blue-500",
    badge: "bg-blue-50 text-blue-700",
  },
  emerald: {
    chip: "bg-emerald-50 text-emerald-600",
    glow: "bg-emerald-500/10",
    meter: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-700",
  },
  amber: {
    chip: "bg-amber-50 text-amber-600",
    glow: "bg-amber-500/10",
    meter: "bg-amber-500",
    badge: "bg-amber-50 text-amber-700",
  },
  red: {
    chip: "bg-red-50 text-red-600",
    glow: "bg-red-500/10",
    meter: "bg-red-500",
    badge: "bg-red-50 text-red-700",
  },
  violet: {
    chip: "bg-violet-50 text-violet-600",
    glow: "bg-violet-500/10",
    meter: "bg-violet-500",
    badge: "bg-violet-50 text-violet-700",
  },
};

const StatCard = ({
  icon: Icon,
  label,
  value,
  hint,
  badge,
  tone = "pink",
  progress = null,
  delay = 0,
  compact = false,
}) => {
  const palette = tones[tone] || tones.pink;
  const meterWidth =
    progress === null
      ? null
      : Math.max(0, Math.min(100, Number(progress) || 0));

  return (
    <div
      className={`group animate-fade-in-up relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-gray-200 hover:shadow-lg ${compact ? "p-4 sm:p-5" : "p-5 sm:p-6"}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Soft corner wash — barely there at rest, warms up on hover. */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-2xl transition-opacity duration-300 ${palette.glow} opacity-60 group-hover:opacity-100`}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${palette.chip}`}
        >
          <Icon size={21} />
        </div>

        {badge && (
          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${palette.badge}`}
          >
            {badge}
          </span>
        )}
      </div>

      <p className={`relative truncate font-black tracking-tight ${compact ? "mt-3 text-xl text-gray-800 sm:text-2xl" : "mt-4 text-2xl text-gray-900 sm:text-3xl"}`}>
        {value}
      </p>
      <p className={`relative mt-1 font-semibold ${compact ? "text-xs text-gray-700 sm:text-sm" : "text-sm text-gray-600"}`}>
        {label}
      </p>

      {meterWidth !== null ? (
        <div className="relative mt-3.5 h-1.5 overflow-hidden rounded-full bg-gray-100">
          <div
            className={`h-full rounded-full transition-[width] duration-700 ease-out ${palette.meter}`}
            style={{ width: `${meterWidth}%` }}
          />
        </div>
      ) : (
        hint && <p className={`relative mt-1.5 text-xs ${compact ? "text-gray-500" : "text-gray-400"}`}>{hint}</p>
      )}
    </div>
  );
};

export default StatCard;
