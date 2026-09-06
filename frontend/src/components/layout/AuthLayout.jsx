const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-pink-50">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-4 py-8 sm:px-6 lg:flex-row">
        <div className="sticky hidden w-full flex-col justify-center pr-12 transition-all duration-300 hover:scale-[1.02] lg:flex lg:w-1/2">
          <h1 className="text-5xl font-bold text-pink-600 xl:text-6xl">
            foodpanda
          </h1>

          <p className="mt-6 text-lg text-gray-600 xl:text-xl">
            Delicious food delivered to your doorstep.
          </p>

          <img
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800"
            alt="Food"
            className="mt-10 rounded-3xl shadow-xl"
          />
        </div>

        <div className="w-full max-w-md overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
