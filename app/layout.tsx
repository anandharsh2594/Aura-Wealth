import type { Metadata } from "next";
import { Manrope, Newsreader } from "next/font/google";
import "./globals.css";
import { AdvisorProvider } from "./explore/components/AICardAdvisor/AdvisorContext";
import AICardAdvisor from "./explore/components/AICardAdvisor/AICardAdvisor";
import FloatingAdvisorButton from "./explore/components/AICardAdvisor/FloatingAdvisorButton";
import TopNav from "./components/TopNav";

const manrope = Manrope({ 
  subsets: ["latin"], 
  variable: "--font-manrope",
  weight: ["300", "400", "600", "700"]
});

const newsreader = Newsreader({ 
  subsets: ["latin"], 
  variable: "--font-newsreader",
  style: ["normal", "italic"],
  weight: ["300", "400", "600", "700"],
  adjustFontFallback: false
});

export const metadata: Metadata = {
  title: "Aura Wealth | Elite Wealth Management",
  description: "Unlock the true potential of your financial identity with institutional-grade credit optimization.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" />
      </head>
      <body className={`${manrope.variable} ${newsreader.variable} font-body-md bg-background text-on-background selection:bg-primary-container selection:text-on-primary-container`}>
        <AdvisorProvider>
          {/* Ambient Elements */}
          <div className="fixed top-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-primary-container floating-glow -z-10" />
          <div className="fixed bottom-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-secondary floating-glow -z-10" />
          
          {/* TopNavBar */}
          <TopNav />

          {children}

          {/* Footer */}
          <footer className="w-full border-t border-amber-900/30 bg-slate-950 mt-section-gap">
            <div className="flex flex-col items-center gap-8 py-20 px-16 w-full">
              <div className="text-amber-500 font-bold text-xl font-headline-md tracking-[0.3em] uppercase">
                Aura Wealth
              </div>
              <div className="text-slate-600 font-body-md text-xs uppercase tracking-[0.2em] text-center max-w-lg leading-relaxed">
                © 2024 Aura Wealth Management. Private & Confidential.
              </div>
            </div>
          </footer>

          <AICardAdvisor />
          <FloatingAdvisorButton />
        </AdvisorProvider>
      </body>
    </html>
  );
}
