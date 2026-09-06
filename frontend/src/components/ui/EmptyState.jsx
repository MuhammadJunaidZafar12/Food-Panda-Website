const EmptyState = ({ icon: Icon, title, description, className = "" }) => {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center ${className}`}
    >
      {Icon && (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 text-gray-300">
          <Icon size={32} />
        </div>
      )}
      <h3 className="mt-4 text-lg font-bold text-gray-800">{title}</h3>
      {description && (
        <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">{description}</p>
      )}
    </div>
  );
};

export default EmptyState;
