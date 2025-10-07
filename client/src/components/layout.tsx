import { ReactNode } from "react";
import Nav from "./nav";
import Footer from "./footer";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Nav />
      <main className="flex-1 w-full pt-20">
        {children}
      </main>
      <Footer />
    </div>
  );
}