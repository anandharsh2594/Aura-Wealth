"use client";

import { motion } from "framer-motion";

export default function Markets() {
  const indices = [
    { name: "NIFTY 50", value: "22,475.85", change: "+1.2%", trend: "up" },
    { name: "SENSEX", value: "74,119.39", change: "+0.95%", trend: "up" },
    { name: "NASDAQ", value: "16,274.94", change: "-0.45%", trend: "down" },
    { name: "GOLD", value: "72,450.00", change: "+2.1%", trend: "up" },
  ];

  return (
    <div className="pt-32 pb-24 px-12 max-w-[1440px] mx-auto min-h-screen">
      <header className="mb-16">
        <h1 className="font-display-xl text-display-xl text-on-surface mb-2">Global Markets</h1>
        <p className="font-body-lg text-body-lg text-slate-400 max-w-2xl italic font-newsreader">Real-time institutional indices for the global wealth ecosystem.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {indices.map((idx, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-10 rounded-lg border-l-4 border-l-primary/30"
          >
            <p className="font-label-sm text-slate-400 uppercase tracking-widest mb-4">{idx.name}</p>
            <h2 className="text-4xl font-bold text-on-surface mb-2">{idx.value}</h2>
            <p className={`text-lg font-bold ${idx.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
              {idx.change}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="mt-24 glass-card p-12 rounded-lg text-center">
        <span className="material-symbols-outlined text-primary text-6xl mb-6">monitoring</span>
        <h3 className="text-3xl font-headline-md mb-4 text-on-surface">Institutional Trading Terminal</h3>
        <p className="text-slate-400 max-w-xl mx-auto mb-10">Advanced market analysis and direct execution APIs are available for Elite and Sovereign tier members only.</p>
        <button className="gold-gradient text-on-primary px-10 py-4 rounded-full font-label-sm uppercase tracking-widest">Upgrade Access</button>
      </div>
    </div>
  );
}
