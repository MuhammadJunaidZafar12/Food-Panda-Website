/**
 * Analytics chart theme
 * ---------------------
 * Shared colours and chrome for every chart on the owner analytics page, so the
 * whole dashboard reads as one system instead of eight separately-styled plots.
 *
 * Two series hues, and they mean something:
 *
 *   PINK  — money (revenue, order value)
 *   BLUE  — counts (orders, statuses, busy hours)
 *
 * Both were validated against the white card surface: worst pair ΔE 15.9 under
 * protanopia and 30.4 under normal vision, each above 3:1 contrast. The palette
 * they replaced put pink beside rose (ΔE 8.3 — hard to separate even with full
 * colour vision) and violet beside blue (ΔE 0.3 under deuteranopia, i.e. the
 * same colour to a red-green colourblind reader).
 *
 * Charts here are single-series by design: one measure, one colour, and the
 * axis labels carry identity. That is also why the status chart is one hue —
 * a red/green "delivered vs cancelled" split measures ΔE 4.1 under deuteranopia,
 * so the good/bad signal lives on the labelled stat cards instead, where an icon
 * and a word carry it rather than hue alone.
 */

export const CHART_COLORS = {
  revenue: "#db2777", // pink-600  — 4.60:1 on white
  count: "#2a78d6", // blue      — 4.42:1 on white
};

// Chrome sits one shade off the surface so it never competes with the data.
export const CHART_CHROME = {
  grid: "#eef0f2",
  tick: "#94a3b8",
  cursor: "rgba(15, 23, 42, 0.04)",
};

/** Solid hairline grid — dashes read as "threshold" when it is only a grid. */
export const gridProps = {
  stroke: CHART_CHROME.grid,
  strokeDasharray: "0",
};

/** Recessive axes: no tick marks, no axis rule, muted labels. */
export const axisProps = {
  tickLine: false,
  axisLine: false,
  tick: { fill: CHART_CHROME.tick, fontSize: 12 },
};

/**
 * Value-axis domain for a horizontal bar chart whose bars carry direct labels.
 *
 * Without the headroom the longest bar runs to the edge of the plot area and
 * recharts wraps *that one* label onto two lines ("Rs" / "742k"), because it
 * sizes a `position="right"` label against the space left inside the plot
 * rather than against the chart margin. The 15% also keeps the label clear of
 * the card edge on a phone.
 */
export const labelledBarDomain = [0, (dataMax) => Math.ceil(dataMax * 1.15)];

export const formatRs = (value) =>
  `Rs ${Number(value || 0).toLocaleString("en-PK", {
    maximumFractionDigits: 0,
  })}`;

/** "Rs 742k" — for direct labels on phone-width cards, where the full figure
 *  would take more room than the bar it belongs to. */
export const formatRsCompact = (value) => {
  const amount = Number(value) || 0;

  if (amount >= 1000000) {
    return `Rs ${(amount / 1000000).toFixed(amount >= 10000000 ? 0 : 1)}m`;
  }
  if (amount >= 1000) return `Rs ${Math.round(amount / 1000)}k`;
  return formatRs(amount);
};

/** Axis ticks: 12000 → "12k", so the y-axis stays narrow. */
export const compactTick = (value) =>
  value >= 1000 ? `${Math.round(value / 1000)}k` : value;

/**
 * Keeps a category tick inside its axis band. Restaurant names have no length
 * limit, and a category axis will happily wrap or draw over its neighbour —
 * the hover tooltip still reports the untruncated name.
 *
 * Both are single-argument on purpose: recharts calls a tickFormatter as
 * `(value, index)`, so a `max` parameter here would silently receive the tick
 * index and truncate every label to a different length.
 */
const truncate = (value, max) => {
  const text = String(value ?? "");
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
};

export const truncateTick = (value) => truncate(value, 15);

export const truncateTickShort = (value) => truncate(value, 11);
