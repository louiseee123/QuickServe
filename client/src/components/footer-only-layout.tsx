import { ReactNode } from "react";
import Footer from "./footer";

export default function FooterOnlyLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-transparent relative overflow-hidden">
      <main className="flex-1 w-full z-0">{children}</main>
      <Footer />
    </div>
  );
}
