import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// components
import Login from "./components/Login";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";
import Home from "./components/Home";
import Products from "./components/Products";
import Cart from "./components/Cart";
import Profile from "./components/Profile";
import axios from "axios";

export default function App() {
  const [auth, setAuth] = useState(false); // login state
  const [isAdmin, setIsAdmin] = useState(false);
  const [cartCount, setCartCount] = useState(0); // server cart count
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const API_BASE = "/api/"; // use Vite proxy to keep same-site cookies

  axios.defaults.withCredentials = true;
  // ensure CSRF header is sent on all requests
  axios.interceptors.request.use((config) => {
    const token = getCSRFToken();
    if (token) config.headers = { ...(config.headers || {}), 'X-CSRFToken': token };
    return config;
  });

  const getCSRFToken = () => {
    const name = "csrftoken";
    const cookies = document.cookie.split(";").map(c => c.trim());
    for (let cookie of cookies) {
      if (cookie.startsWith(name + "=")) {
        return decodeURIComponent(cookie.substring(name.length + 1));
      }
    }
    return null;
  };

  // Add to cart on server
  async function addToCart(product) {
    try {
      const res = await axios.post(
        API_BASE + "cart/",
        { product_id: product.id, quantity: 1 },
        {}
      );
      if (res.data?.success) {
        // fetch cart to update count
        const cartRes = await axios.get(API_BASE + "cart/");
        const count = cartRes.data.items.reduce((s, i) => s + i.quantity, 0);
        setCartCount(count);
      }
    } catch (e) {
      if (e.response?.status === 403 || e.response?.status === 401) {
        alert('Please login first.');
      }
      console.error("Failed to add to cart", e);
    }
  }

  // Clear all items on server
  async function clearCart() {
    try {
      const csrfToken = getCSRFToken();
      await axios.delete(API_BASE + "cart/", { headers: { "X-CSRFToken": csrfToken } });
      setCartCount(0);
    } catch (e) {
      console.error("Failed to clear cart", e);
    }
  }

  // When auth becomes true, load session + cart
  useEffect(() => {
    const load = async () => {
      try {
        const sess = await axios.get(API_BASE + 'session/');
        setAuth(!!sess.data.is_authenticated);
        setIsAdmin(!!sess.data.is_admin);
        if (!sess.data.is_authenticated) { setCartCount(0); return; }
        const res = await axios.get(API_BASE + "cart/");
        const count = res.data.items.reduce((s, i) => s + i.quantity, 0);
        setCartCount(count);
      } catch (_) { setCartCount(0); }
    };
    load();
  }, [auth]);

  // Track viewport for responsive sidebar behavior
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 991.98px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener ? mq.addEventListener('change', update) : mq.addListener(update);
    // Initial preference: open on desktop, closed on mobile
    setSidebarOpen(!mq.matches);
    return () => {
      mq.removeEventListener ? mq.removeEventListener('change', update) : mq.removeListener(update);
    };
  }, []);

  // Close sidebar with Escape key
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setSidebarOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return auth ? (
    <div className="app-root">
      {/* Navbar shows cart count, sidebar toggle and logout */}
      <Navbar
        setAuth={setAuth}
        cartCount={cartCount}
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
        sidebarOpen={sidebarOpen}
      />

      {/* Main layout: sidebar + content */}
      <div className={`layout container-fluid ${sidebarOpen ? '' : 'sidebar-closed'}`}>
        <aside className={`sidebar-col ${sidebarOpen ? "open" : ""}`}>
          <Sidebar isAdmin={isAdmin} onNavigate={() => { if (isMobile) setSidebarOpen(false); }} />
        </aside>
        <main className="content-col">
          <div className="container py-4">
            <Routes>
              <Route path="/home" element={<Home addToCart={addToCart} isAdmin={isAdmin} />} />
              <Route path="/products" element={<Products addToCart={addToCart} isAdmin={isAdmin} />} />
              <Route
                path="/cart"
                element={<Cart isAuth={auth} clearCart={clearCart} />}
              />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<Navigate to="/home" />} />
            </Routes>
          </div>
        </main>
      </div>

      {/* Backdrop for mobile when sidebar is open */}
      {isMobile && sidebarOpen && (
        <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* Global footer */}
      <Footer />
    </div>
  ) : (
    <Login setAuth={setAuth} />
  );
}
