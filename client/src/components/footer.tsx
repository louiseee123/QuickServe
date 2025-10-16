import { motion } from "framer-motion";
import logo from "./../Assets/logocctc.png";

export default function Footer() {
  return (
    <motion.footer
      className="bg-[#0a1a2f] py-16 pt-24 relative z-10 border-t border-blue-900/50"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ 
        type: "spring",
        stiffness: 120,
        damping: 25
      }}
    >
      {/* 🌟 FIXED POSITION LOGO (NO HOVER EFFECT) 🌟 */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 p-1.5 shadow-2xl shadow-blue-500/20 z-30">
        <div className="bg-[#0a1a2f] rounded-full w-full h-full flex items-center justify-center overflow-hidden border-2 border-blue-400/30">
          <img 
            src={logo} 
            alt="CCTC Logo" 
            className="w-24 h-24 object-contain p-2"
          />
        </div>
      </div>

      {/* ✨ GLOWING FOOTER CONTENT ✨ */}
      <div className="container mx-auto px-6 relative z-20">
        {/* Floating links with subtle glow */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
          {['Contact', 'Admissions', 'Academics', 'Support'].map((item) => (
            <div key={item} className="text-center group">
              <a 
                href="#"
                className="text-blue-100 font-medium text-lg tracking-wide hover:text-white transition-colors duration-300"
              >
                {item}
              </a>
              <div className="h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent w-0 group-hover:w-full transition-all duration-500 mt-2 mx-auto" />
            </div>
          ))}
        </div>

        {/* Diamond divider */}
        <div className="my-12 flex justify-center">
          <div className="h-px w-full max-w-2xl bg-gradient-to-r from-transparent via-blue-400/30 to-transparent" />
        </div>

        {/* Copyright with static particles */}
        <div className="relative">
          <p className="text-center text-blue-300/90 text-sm">
            © {new Date().getFullYear()} Consolatrix College of Toledo City
          </p>
          <p className="text-center text-blue-400/60 text-xs mt-2">
            QuickServe Document Management System
          </p>
          <p className="text-center text-blue-400/60 text-xs mt-1">
            QuickServe Version: 1.12
          </p>
          
          {/* Static star particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(16)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-blue-400/20"
                style={{
                  width: `${Math.random() * 4 + 2}px`,
                  height: `${Math.random() * 4 + 2}px`,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  opacity: Math.random() * 0.5 + 0.3
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 🌌 BACKGROUND GLOW EFFECT 🌌 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-blue-900/20 blur-3xl" />
        <div className="absolute -bottom-60 -right-40 w-96 h-96 rounded-full bg-blue-800/15 blur-3xl" />
      </div>
    </motion.footer>
  );
}