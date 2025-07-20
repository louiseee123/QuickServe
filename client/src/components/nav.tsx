import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { FileText, ChevronDown, LogOut, Menu, X, User, Settings, HelpCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import logo from "./../Assets/QSLogo.png"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export default function Nav() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const links = [
    { href: "/", label: "Home", icon: <FileText className="h-4 w-4" /> },
    { href: "/request", label: "Request Document", icon: <FileText className="h-4 w-4" /> },
    ...(user?.role === "user" ? [{ href: "/my-requests", label: "My Requests", icon: <FileText className="h-4 w-4" /> }] : []),
    ...(user?.role === "admin" ? [
      { href: "/admin/pending-approvals", label: "Pending Approvals", icon: <FileText className="h-4 w-4" /> },
      { href: "/admin", label: "Dashboard", icon: <FileText className="h-4 w-4" /> }
    ] : []),
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!user) return null;

  return (
    <motion.header 
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300",
        scrolled ? "bg-white shadow-lg" : "bg-[#0056b3]"
      )}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          <Link href="/">
            <motion.a 
              className="flex items-center gap-3 cursor-pointer"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <img src={logo} alt="QuickServe Logo" className="h-8 w-auto" />
              <span className={cn(
                "text-2xl font-bold",
                scrolled ? "text-[#003366]" : "text-white"
              )}>
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
                    "px-5 py-2.5 rounded-lg text-sm font-medium transition-all mx-1 flex items-center gap-2",
                    location === link.href 
                      ? scrolled 
                        ? "text-white bg-[#0056b3]" 
                        : "text-white bg-[#003366]"
                      : scrolled
                        ? "text-[#003366] hover:text-white hover:bg-[#0056b3]" 
                        : "text-blue-100 hover:text-white hover:bg-[#003366]"
                  )}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {link.icon}
                  {link.label}
                </motion.a>
              </Link>
            ))}
          </div>

          {/* User Dropdown */}
          <div className="hidden md:flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    variant="ghost" 
                    className={cn(
                      "flex items-center gap-2 h-12 px-4 rounded-xl border",
                      scrolled 
                        ? "bg-white hover:bg-blue-50 border-[#0056b3] text-[#003366]"
                        : "bg-[#003366] hover:bg-[#004080] border-white text-white"
                    )}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className={cn(
                        "font-medium",
                        scrolled ? "bg-[#0056b3] text-white" : "bg-white text-[#003366]"
                      )}>
                        {user.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">
                      {user.username}
                    </span>
                    <ChevronDown className={cn("h-4 w-4", scrolled ? "text-[#003366]" : "text-blue-100")} />
                  </Button>
                </motion.div>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                className="w-56 bg-white border border-[#0056b3] rounded-xl shadow-xl"
                align="end"
              >
                <DropdownMenuLabel className="p-3 bg-[#0056b3] text-white rounded-t-lg">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user.username}</p>
                    <p className="text-xs text-blue-100">{user.role}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-blue-100" />
                <DropdownMenuGroup>
                  <DropdownMenuItem className="text-[#003366] hover:bg-blue-50 p-3 cursor-pointer">
                    <User className="mr-2 h-4 w-4 text-[#0056b3]" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-[#003366] hover:bg-blue-50 p-3 cursor-pointer">
                    <Settings className="mr-2 h-4 w-4 text-[#0056b3]" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="bg-blue-100" />
                <DropdownMenuItem
                  className="text-red-600 hover:bg-blue-50 p-3 cursor-pointer"
                  onClick={() => logout()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu Button */}
          <motion.button 
            className={cn(
              "md:hidden p-2 rounded-lg border",
              scrolled 
                ? "bg-white border-[#0056b3] text-[#003366]" 
                : "bg-[#003366] border-white text-white"
            )}
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </motion.button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "md:hidden border-t",
                scrolled 
                  ? "bg-white border-[#0056b3]" 
                  : "bg-[#003366] border-white"
              )}
            >
              <div className="pt-2 pb-6 space-y-1">
                {links.map((link) => (
                  <Link key={link.href} href={link.href}>
                    <motion.a
                      className={cn(
                        "block px-4 py-3 rounded-lg mx-2 font-medium flex items-center gap-3",
                        location === link.href 
                          ? scrolled
                            ? "text-white bg-[#0056b3]"
                            : "text-white bg-[#004080]"
                          : scrolled
                            ? "text-[#003366] hover:bg-blue-50"
                            : "text-blue-100 hover:bg-[#004080] hover:text-white"
                      )}
                      onClick={() => setIsMobileOpen(false)}
                      whileTap={{ scale: 0.98 }}
                    >
                      {link.icon}
                      {link.label}
                    </motion.a>
                  </Link>
                ))}

                {/* Mobile User Menu */}
                <div className={cn(
                  "px-4 py-3 mt-2 border-t",
                  scrolled ? "border-[#0056b3]" : "border-white"
                )}>
                  <div className="flex items-center gap-3 py-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className={cn(
                        "font-medium",
                        scrolled ? "bg-[#0056b3] text-white" : "bg-white text-[#003366]"
                      )}>
                        {user.username.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className={cn("font-medium", scrolled ? "text-[#003366]" : "text-white")}>
                        {user.username}
                      </p>
                      <p className={cn("text-sm", scrolled ? "text-[#0056b3]" : "text-blue-100")}>
                        {user.role}
                      </p>
                    </div>
                  </div>
                  <motion.button
                    className={cn(
                      "w-full mt-2 px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2",
                      scrolled
                        ? "text-red-600 hover:bg-blue-50"
                        : "text-red-300 hover:bg-[#004080]"
                    )}
                    onClick={() => {
                      logout();
                      setIsMobileOpen(false);
                    }}
                    whileTap={{ scale: 0.98 }}
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