import { ArrowUpRight, Code2, ShieldCheck, Sparkles } from "lucide-react";

const highlights = [
  {
    icon: Sparkles,
    title: "Built for discovery",
    text: "Find restaurants, menus, offers, and delivery options in one simple flow.",
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

const AboutUs = () => {
  return (
    <section id="about" className="relative overflow-hidden bg-gray-950 py-20 text-white sm:py-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(236,72,153,0.25),transparent_35%),radial-gradient(circle_at_10%_90%,rgba(37,99,235,0.2),transparent_35%)]" />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-pink-400">
              About us
            </p>
            <h2 className="mt-4 max-w-2xl text-4xl font-black leading-tight sm:text-5xl">
              Good food should feel close, clear, and easy.
            </h2>
            <p className="mt-6 max-w-xl text-base leading-8 text-gray-300">
              FoodPanda brings customers, restaurants, and riders together in one
              connected food delivery experience. From the first search to the
              final hand-off, every part of the journey is designed to feel simple.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="/#about"
                className="inline-flex items-center gap-2 rounded-full bg-pink-600 px-5 py-3 text-sm font-bold transition hover:bg-pink-500"
              >
                Meet the creator
                <ArrowUpRight size={17} />
              </a>
              <span className="text-sm text-gray-400">A MERN project built for everyday ordering</span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {highlights.map(({ icon: Icon, title, text }) => (
              <article
                key={title}
                className="border-l-2 border-pink-500/70 bg-white/5 p-5 backdrop-blur-sm"
              >
                <Icon className="text-pink-400" size={22} />
                <h3 className="mt-4 text-lg font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-400">{text}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-16 border-t border-white/10 pt-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">
            Created by
          </p>
          <div className="mt-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:gap-4">
            <p className="text-2xl font-black">Muhammad Junaid Zafar</p>
            <p className="text-sm font-semibold text-pink-300">Full Stack Developer (MERN)</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
