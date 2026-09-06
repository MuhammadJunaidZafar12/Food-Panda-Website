/**
 * ChartCard
 * ---------
 * The shell every chart and table on the analytics page sits in: one border
 * radius, one padding scale, one title treatment.
 *
 * `isEmpty` swaps the body for a quiet placeholder rather than rendering an
 * axis with nothing on it — an empty plot reads as broken, a message reads as
 * "no orders yet".
 */

const ChartCard = ({
  title,
  subtitle,
  action,
  children,
  isEmpty = false,
  emptyMessage = "No data for this period yet.",
  className = "",
  delay = 0,
}) => {
  return (
    <section
      className={`animate-fade-in-up rounded-2xl border border-gray-100 bg-white shadow-sm ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-50 px-5 py-4 sm:px-6 sm:py-5">
        <div className="min-w-0">
          <h2 className="text-base font-bold text-gray-900 sm:text-lg">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
              {subtitle}
            </p>
          )}
        </div>
        {action}
      </header>

      <div className="p-5 sm:p-6">
        {isEmpty ? (
          <div className="flex min-h-[180px] items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/60 px-6 text-center">
            <p className="text-sm text-gray-400">{emptyMessage}</p>
          </div>
        ) : (
          children
        )}
      </div>
    </section>
  );
};

export default ChartCard;
