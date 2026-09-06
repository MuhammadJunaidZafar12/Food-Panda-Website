import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Bike,
  Code2,
  ShieldCheck,
  Sparkles,
  Store,
  Users,
} from "lucide-react";
import StaticPageLayout from "../../components/layout/StaticPageLayout";

const highlights = [
  {
    icon: Sparkles,
    title: "Built for discovery",
    text: "Find restaurants, menus, and delivery options in one simple flow.",
  },
  {
    icon: ShieldCheck,
    title: "Designed for trust",
    text: "Clear order tracking and reliable status updates keep every delivery visible.",
  },
  {
    icon: Code2,
    title: "Made with care",
    text: "A focused MERN experience shaped around real customers, owners, and riders.",
  },
];

const AboutPage = () => {
  return (
    <StaticPageLayout
      title="About FoodPanda"
      subtitle="We connect hungry customers with great local restaurants and reliable riders — fast, simple, and transparent."
    >
      <section className="space-y-4 text-gray-600">
        <p className="leading-7">
          FoodPanda is a food delivery platform built to make ordering from your
          favourite restaurants effortless. Whether you are craving fast food,
          desi cuisine, pizza, or desserts, you can browse nearby restaurants,
          explore menus, place orders, and track deliveries in real time.
        </p>
        <p className="leading-7">
          Our mission is to bring good food closer to everyone — with a smooth
          experience for customers, powerful tools for restaurant owners, and a
          clear workflow for delivery riders.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {highlights.map(({ icon: Icon, title, text }) => (
          <article
            key={title}
            className="rounded-2xl border border-gray-100 bg-gray-50 p-5"
          >
            <Icon className="text-pink-600" size={22} />
            <h2 className="mt-3 text-lg font-bold text-gray-900">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">{text}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-pink-50 p-5 text-center">
          <Store className="mx-auto text-pink-600" size={24} />
          <p className="mt-3 text-2xl font-black text-gray-900">500+</p>
          <p className="text-sm text-gray-600">Partner restaurants</p>
        </div>
        <div className="rounded-2xl bg-pink-50 p-5 text-center">
          <Users className="mx-auto text-pink-600" size={24} />
          <p className="mt-3 text-2xl font-black text-gray-900">50K+</p>
          <p className="text-sm text-gray-600">Happy customers</p>
        </div>
        <div className="rounded-2xl bg-pink-50 p-5 text-center">
          <Bike className="mx-auto text-pink-600" size={24} />
          <p className="mt-3 text-2xl font-black text-gray-900">30 min</p>
          <p className="text-sm text-gray-600">Average delivery</p>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-gray-50 p-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">
          Created by
        </p>
        <div className="mt-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:gap-4">
          <p className="text-2xl font-black text-gray-900">Muhammad Junaid Zafar</p>
          <p className="text-sm font-semibold text-pink-600">
            Full Stack Developer (MERN)
          </p>
        </div>
        <Link
          to="/restaurants"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-pink-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-pink-700"
        >
          Start ordering
          <ArrowUpRight size={17} />
        </Link>
      </section>
    </StaticPageLayout>
  );
};

export default AboutPage;
