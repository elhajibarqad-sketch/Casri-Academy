"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, BarChart3, ChevronLeft, ChevronRight, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type HomeHeroSliderProps = {
  stats: string[][];
};

const slides = [
  {
    src: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=2200&q=82",
    alt: "Professional market dashboard with financial charts",
    eyebrow: "Structured market education",
    badge: "Live market context",
  },
  {
    src: "https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&w=2200&q=82",
    alt: "Digital cryptocurrency and blockchain visualization",
    eyebrow: "Crypto and blockchain literacy",
    badge: "Blockchain ready",
  },
  {
    src: "https://images.unsplash.com/photo-1640340434855-6084b1f4901c?auto=format&fit=crop&w=2200&q=82",
    alt: "Premium trading desk with market overview screens",
    eyebrow: "Forex and crypto curriculum",
    badge: "Premium academy",
  },
];

export function HomeHeroSlider({ stats }: HomeHeroSliderProps) {
  const [active, setActive] = useState(0);
  const current = slides[active];
  const visibleStats = useMemo(() => stats.slice(0, 3), [stats]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((value) => (value + 1) % slides.length);
    }, 7000);

    return () => window.clearInterval(timer);
  }, []);

  function previousSlide() {
    setActive((value) => (value === 0 ? slides.length - 1 : value - 1));
  }

  function nextSlide() {
    setActive((value) => (value + 1) % slides.length);
  }

  return (
    <section className="relative isolate min-h-[calc(100svh-76px)] overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.src}
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1.12 }}
            exit={{ opacity: 0, scale: 1.08 }}
            transition={{ opacity: { duration: 1.1, ease: "easeOut" }, scale: { duration: 8, ease: "easeOut" } }}
            className="absolute inset-0"
          >
            <Image
              src={current.src}
              alt={current.alt}
              fill
              priority={active === 0}
              sizes="100vw"
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,0.92)_0%,rgba(2,6,23,0.72)_42%,rgba(2,6,23,0.32)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.25),transparent_32%),linear-gradient(180deg,rgba(2,6,23,0.12),rgba(2,6,23,0.8))]" />
      </div>

      <div className="relative z-10 mx-auto grid min-h-[calc(100svh-76px)] max-w-7xl items-center gap-10 px-5 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
        <div>
          <motion.div
            key={current.eyebrow}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-cyan-200/25 bg-white/10 px-4 py-2 text-sm font-semibold text-cyan-100 shadow-2xl backdrop-blur"
          >
            <Sparkles size={16} /> {current.eyebrow}
          </motion.div>
          <h1 className="mt-8 max-w-4xl text-5xl font-black tracking-tight text-white md:text-7xl">
            Learn markets with structure, security, and calm execution.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200">
            Casri Academy is a premium online academy for Forex and Cryptocurrency education: preview lessons,
            paid tracks, live market context, progress, certificates, and secure course access.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/courses" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-slate-950 shadow-2xl transition hover:-translate-y-0.5 hover:bg-cyan-200">
              Explore courses <ArrowRight size={17} />
            </Link>
            <Link href="/live-market" className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-black text-white backdrop-blur transition hover:-translate-y-0.5 hover:border-cyan-200 hover:bg-cyan-300/15">
              View live market
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            {["Education only", "Secure dashboard", "Certificates"].map((badge) => (
              <span key={badge} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-200 backdrop-blur">
                <ShieldCheck className="h-3.5 w-3.5 text-cyan-200" />
                {badge}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/15 bg-white/10 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl">
          <div className="rounded-[1.5rem] bg-slate-950/72 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-cyan-200">Trading desk overview</div>
                <div className="mt-1 text-2xl font-black">Casri Live Board</div>
              </div>
              <div className="rounded-full bg-emerald-400/15 px-3 py-1 text-sm font-bold text-emerald-300">LIVE</div>
            </div>
            <div className="mt-8 h-52 overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(135deg,rgba(34,211,238,0.28),rgba(16,185,129,0.12)),repeating-linear-gradient(90deg,rgba(255,255,255,0.08)_0_1px,transparent_1px_32px)] p-5">
              <div className="mb-5 flex items-center gap-2 text-sm font-bold text-cyan-100">
                <BarChart3 className="h-4 w-4" />
                {current.badge}
              </div>
              <div className="flex h-32 items-end gap-2">
                {[34, 52, 45, 68, 58, 82, 73, 92, 78, 88, 96, 90].map((height, index) => (
                  <motion.span
                    key={`${active}-${index}`}
                    initial={{ height: "12%" }}
                    animate={{ height: `${height}%` }}
                    transition={{ duration: 0.55, delay: index * 0.035 }}
                    className="flex-1 rounded-t-xl bg-gradient-to-t from-cyan-400 to-emerald-300"
                  />
                ))}
              </div>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3">
              {visibleStats.map(([value, label]) => (
                <div key={label} className="rounded-2xl bg-white/10 p-4">
                  <div className="text-2xl font-black">{value}</div>
                  <div className="text-xs text-slate-300">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 rounded-full border border-white/15 bg-slate-950/45 px-3 py-2 backdrop-blur">
        <button onClick={previousSlide} className="grid h-9 w-9 place-items-center rounded-full text-white transition hover:bg-white/15" aria-label="Previous hero image">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          {slides.map((slide, index) => (
            <button
              key={slide.src}
              onClick={() => setActive(index)}
              className={`h-2.5 rounded-full transition-all ${active === index ? "w-8 bg-cyan-200" : "w-2.5 bg-white/45 hover:bg-white/80"}`}
              aria-label={`Show hero image ${index + 1}`}
              aria-current={active === index}
            />
          ))}
        </div>
        <button onClick={nextSlide} className="grid h-9 w-9 place-items-center rounded-full text-white transition hover:bg-white/15" aria-label="Next hero image">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10 h-24 bg-gradient-to-t from-slate-950/35 to-transparent" />
    </section>
  );
}
