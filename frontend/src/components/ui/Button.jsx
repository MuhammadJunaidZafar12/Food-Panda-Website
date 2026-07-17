const Button = ({
  children,
  type = "button",
  loading = false,
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={loading}
      className="
      w-full
      rounded-lg
      bg-pink-600
      py-3
      text-white
      font-semibold
      transition
      hover:bg-pink-700
      disabled:opacity-60
      "
      {...props}
    >
      {loading ? "Please wait..." : children}
    </button>
  );
};

export default Button;