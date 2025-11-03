
import { AnimatePresence, motion } from "framer-motion";
import { useLocation } from "wouter";
import Footer from "@/components/footer";

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
  duration: 0.5,
};

export default function FooterOnlyLayout({ children }: { children: React.ReactNode }) {
    const [location] = useLocation();

    return (
        <div className="min-h-screen flex flex-col bg-transparent relative overflow-hidden">
          <main className="flex-1 w-full z-0 overflow-hidden mb-24">
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
