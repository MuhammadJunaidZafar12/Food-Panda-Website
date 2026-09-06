import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BarChart3,
  CheckCircle2,
  Clock3,
  Receipt,
  ShoppingBag,
  TrendingUp,
  XCircle,
} from "lucide-react";

import { getAnalyticsDashboardThunk } from "../../redux/analytics/analyticsThunk";
import { setTimeRange } from "../../redux/analytics/analyticsSlice";
import ChartCard from "../../components/analytics/ChartCard";
import ChartTooltip from "../../components/analytics/ChartTooltip";
import StatCard from "../../components/analytics/StatCard";
import useIsNarrow from "../../components/analytics/useIsNarrow";
import {
  CHART_COLORS,
  CHART_CHROME,
  axisProps,
  compactTick,
  formatRs,
  formatRsCompact,
  gridProps,
  labelledBarDomain,
  truncateTick,
  truncateTickShort,
} from "../../components/analytics/chartTheme";

const TIME_RANGES = [
  { value: "today", label: "Today" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "year", label: "Year" },
];

const RANGE_CAPTIONS = {
  today: "today",
  week: "this week",
  month: "this month",
  year: "this year",
};

// Listed in the order an order actually moves through, so the chart reads as a
// lifecycle top-to-bottom rather than an arbitrary pile of categories.
const STATUS_SEQUENCE = [
  ["pending", "Pending"],
  ["accepted", "Accepted"],
  ["preparing", "Preparing"],
  ["ready", "Ready"],
  ["out_for_delivery", "Out for delivery"],
  ["delivered", "Delivered"],
  ["cancelled", "Cancelled"],
  ["rejected", "Rejected"],
];

// The API sends money as fixed-decimal strings; charts need real numbers.
const toNumber = (value) => Number(value) || 0;

const share = (part, whole) =>
  whole > 0 ? `${Math.round((toNumber(part) / whole) * 100)}% of orders` : null;

const Analytics = () => {
  const dispatch = useDispatch();
  const { analytics, loading, timeRange } = useSelector(
    (state) => state.analytics
  );
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);
  // The two horizontal bar charts spend their width on the name axis and the
  // value labels; on a phone both have to give some of it back to the bars.
  const isNarrow = useIsNarrow();

  useEffect(() => {
    dispatch(getAnalyticsDashboardThunk(selectedTimeRange));
  }, [dispatch, selectedTimeRange]);

  const handleTimeRangeChange = (range) => {
    setSelectedTimeRange(range);
    dispatch(setTimeRange(range));
  };

  const caption = RANGE_CAPTIONS[selectedTimeRange] || "this period";

  const {
    keyMetrics,
    revenueTrend,
    statusData,
    restaurantRevenue,
    peakHours,
    topProducts,
    restaurantPerformance,
    topProductPeak,
  } = useMemo(() => {
    const metrics = analytics?.keyMetrics || {};

    const products = (analytics?.topProducts || [])
      .slice(0, 8)
      .map((item) => ({ ...item, revenue: toNumber(item.revenue) }));

    return {
      keyMetrics: metrics,
      revenueTrend: (analytics?.dailyRevenueTrend || []).map((item) => ({
        date: item.date,
        revenue: toNumber(item.revenue),
      })),
      statusData: STATUS_SEQUENCE.map(([key, label]) => ({
        label,
        orders: toNumber(analytics?.statusDistribution?.[key]),
      })).filter((item) => item.orders > 0),
      restaurantRevenue: (analytics?.revenueByRestaurant || [])
        .map((item) => ({ ...item, revenue: toNumber(item.revenue) }))
        // Ranked comparison — biggest earner first, so the bars step down.
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 8),
      peakHours: analytics?.peakHours || [],
      topProducts: products,
      restaurantPerformance: analytics?.restaurantPerformance || [],
      // Drives the share bars in the top-products list.
      topProductPeak: Math.max(...products.map((p) => p.quantity), 0),
    };
  }, [analytics]);

  const totalOrders = toNumber(keyMetrics.totalOrders);

  // First paint has nothing to show; later refetches keep the old numbers on
  // screen and dim them, so switching range never collapses the layout.
  if (loading && !analytics) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-11 w-11 animate-spin rounded-full border-4 border-pink-100 border-t-pink-600" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-24 text-center">
        <BarChart3 size={36} className="mx-auto text-gray-300" />
        <h2 className="mt-4 text-lg font-bold text-gray-800">
          No analytics yet
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Once orders start coming in, your performance shows up here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* ── Header + the one filter row that scopes the whole page ───── */}
      <div className="animate-fade-in-up flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-800 sm:text-3xl lg:text-4xl">
            Analytics
          </h1>
          <p className="mt-1.5 text-sm text-gray-500 sm:text-base">
            How your restaurants performed {caption}.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Time range"
          className="flex w-full rounded-xl border border-gray-200 bg-gray-50 p-1 lg:w-auto"
        >
          {TIME_RANGES.map((range) => {
            const active = selectedTimeRange === range.value;

            return (
              <button
                key={range.value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => handleTimeRangeChange(range.value)}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-bold transition lg:flex-none ${
                  active
                    ? "bg-white text-pink-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {range.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Everything below re-renders against the selected range. */}
      <div
        className={`space-y-6 transition-opacity duration-200 sm:space-y-8 ${
          loading ? "pointer-events-none opacity-50" : "opacity-100"
        }`}
      >
        {/* ── Key metrics ────────────────────────────────────────────── */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            icon={Receipt}
            label="Total revenue"
            value={formatRs(keyMetrics.totalRevenue)}
            hint="From delivered orders"
            tone="pink"
            delay={0}
            compact
          />
          <StatCard
            icon={ShoppingBag}
            label="Total orders"
            value={totalOrders.toLocaleString()}
            hint={`All orders placed ${caption}`}
            tone="blue"
            delay={60}
            compact
          />
          <StatCard
            icon={TrendingUp}
            label="Average order value"
            value={formatRs(keyMetrics.averageOrderValue)}
            hint="Per delivered order"
            tone="violet"
            delay={120}
            compact
          />
          <StatCard
            icon={CheckCircle2}
            label="Completed"
            compact
            value={toNumber(keyMetrics.completedOrders).toLocaleString()}
            hint={share(keyMetrics.completedOrders, totalOrders)}
            tone="emerald"
            delay={180}
            
          />
          <StatCard
            icon={XCircle}
            label="Cancelled"
            value={toNumber(keyMetrics.cancelledOrders).toLocaleString()}
            hint={share(keyMetrics.cancelledOrders, totalOrders)}
            tone="red"
            delay={240}
            compact
          />
          <StatCard
            icon={Clock3}
            label="Completion rate"
            value={`${toNumber(keyMetrics.completionRate).toFixed(1)}%`}
            badge={
              toNumber(keyMetrics.completionRate) >= 90 ? "Healthy" : undefined
            }
            tone="amber"
            progress={toNumber(keyMetrics.completionRate)}
            delay={300}
            compact
          />
        </div>

        {/* ── Revenue trend ──────────────────────────────────────────── */}
        <ChartCard
          title="Revenue trend"
          subtitle={`Delivered revenue ${caption}`}
          isEmpty={revenueTrend.length === 0}
          emptyMessage="No delivered revenue in this period."
          delay={120}
        >
          <div className="h-72 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={revenueTrend}
                margin={{ top: 8, right: 12, bottom: 0, left: 4 }}
              >
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor={CHART_COLORS.revenue}
                      stopOpacity={0.28}
                    />
                    <stop
                      offset="100%"
                      stopColor={CHART_COLORS.revenue}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid {...gridProps} vertical={false} />
                <XAxis dataKey="date" {...axisProps} />
                <YAxis {...axisProps} width={64} tickFormatter={compactTick} />
                <Tooltip
                  cursor={{ stroke: CHART_COLORS.revenue, strokeWidth: 1 }}
                  content={<ChartTooltip format={formatRs} />}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke={CHART_COLORS.revenue}
                  strokeWidth={2}
                  fill="url(#revenueFill)"
                  dot={{ r: 3, strokeWidth: 0, fill: CHART_COLORS.revenue }}
                  activeDot={{ r: 5, stroke: "#ffffff", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* ── Status split + busiest hours ───────────────────────────── */}
        <div className="grid gap-6 xl:grid-cols-2">
          <ChartCard
            title="Order status"
            subtitle="Where your orders currently sit"
            isEmpty={statusData.length === 0}
            emptyMessage="No orders in this period."
            delay={160}
          >
            <div className="h-72 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={statusData}
                  layout="vertical"
                  margin={{
                    top: 4,
                    right: isNarrow ? 34 : 48,
                    bottom: 4,
                    left: 4,
                  }}
                  barCategoryGap="26%"
                >
                  {/* No grid: every bar carries its own count as a label, so
                      gridlines would only draw across the data. */}
                  <XAxis
                    type="number"
                    hide
                    allowDecimals={false}
                    domain={labelledBarDomain}
                  />
                  <YAxis
                    type="category"
                    dataKey="label"
                    width={isNarrow ? 98 : 116}
                    {...axisProps}
                  />
                  <Tooltip
                    cursor={{ fill: CHART_CHROME.cursor }}
                    content={<ChartTooltip unit="orders" />}
                  />
                  <Bar
                    dataKey="orders"
                    fill={CHART_COLORS.count}
                    radius={[0, 6, 6, 0]}
                    maxBarSize={18}
                    // One status can hold 100× another; without a floor the
                    // small ones render as nothing and read as zero.
                    minPointSize={2}
                  >
                    <LabelList
                      dataKey="orders"
                      position="right"
                      offset={10}
                      className="fill-gray-500"
                      fontSize={12}
                      fontWeight={700}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard
            title="Busiest hours"
            subtitle="Your five heaviest ordering hours"
            isEmpty={peakHours.length === 0}
            emptyMessage="Not enough orders to spot a pattern yet."
            delay={200}
          >
            <div className="h-72 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={peakHours}
                  margin={{ top: 16, right: 12, bottom: 0, left: 4 }}
                >
                  <CartesianGrid {...gridProps} vertical={false} />
                  <XAxis dataKey="hour" {...axisProps} />
                  <YAxis {...axisProps} width={40} allowDecimals={false} />
                  <Tooltip
                    cursor={{ fill: CHART_CHROME.cursor }}
                    content={<ChartTooltip unit="orders" />}
                  />
                  <Bar
                    dataKey="orders"
                    fill={CHART_COLORS.count}
                    radius={[6, 6, 0, 0]}
                    maxBarSize={44}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* ── Revenue by restaurant ──────────────────────────────────── */}
        <ChartCard
          title="Revenue by restaurant"
          subtitle={`How each of your restaurants earned ${caption}`}
          isEmpty={restaurantRevenue.length === 0}
          emptyMessage="No delivered revenue to compare yet."
          delay={240}
        >
          <div className="h-72 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={restaurantRevenue}
                layout="vertical"
                margin={{
                  top: 4,
                  right: isNarrow ? 56 : 96,
                  bottom: 4,
                  left: 4,
                }}
                barCategoryGap="28%"
              >
                {/* Names sit on the y-axis: they stay readable at any width,
                    where rotated names under vertical bars would collide. Each
                    bar is labelled with its total, so no grid and no x-axis. */}
                <XAxis type="number" hide domain={labelledBarDomain} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={isNarrow ? 104 : 150}
                  tickFormatter={isNarrow ? truncateTickShort : truncateTick}
                  {...axisProps}
                />
                <Tooltip
                  cursor={{ fill: CHART_CHROME.cursor }}
                  content={<ChartTooltip format={formatRs} />}
                />
                <Bar
                  dataKey="revenue"
                  fill={CHART_COLORS.revenue}
                  radius={[0, 6, 6, 0]}
                  maxBarSize={20}
                  minPointSize={2}
                >
                  <LabelList
                    dataKey="revenue"
                    position="right"
                    offset={10}
                    formatter={isNarrow ? formatRsCompact : formatRs}
                    className="fill-gray-500"
                    fontSize={12}
                    fontWeight={700}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* ── Top products ───────────────────────────────────────────── */}
        <ChartCard
          title="Top products"
          subtitle="Your best sellers by units sold"
          isEmpty={topProducts.length === 0}
          emptyMessage="No products sold in this period."
          delay={280}
        >
          <ol className="space-y-1">
            {topProducts.map((product, index) => (
              <li
                key={product.name}
                className="flex items-center gap-4 rounded-xl px-2 py-2.5 transition hover:bg-gray-50"
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-black ${
                    index === 0
                      ? "bg-pink-600 text-white"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {index + 1}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="truncate text-sm font-bold text-gray-900">
                      {product.name}
                    </p>
                    <p className="shrink-0 text-sm font-bold tabular-nums text-gray-900">
                      {formatRs(product.revenue)}
                    </p>
                  </div>

                  {/* Share bar — units sold relative to the best seller. */}
                  <div className="mt-1.5 flex items-center gap-3">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-pink-500"
                        style={{
                          width: `${
                            topProductPeak > 0
                              ? (product.quantity / topProductPeak) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <span className="shrink-0 text-xs font-medium text-gray-400">
                      {product.quantity} sold
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </ChartCard>

        {/* ── Restaurant performance ─────────────────────────────────── */}
        <ChartCard
          title="Restaurant performance"
          subtitle="Orders, revenue and reliability side by side"
          isEmpty={restaurantPerformance.length === 0}
          emptyMessage="No restaurants to report on yet."
          className="overflow-hidden"
          delay={320}
        >
          <div className="-mx-5 overflow-x-auto sm:-mx-6">
            <table className="w-full min-w-160 border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-left">
                  {[
                    "Restaurant",
                    "Orders",
                    "Revenue",
                    "Completion",
                    "Rating",
                  ].map((heading, index) => (
                    <th
                      key={heading}
                      className={`px-5 pb-3 text-xs font-bold uppercase tracking-wide text-gray-400 sm:px-6 ${
                        index === 0 ? "" : "text-right"
                      }`}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {restaurantPerformance.map((restaurant) => {
                  const rate = toNumber(restaurant.completionRate);

                  return (
                    <tr
                      key={restaurant.id}
                      className="transition hover:bg-gray-50/70"
                    >
                      <td className="px-5 py-3.5 text-sm font-bold text-gray-900 sm:px-6">
                        {restaurant.name}
                      </td>
                      <td className="px-5 py-3.5 text-right text-sm tabular-nums text-gray-600 sm:px-6">
                        {restaurant.orders}
                      </td>
                      <td className="px-5 py-3.5 text-right text-sm font-semibold tabular-nums text-gray-900 sm:px-6">
                        {formatRs(restaurant.revenue)}
                      </td>
                      <td className="px-5 py-3.5 text-right sm:px-6">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold tabular-nums ${
                            rate >= 90
                              ? "bg-emerald-50 text-emerald-700"
                              : rate >= 70
                                ? "bg-amber-50 text-amber-700"
                                : "bg-red-50 text-red-700"
                          }`}
                        >
                          {rate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right text-sm font-semibold tabular-nums text-gray-900 sm:px-6">
                        ⭐ {toNumber(restaurant.rating).toFixed(1)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </ChartCard>
      </div>
    </div>
  );
};

export default Analytics;
