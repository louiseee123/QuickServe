import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { FileText, ChevronDown, LogOut, Menu, X, DollarSign, LayoutDashboard } from "lucide-react";
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

  const commonLinks = [
    { href: "/", label: "Home", icon: <FileText className="h-4 w-4" /> },
  ];

  const userLinks = [
    { href: "/request", label: "Request Document", icon: <FileText className="h-4 w-4" /> },
    { href: "/my-requests", label: "My Requests", icon: <FileText className="h-4 w-4" /> },
  ];

  const adminLinks = [
    {
      href: "/admin/dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      href: "/admin/pending-approvals",
      label: "Pending Approvals",
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
        href: "/admin/payment-logs",
        label: "Payment Logs",
        icon: <DollarSign className="h-4 w-4" />,
    }
  ];

  const links = [
      ...commonLinks,
      ...(user?.role === 'user' ? userLinks : []),
      ...(user?.role === 'admin' ? adminLinks : []),
  ];

  if (!user) return null;

  return (
    <motion.header
      className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200/80"
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
              <span className="text-xl font-bold text-gray-800">
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
                      ? "bg-blue-100/80 text-blue-800"
                      : "text-gray-600 hover:bg-blue-50/80 hover:text-blue-800"
                  )}
                  whileHover={{ y: -2 }}
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
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 h-12 px-4 rounded-full transition-colors border-gray-200/90 hover:border-gray-300"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar || undefined} />
                      <AvatarFallback className="font-medium bg-blue-100 text-blue-700">
                        {user.email.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-gray-700">
                      {user.email}
                    </span>
                    <ChevronDown className="h-4 w-4 text-gray-600" />
                  </Button>
                </motion.div>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56"
                align="end"
              >
                <DropdownMenuLabel className="p-3">
                  <p className="text-sm font-medium text-gray-800">{user.email}</p>
                  <p className="text-xs text-gray-500">{user.role}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 focus:bg-red-50 focus:text-red-700 p-3 cursor-pointer"
                  onClick={() => logout()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <motion.button
            className="md:hidden p-2 rounded-lg border text-gray-700 border-gray-200/90"
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
              className="md:hidden border-t border-gray-200/80"
            >
              <div className="pt-2 pb-6 space-y-2">
                {links.map((link) => (
                  <Link key={link.href} href={link.href}>
                    <motion.div
                      className={cn(
                        "block px-4 py-3 rounded-lg font-medium flex items-center gap-3 transition-colors",
                        location === link.href
                          ? "bg-blue-100/80 text-blue-800"
                          : "text-gray-600 hover:bg-blue-50/80 hover:text-blue-800"
                      )}
                      onClick={() => setIsMobileOpen(false)}
                    >
                      {link.icon}
                      {link.label}
                    </motion.div>
                  </Link>
                ))}

                <div className="pt-4 mt-4 border-t border-gray-200/80">
                    <div className="flex items-center gap-3 px-4 py-2">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={user.avatar || undefined} />
                            <AvatarFallback className="font-medium bg-blue-100 text-blue-700">
                                {user.email.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-medium text-gray-800">{user.email}</p>
                            <p className="text-sm text-gray-500">{user.role}</p>
                        </div>
                    </div>
                     <motion.button
                        className="w-full mt-3 px-4 py-3 rounded-lg font-medium flex items-center justify-center gap-2 bg-red-100/80 text-red-700"
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
