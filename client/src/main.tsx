import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./styles/pixelart.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { SoundProvider } from "@/context/SoundContext";

// Error boundary for debugging
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  const root = document.getElementById("root");
  if (root) {
    root.innerHTML = `
      <div style="background: black; color: white; padding: 20px; font-family: monospace;">
        <h1>Application Error</h1>
        <p>Error: ${event.error?.message || 'Unknown error'}</p>
        <button onclick="window.location.reload()" 
                style="padding: 10px; background: #333; color: white; border: none; cursor: pointer;">
          Reload
        </button>
      </div>
    `;
  }
});

try {
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
} catch (error) {
  console.error('React render error:', error);
  const root = document.getElementById("root");
  if (root) {
    root.innerHTML = `
      <div style="background: black; color: white; padding: 20px; font-family: monospace;">
        <h1>React Render Error</h1>
        <p>Error: ${error instanceof Error ? error.message : 'Unknown error'}</p>
        <button onclick="window.location.reload()" 
                style="padding: 10px; background: #333; color: white; border: none; cursor: pointer;">
          Reload
        </button>
      </div>
    `;
  }
}
