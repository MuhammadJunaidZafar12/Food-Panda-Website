const Input = ({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  name,
}) => {
  return (
    <div className="mb-5">
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>

      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="
          w-full
          rounded-xl
          border
          border-gray-300
          px-4
          py-3
          outline-none
          transition-all
          duration-300
          focus:border-pink-600
          focus:ring-4
          focus:ring-pink-100
        "
      />
    </div>
  );
};

export default Input;