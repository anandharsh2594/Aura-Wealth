"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TopNav() {
  const pathname = usePathname();
  const isExplore = pathname.startsWith("/explore");

  const wealthClasses = isExplore
    ? "text-slate-400 hover:text-amber-400 pb-1 font-body-md tracking-wide transition-colors duration-300"
    : "text-amber-400 border-b border-amber-400 pb-1 font-body-md tracking-wide";

  const exploreClasses = isExplore
    ? "text-amber-400 border-b border-amber-400 pb-1 font-body-md tracking-wide"
    : "text-slate-400 hover:text-amber-400 pb-1 font-body-md tracking-wide transition-colors duration-300";

  return (
    <nav className="fixed top-0 w-full border-b border-amber-500/20 bg-slate-950/60 backdrop-blur-xl z-50 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
      <div className="flex justify-between items-center px-12 py-6 max-w-[1440px] mx-auto">
        <div className="text-2xl font-light tracking-widest text-amber-500 uppercase font-headline-md">
          Aura Wealth
        </div>
        <div className="hidden md:flex gap-8">
          <Link className={wealthClasses} href="/">
            Wealth Optimizer
          </Link>
          <Link className={exploreClasses} href="/explore">
            Explore Cards
          </Link>
        </div>
        <button className="bg-primary text-on-primary px-6 py-2 rounded-full font-label-sm uppercase tracking-[0.15em] hover:shadow-[0_0_20px_rgba(242,202,80,0.4)] transition-all duration-500">
          Aura Wealth
        </button>
      </div>
    </nav>
  );
}
