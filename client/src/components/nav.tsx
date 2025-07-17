import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { FileText, ChevronDown, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export default function Nav() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const links = [
    { href: "/", label: "Home" },
    { href: "/request", label: "Request Document" },
    ...(user?.role === "user" ? [{ href: "/my-requests", label: "My Requests" }] : []),
    ...(user?.role === "admin" ? [
      { href: "/admin/pending-approvals", label: "Pending Approvals" },
      { href: "/admin", label: "Dashboard" }
    ] : []),
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!user) return null;

  return (
    <motion.header 
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300",
        scrolled ? "bg-white shadow-lg" : "bg-white/90 backdrop-blur-sm"
      )}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/">
            <motion.a 
              className="flex items-center gap-3"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="bg-blue-600 p-2 rounded-lg shadow-md">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                QuickServe
              </span>
            </motion.a>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link key={link.href} href={link.href}>
                <motion.a
                  className={cn(
                    "px-5 py-2.5 rounded-lg text-sm font-medium transition-colors mx-1",
                    location === link.href 
                      ? "bg-blue-600 text-white shadow-md" 
                      : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                  )}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {link.label}
                </motion.a>
              </Link>
            ))}
          </div>

          {/* User Dropdown */}
          <div className="hidden md:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.div whileHover={{ scale: 1.03 }}>
                  <Button 
                    variant="ghost" 
                    className="flex items-center gap-2 h-12 px-4 rounded-full bg-blue-50 hover:bg-blue-100 border border-blue-200"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-blue-600 text-white font-medium">
                        {user.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-gray-800 font-medium">
                      {user.username}
                    </span>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </Button>
                </motion.div>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                className="w-56 rounded-xl bg-white shadow-xl border border-gray-200"
                align="end"
                forceMount
              >
                <DropdownMenuItem className="focus:bg-gray-100 p-3">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium text-gray-900">{user.username}</p>
                    <p className="text-xs text-blue-600">{user.role}</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer p-3"
                  onClick={() => logout()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 rounded-lg bg-blue-600 text-white"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
          >
            {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden"
            >
              <div className="pt-2 pb-6 space-y-2">
                {links.map((link) => (
                  <Link key={link.href} href={link.href}>
                    <motion.a
                      className={cn(
                        "block px-4 py-3 rounded-lg mx-2 font-medium",
                        location === link.href 
                          ? "bg-blue-600 text-white" 
                          : "text-gray-700 hover:bg-blue-50"
                      )}
                      onClick={() => setIsMobileOpen(false)}
                      whileTap={{ scale: 0.98 }}
                    >
                      {link.label}
                    </motion.a>
                  </Link>
                ))}
                <div className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-blue-600 text-white">
                        {user.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-900">{user.username}</p>
                      <p className="text-sm text-blue-600">{user.role}</p>
                    </div>
                  </div>
                  <button
                    className="w-full mt-4 px-4 py-2 rounded-lg text-red-600 font-medium hover:bg-red-50 flex items-center justify-center gap-2"
                    onClick={() => {
                      logout();
                      setIsMobileOpen(false);
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  );
}