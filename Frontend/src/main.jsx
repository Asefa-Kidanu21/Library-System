
import React from "react";
import ReactDOM from "react-dom/client";
import { ClerkProvider } from "@clerk/react";

import App from "./App.jsx";
import ClerkTokenProvider from "./components/ClerkTokenProvider.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ClerkProvider
      publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}
      unsafe_disableDevelopmentModeConsoleWarning={true}
    >
      <ClerkTokenProvider />
      <App />
    </ClerkProvider>
  </React.StrictMode>
);
