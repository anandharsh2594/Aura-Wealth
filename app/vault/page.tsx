"use client";

import { motion } from "framer-motion";

export default function Vault() {
  return (
    <div className="pt-32 pb-24 px-12 max-w-[1440px] mx-auto min-h-screen">
      <header className="mb-16">
        <h1 className="font-display-xl text-display-xl text-on-surface mb-2">Secure Vault</h1>
        <p className="font-body-lg text-body-lg text-slate-400 max-w-2xl italic font-newsreader">Institutional-grade encryption for your most sensitive financial assets.</p>
      </header>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8 glass-card p-12 rounded-lg flex flex-col items-center justify-center min-h-[500px] border-dashed border-primary/20">
          <div className="relative w-32 h-32 mb-10">
            <div className="absolute inset-0 border-2 border-primary/20 rounded-full animate-ping"></div>
            <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center border border-primary">
              <span className="material-symbols-outlined text-primary text-5xl">lock</span>
            </div>
          </div>
          <h2 className="text-4xl font-headline-md mb-6 text-on-surface">Vault is Locked</h2>
          <p className="text-slate-400 max-w-md text-center mb-10">Biometric verification or 2FA hardware key required for access to secure document storage and private key management.</p>
          <div className="flex gap-6">
            <button className="gold-gradient text-on-primary px-10 py-4 rounded-full font-label-sm uppercase tracking-widest">Authenticate</button>
            <button className="border border-primary text-primary px-10 py-4 rounded-full font-label-sm uppercase tracking-widest">Register Key</button>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-8">
          <div className="glass-card p-10 rounded-lg">
            <h3 className="text-xl font-bold mb-4 text-on-surface">Compliance Log</h3>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Security Audit v2.{i}</span>
                  <span className="text-green-400 font-bold">PASSED</span>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-card p-10 rounded-lg bg-primary/5">
             <h3 className="text-xl font-bold mb-4 text-primary">Upgrade Notice</h3>
             <p className="text-sm text-on-surface/70 leading-relaxed">Sovereign tier members receive unlimited vault storage with physical redundancy in Switzerland and Singapore.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
