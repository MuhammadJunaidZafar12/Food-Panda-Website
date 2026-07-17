import FoodPanda from "../../assets/foodpanda.svg";

const Logo = () => {
  return (
    <div className="text-center">
      <img src={FoodPanda} alt="foodpanda" className="mx-auto h-16 w-16" />
      <h1 className="text-4xl font-bold text-pink-600">

        foodpanda
      </h1>

      <p className="mt-2 text-gray-500">
        Order food from your favourite restaurants
      </p>
    </div>
  );
};

export default Logo;