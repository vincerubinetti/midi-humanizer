import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "@/App";

console.info({ env: import.meta.env });

/** render app entrypoint */
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
