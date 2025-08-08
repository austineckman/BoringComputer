import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./styles/pixelart.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { SoundProvider } from "@/context/SoundContext";

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <SoundProvider>
      <TooltipProvider>
        <Toaster />
        <App />
      </TooltipProvider>
    </SoundProvider>
  </QueryClientProvider>
);
