import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Ensure the DOM is fully loaded before rendering
document.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    console.error("Root element not found!");
    return;
  }
  
  const root = createRoot(rootElement);
  root.render(<App />);
});
