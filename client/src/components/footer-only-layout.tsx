import { ReactNode } from "react";
import Footer from "./footer";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";

export default function FooterOnlyLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  const pageVariants = {
    initial: {
      opacity: 0,
      y: 20,
    },
    in: {
      opacity: 1,
      y: 0,
    },
    out: {
      opacity: 0,
      y: -20,
    },
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.4,
  };

  return (
    <div className="min-h-screen flex flex-col bg-transparent relative overflow-hidden">
      <main className="flex-1 w-full z-0 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={location}
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}
