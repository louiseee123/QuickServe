import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { FileText, ChevronDown, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import logo from "./../Assets/QSLogo.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export default function Nav() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  const links = [
    { href: "/", label: "Home", icon: <FileText className="h-4 w-4" /> },
    { href: "/request", label: "Request Document", icon: <FileText className="h-4 w-4" /> },
    ...(user?.role === "user"
      ? [{ href: "/my-requests", label: "My Requests", icon: <FileText className="h-4 w-4" /> }]
      : []),
    ...(user?.role === "admin"
      ? [
          {
            href: "/admin/pending-approvals",
            label: "Pending Approvals",
            icon: <FileText className="h-4 w-4" />,
          },
          { href: "/admin", label: "Dashboard", icon: <FileText className="h-4 w-4" /> },
        ]
      : []),
  ];

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!user) return null;

  return (
    <motion.header
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300",
        hasScrolled
          ? "bg-[#0a1a2f]/95 backdrop-blur-lg border-b border-white/10 shadow-lg"
          : "bg-[#0a1a2f]/80 backdrop-blur-lg"
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
    >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/">
            <motion.a
              className="flex items-center gap-3 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <img src={logo} alt="QuickServe Logo" className="h-10 w-auto" />
              <span
                className={cn(
                  "text-2xl font-bold transition-colors",
                  "text-white"
                )}
              >
                QuickServe
              </span>
            </motion.a>
          </Link>

          <div className="hidden md:flex items-center gap-2">
            {links.map((link) => (
              <Link key={link.href} href={link.href}>
                <motion.a
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                    location === link.href
                      ? "bg-black/20 text-white"
                      : "text-slate-300 hover:bg-black/20 hover:text-white"
                  )}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {link.icon}
                  {link.label}
                </motion.a>
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "flex items-center gap-2 h-12 px-4 rounded-full border transition-colors",
                      "border-white/20 bg-white/10 hover:bg-white/20 text-white"
                    )}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="font-medium bg-slate-200 text-slate-800">
                        {user.email.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">
                      {user.email}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </motion.div>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 bg-white/80 backdrop-blur-lg border border-slate-200 rounded-xl shadow-2xl"
                align="end"
              >
                <DropdownMenuLabel className="p-3">
                  <p className="text-sm font-medium text-slate-800">{user.email}</p>
                  <p className="text-xs text-slate-500">{user.role}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-200" />
                <DropdownMenuItem
                  className="text-red-500 hover:bg-red-500/10 p-3 cursor-pointer focus:bg-red-500/10 focus:text-red-600"
                  onClick={() => logout()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <motion.button
            className={cn(
              "md:hidden p-2 rounded-lg border transition-colors",
              "border-white/20 bg-white/10 text-white"
            )}
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </motion.button>
        </div>

        <AnimatePresence>
          {isMobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className={cn(
                  "md:hidden border-t",
                  "border-white/20"
              )}
            >
              <div className="pt-2 pb-6 space-y-2">
                {links.map((link) => (
                  <Link key={link.href} href={link.href}>
                    <motion.a
                      className={cn(
                        "block px-4 py-3 rounded-lg font-medium flex items-center gap-3 transition-colors",
                        location === link.href
                          ? "bg-black/20 text-white"
                          : "text-slate-300 hover:bg-black/20 hover:text-white"
                      )}
                      onClick={() => setIsMobileOpen(false)}
                    >
                      {link.icon}
                      {link.label}
                    </motion.a>
                  </Link>
                ))}

                <div className="pt-4 mt-4 border-t border-white/20">
                    <div className="flex items-center gap-3 px-4 py-2">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback className="font-medium bg-slate-200 text-slate-800">
                                {user.email.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <p className={cn("font-medium", "text-white")}>{user.email}</p>
                            <p className={cn("text-sm", "text-slate-300")}>{user.role}</p>
                        </div>
                    </div>
                     <motion.button
                        className="w-full mt-3 px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2 bg-red-500/20 text-red-300 hover:bg-red-500/30"
                        onClick={() => {
                          logout();
                          setIsMobileOpen(false);
                        }}
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  );
}
