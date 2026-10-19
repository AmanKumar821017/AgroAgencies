import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { DeliveryProvider } from "./context/DeliveryContext";

import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <DeliveryProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </DeliveryProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);