import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CropDetail from "./pages/CropDetail";
import ProtectedRoute from "./components/ProtectedRoute";
import FarmerDashboard from "./pages/FarmerDashboard";
import MyOrders from "./pages/MyOrders";
import Cart from "./pages/Cart";
import BusinessRequirements from "./pages/BusinessRequirements";
import Footer from "./components/Footer";


export default function App() {
  return (
   <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/crops/:id" element={<CropDetail />} />
          <Route path="/cart" element={<Cart />} />

          <Route
            path="/farmer"
            element={
              <ProtectedRoute roles={["farmer"]}>
                <FarmerDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-orders"
            element={
              <ProtectedRoute roles={["customer", "businessman"]}>
                <MyOrders />
              </ProtectedRoute>
            }
          />

          <Route
            path="/requirements"
            element={
              <ProtectedRoute roles={["businessman"]}>
                <BusinessRequirements />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}