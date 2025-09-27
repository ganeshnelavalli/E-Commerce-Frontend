import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Cart({ isAuth, clearCart }) {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_BASE = "/api/"; // use Vite proxy to avoid cross-site

  // Set axios to always send cookies
  axios.defaults.withCredentials = true;
  axios.interceptors.request.use((config) => {
    // ensure CSRF header is present
    const token = getCSRFToken();
    if (token) config.headers = { ...(config.headers || {}), 'X-CSRFToken': token };
    return config;
  });

  // Get CSRF token from cookie
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

  // Fetch cart from API
  const fetchCart = async () => {
    if (!isAuth) return;
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(API_BASE + "cart/");
      setCart(res.data);
    } catch (err) {
      if (err.response?.status === 403 || err.response?.status === 401) {
        setError("Please login to view your cart.");
      } else {
        setError("Failed to load cart.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Update item quantity
  const updateQty = async (itemId, nextQty) => {
    try {
      const csrfToken = getCSRFToken();
      await axios.patch(API_BASE + "cart/", { item_id: itemId, quantity: nextQty }, { headers: { "X-CSRFToken": csrfToken } });
      // refresh
      const res = await axios.get(API_BASE + "cart/");
      setCart(res.data);
    } catch (e) {
      setError("Failed to update quantity");
    }
  };

  useEffect(() => {
    fetchCart();
  }, [isAuth]);

  // Clear cart
  const handleClear = async () => {
    setError("");
    try {
      const csrfToken = getCSRFToken();
      await axios.delete(API_BASE + "cart/", {
        headers: { "X-CSRFToken": csrfToken },
      });
      setCart({ ...cart, items: [], total: 0 });
      if (clearCart) clearCart();
    } catch (err) {
      setError("Failed to clear cart.");
    }
  };

  if (!isAuth) return <div>Please login to view your cart.</div>;
  if (loading) return <div>Loading cart...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!cart || cart.items.length === 0)
    return <div className="alert alert-secondary">Your cart is empty.</div>;

  return (
    <div className="container">
      <h2 className="my-3">Your Cart</h2>
      <div className="row">
        <div className="col-12">
          <div className="list-group mb-3">
            {cart.items.map((item) => (
              <div
                key={item.id}
                className="list-group-item"
              >
                <div className="d-flex justify-content-between align-items-center flex-wrap">
                  <div className="mb-2 mb-md-0">
                    <strong>{item.product_name}</strong>
                    <div className="small text-muted">
                      Qty: {item.quantity} • ₹{item.price} each
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => updateQty(item.id, item.quantity - 1)}>-</button>
                    <span className="px-2">{item.quantity}</span>
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => updateQty(item.id, item.quantity + 1)}>+</button>
                    <div className="ms-3 fw-bold text-primary">₹{item.subtotal}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="card p-3">
            <div className="d-flex justify-content-between align-items-center flex-wrap">
              <strong className="h5 mb-2 mb-md-0">Total: ₹{cart.total}</strong>
              <div className="d-flex gap-2 w-100 w-md-auto">
                <button className="btn btn-outline-danger flex-fill flex-md-grow-0" onClick={handleClear}>
                  Clear
                </button>
                <button className="btn btn-primary flex-fill flex-md-grow-0">Checkout</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
