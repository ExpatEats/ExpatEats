import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "next-themes";

// Set Mapbox token
if (!import.meta.env.VITE_MAPBOX_ACCESS_TOKEN) {
  (window as any).VITE_MAPBOX_ACCESS_TOKEN = "pk.eyJ1IjoibWljaGFlbGVrIiwiYSI6ImNtYzBja3R5MzAwdDQya29kODdrNnNyYXQifQ._51Nw5m36McY40ID6SdWhQ";
}

createRoot(document.getElementById("root")!).render(
  <ThemeProvider attribute="class" defaultTheme="light">
    <App />
  </ThemeProvider>
);
