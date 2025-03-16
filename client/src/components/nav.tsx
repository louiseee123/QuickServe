import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { FileText, LayoutDashboard } from "lucide-react";

export default function Nav() {
  const [location] = useLocation();

  const links = [
    { href: "/", label: "Home" },
    { href: "/request", label: "Request Document" },
    { href: "/admin", label: "Admin" },
  ];

  return (
    <header className="bg-primary text-primary-foreground">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/">
            <a className="flex items-center gap-2 font-bold text-xl">
              <FileText />
              QuickServe
            </a>
          </Link>
          <div className="flex gap-6">
            {links.map((link) => (
              <Link key={link.href} href={link.href}>
                <a
                  className={cn(
                    "transition-colors hover:text-primary-foreground/80",
                    location === link.href && "underline"
                  )}
                >
                  {link.label}
                </a>
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
}
