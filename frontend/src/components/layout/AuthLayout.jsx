const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-pink-50">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6">
        {/* Left Side */}
        <div className="sticky hidden w-1/2 lg:flex flex-col justify-center pr-12 hover:scale-[1.02] transition-all duration-300">
          <h1 className="text-6xl font-bold text-pink-600">
            foodpanda
          </h1>

          <p className="mt-6 text-xl text-gray-600">
            Delicious food delivered to your doorstep.
          </p>

          <img
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800"
            alt="Food"
            className="mt-10 rounded-3xl shadow-xl"
          />
        </div>

        {/* Right Side */}
        <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;