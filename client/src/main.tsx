
import { QueryClientProvider } from "@tanstack/react-query";
import { createRoot } from "react-dom/client";
import { Router } from "wouter";
import App from "./App.jsx";
import "./index.css";
import { queryClient } from "./lib/queryClient";

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
      <Router>
        <App />
      </Router>
  </QueryClientProvider>,
);
