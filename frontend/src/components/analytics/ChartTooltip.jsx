/**
 * ChartTooltip
 * ------------
 * Hover card shared by every chart on the analytics page, styled to match the
 * page's own surfaces instead of Recharts' default box.
 *
 * `format` turns a raw value into its display string; `unit` labels it.
 */
const ChartTooltip = ({
  active,
  payload,
  label,
  format = (value) => value,
  unit = "",
}) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-gray-100 bg-white px-3.5 py-2.5 shadow-lg">
      <p className="text-xs font-semibold text-gray-500">{label}</p>
      <p className="mt-1 text-sm font-bold text-gray-900">
        {format(payload[0].value)}
        {unit && <span className="ml-1 font-medium text-gray-400">{unit}</span>}
      </p>
    </div>
  );
};

export default ChartTooltip;
