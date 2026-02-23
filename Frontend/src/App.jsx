import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProductProvider } from "./context/ProductContext";

// Layout
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProductDetail from "./pages/ProductDetail";
import SellPage from "./pages/SellPage";
import MyAds from "./pages/MyAds";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

function App() {
  return (
    /**
     * Provider order matters:
     * AuthProvider wraps everything so auth state is available everywhere
     * ProductProvider is inside so it can access auth if needed
     */
    <AuthProvider>
      <ProductProvider>
        <BrowserRouter>
          {/* Navbar appears on every page */}
          <Navbar />

          <main className="container">
            <Routes>
              {/* ── Public Routes — anyone can visit ── */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/product/:id" element={<ProductDetail />} />

              {/* ── Protected Routes — must be logged in ── */}
              <Route path="/sell" element={
                // Only sellers and admins can post ads
                <PrivateRoute allowedRoles={["seller", "admin"]}>
                  <SellPage />
                </PrivateRoute>
              } />

              <Route path="/my-ads" element={
                <PrivateRoute>
                  <MyAds />
                </PrivateRoute>
              } />

              <Route path="/profile" element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              } />

              {/* ── 404 — catch all unmatched routes ── */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </BrowserRouter>
      </ProductProvider>
    </AuthProvider>
  );
}

export default App;