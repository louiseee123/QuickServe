
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { FileText, ChevronDown, LogOut, Menu, X, LayoutDashboard, FileCheck, CreditCard } from "lucide-react";
import useAuth from "@/hooks/use-auth";
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
import { useState } from "react";

export default function Nav() {
  const [location, setLocation] = useLocation();
  const { user, logout, isAdmin } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const userLinks = [
    { href: "/", label: "Home", icon: <FileText className="h-4 w-4" /> },
    { href: "/my-requests", label: "My Requests", icon: <FileText className="h-4 w-4" /> },
    { href: "/request", label: "Request Document", icon: <FileText className="h-4 w-4" /> },
  ];

  const adminLinks = [
    { href: "/", label: "Home", icon: <FileText className="h-4 w-4" /> },
    { href: "/admin/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
    { href: "/admin/pending-approvals", label: "Pending Approvals", icon: <FileCheck className="h-4 w-4" /> },
    { href: "/admin/ongoing-requests", label: "Ongoing Requests", icon: <CreditCard className="h-4 w-4" /> },
  ];

  const links = isAdmin ? adminLinks : userLinks;

  if (!user) return null;

  return (
    <motion.header
      className="fixed top-0 w-full z-50 bg-blue-900/80 backdrop-blur-lg border-b border-white/10 shadow-xl"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
    >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/">
            <motion.div
              className="flex items-center gap-3 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <img src={logo} alt="QuickServe Logo" className="h-10 w-auto" />
              <span className="text-xl font-bold text-white transition-colors">
                QuickServe
              </span>
            </motion.div>
          </Link>

          <div className="hidden md:flex items-center gap-2">
            {links.map((link) => (
              <Link key={link.href} href={link.href}>
                <motion.div
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                    location === link.href
                      ? "bg-white/10 text-white"
                      : "text-blue-100 hover:bg-white/5"
                  )}
                  whileHover={{ y: -2, scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {link.icon}
                  {link.label}
                </motion.div>
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.div whileHover={{ scale: 1.05 }}>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 h-12 px-4 rounded-full transition-colors border-white/20 bg-white/5 hover:bg-white/10 text-white"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar || undefined} />
                      <AvatarFallback className="font-medium bg-white/10 text-blue-100">
                        {user.email.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-white transition-colors">
                      {user.email}
                    </span>
                    <ChevronDown className="h-4 w-4 text-blue-100 transition-colors" />
                  </Button>
                </motion.div>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 bg-blue-800/90 backdrop-blur-lg border-white/10 text-white mt-2 rounded-xl shadow-xl"
                align="end"
              >
                <DropdownMenuLabel className="p-3">
                  <p className="text-sm font-medium text-white truncate">{user.email}</p>
                  <p className="text-xs text-blue-200 capitalize">{user.role}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                  className="text-red-300 focus:bg-red-500/50 focus:text-white p-3 cursor-pointer text-sm font-medium"
                  onClick={() => {
                    logout();
                    setLocation('/auth');
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <motion.button
            className="md:hidden p-2 rounded-lg border text-white border-white/20 transition-colors"
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
              className="md:hidden border-t border-white/10 pb-6"
            >
              <div className="pt-2 pb-6 space-y-2">
                {links.map((link) => (
                  <Link key={link.href} href={link.href}>
                    <motion.div
                      className={cn(
                        "block px-4 py-3 rounded-lg font-medium flex items-center gap-3 transition-colors",
                        location === link.href
                          ? "bg-white/10 text-white"
                          : "text-blue-100 hover:bg-white/5"
                      )}
                      onClick={() => setIsMobileOpen(false)}
                    >
                      {link.icon}
                      {link.label}
                    </motion.div>
                  </Link>
                ))}

                <div className="pt-4 mt-4 border-t border-white/10">
                    <div className="flex items-center gap-3 px-4 py-2">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={user.avatar || undefined} />
                            <AvatarFallback className="font-medium bg-white/10 text-blue-100">
                                {user.email.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-medium text-white truncate">{user.email}</p>
                            <p className="text-sm text-blue-200 capitalize">{user.role}</p>
                        </div>
                    </div>
                     <motion.button
                        className="w-full mt-3 px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2 bg-red-400/80 text-white"
                        onClick={() => {
                          logout();
                          setLocation('/auth');
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
