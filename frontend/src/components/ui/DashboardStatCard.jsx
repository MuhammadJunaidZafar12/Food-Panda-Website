const toneStyles = {
  pink: "bg-pink-50 text-pink-600",
  orange: "bg-orange-50 text-orange-600",
  green: "bg-green-50 text-green-600",
  red: "bg-red-50 text-red-600",
  blue: "bg-blue-50 text-blue-600",
  amber: "bg-amber-50 text-amber-600",
  emerald: "bg-emerald-50 text-emerald-600",
};

const DashboardStatCard = ({
  icon: Icon,
  label,
  value,
  tone = "pink",
  delay = 0,
}) => {
  return (
    <div
      className="animate-fade-in-up rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md sm:p-6"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${toneStyles[tone]}`}
      >
        <Icon size={22} />
      </div>
      <p className="text-2xl font-black text-gray-900 sm:text-3xl">{value}</p>
      <p className="mt-1 text-sm font-medium text-gray-500">{label}</p>
    </div>
  );
};

export default DashboardStatCard;
