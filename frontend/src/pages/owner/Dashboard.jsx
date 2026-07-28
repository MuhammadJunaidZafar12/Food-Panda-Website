import { Link } from "react-router-dom";
import {
  Store,
  Plus,
  Package,
  ShoppingBag,
  BarChart3,
} from "lucide-react";

const Dashboard = () => {
  const cards = [
    {
      title: "Create Restaurant",
      description: "Add a new restaurant to the platform.",
      icon: Plus,
      path: "/owner/restaurants/create",
    },
    {
      title: "My Restaurants",
      description: "View and manage your restaurants.",
      icon: Store,
      path: "/owner/restaurants",
    },
    {
      title: "Products",
      description: "Manage restaurant menu and products.",
      icon: Package,
      path: "/owner/products",
    },
    {
      title: "Orders",
      description: "View customer orders.",
      icon: ShoppingBag,
      path: "/owner/orders",
    },
    {
      title: "Analytics",
      description: "Track restaurant performance.",
      icon: BarChart3,
      path: "/owner/analytics",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-gradient-to-r from-pink-600 to-rose-500 p-8 text-white shadow-lg">
        <h1 className="text-3xl font-semibold">Welcome back, Owner</h1>
        <p className="mt-2 max-w-2xl text-sm text-pink-50">
          Manage your restaurants, products, and orders from one modern dashboard.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <Link
              key={card.title}
              to={card.path}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-100">
                <Icon size={28} className="text-pink-600" />
              </div>

              <h2 className="text-xl font-semibold text-gray-800">{card.title}</h2>
              <p className="mt-2 text-sm leading-6 text-gray-500">{card.description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;