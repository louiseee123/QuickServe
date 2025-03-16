import { ReactNode } from "react";
import Nav from "./nav";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
      <footer className="bg-primary/5 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Consolatrix College of Toledo City, Inc. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
