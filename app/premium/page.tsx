"use client";

import { motion } from "framer-motion";

export default function Premium() {
  const plans = [
    { name: "Elite", price: "₹24,999", period: "/yr", features: ["Full optimization engine", "Unlimited report downloads", "Vault access (10GB)", "Email concierge"] },
    { name: "Sovereign", price: "₹99,999", period: "/yr", features: ["All Elite features", "Direct analyst consultation", "Unlimited vault storage", "Exclusive card invitations", "24/7 Global concierge"] },
  ];

  return (
    <div className="pt-32 pb-24 px-12 max-w-[1440px] mx-auto min-h-screen">
      <header className="mb-24 text-center">
        <h1 className="font-display-xl text-display-xl text-on-surface mb-6">Premium Access</h1>
        <p className="font-body-lg text-body-lg text-slate-400 max-w-2xl mx-auto italic font-newsreader">Elevate your financial management to the highest institutional standards.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 max-w-5xl mx-auto">
        {plans.map((plan, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className={`glass-card p-16 rounded-lg relative overflow-hidden flex flex-col justify-between ${i === 1 ? 'border-primary ring-1 ring-primary/30' : ''}`}
          >
            {i === 1 && <div className="absolute top-10 right-[-35px] bg-primary text-on-primary px-12 py-1 rotate-45 font-label-sm uppercase tracking-widest text-xs">Recommended</div>}
            <div>
              <h2 className="text-4xl font-headline-md mb-2 text-on-surface">{plan.name}</h2>
              <div className="flex items-baseline gap-2 mb-12">
                <span className="text-5xl font-bold text-primary">{plan.price}</span>
                <span className="text-slate-500">{plan.period}</span>
              </div>
              <ul className="space-y-6 mb-12">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-4 text-slate-300">
                    <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <button className={`w-full py-5 rounded-full font-label-sm uppercase tracking-[0.2em] transition-all duration-300 ${i === 1 ? 'gold-gradient text-on-primary' : 'border border-primary text-primary hover:bg-primary/10'}`}>
              Select {plan.name}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
