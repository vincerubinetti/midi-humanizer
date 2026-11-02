import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "@/App";

console.debug({ env: import.meta.env });

/** render app entrypoint */
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
