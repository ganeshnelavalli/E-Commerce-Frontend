import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import AdminUsers from "./AdminUsers";
import axios from "axios";

export default function Home({ addToCart, isAdmin }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  // For adding new product
  const [newProduct, setNewProduct] = useState({ name: "", description: "", price: "" });

  // For editing product
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingData, setEditingData] = useState({ name: "", description: "", price: "" });

  const [stats, setStats] = useState(null);

  const API_URL = "/api/products/";

  // Fetch products
  const fetchProducts = () => {
    setLoading(true);
    axios
      .get(API_URL)
      .then((res) => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setError("Failed to load products.");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Support scrolling to hash anchors like #admin-users
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 50);
      }
    }
  }, [location.hash]);

  // Load admin stats
  useEffect(() => {
    if (!isAdmin) return;
    axios.get('/api/admin/stats/').then(res => setStats(res.data)).catch(()=>{})
  }, [isAdmin])

  // Add new product
  const addProduct = () => {
    if (!newProduct.name || !newProduct.price) {
      alert("Name and Price are required");
      return;
    }
    axios
      .post(API_URL, newProduct)
      .then(() => {
        setNewProduct({ name: "", description: "", price: "" });
        fetchProducts();
      })
      .catch((err) => console.error("Error adding product:", err));
  };

  // Delete product
  const deleteProduct = (id) => {
    axios
      .delete(`${API_URL}${id}/`)
      .then(() => fetchProducts())
      .catch((err) => console.error("Error deleting product:", err));
  };

  // Start editing a product
  const startEdit = (product) => {
    setEditingProduct(product.id);
    setEditingData({ name: product.name, description: product.description, price: product.price });
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingProduct(null);
    setEditingData({ name: "", description: "", price: "" });
  };

  // Save edited product
  const saveEdit = (id) => {
    axios
      .put(`${API_URL}${id}/`, editingData)
      .then(() => {
        setEditingProduct(null);
        setEditingData({ name: "", description: "", price: "" });
        fetchProducts();
      })
      .catch((err) => console.error("Error updating product:", err));
  };

  if (loading) return <p>Loading products...</p>;
  if (error) return <p className="text-danger">{error}</p>;

  return (
    <div className="container">
      {isAdmin && (
        <div className="mb-3">
          {/* Admin-only sections (global sidebar already present) */}
            <a id="admin-users" />
            {stats && stats.success && (
              <div className="row g-3 mb-3">
                <div className="col-sm-6 col-lg-4"><div className="card p-3 shadow-sm"><div className="text-muted">Products</div><div className="h4 mb-0">{stats.products}</div></div></div>
                <div className="col-sm-6 col-lg-4"><div className="card p-3 shadow-sm"><div className="text-muted">Users</div><div className="h4 mb-0">{stats.users}</div></div></div>
                <div className="col-sm-6 col-lg-4"><div className="card p-3 shadow-sm"><div className="text-muted">Admins</div><div className="h4 mb-0">{stats.admins}</div></div></div>
                <div className="col-sm-6 col-lg-4"><div className="card p-3 shadow-sm"><div className="text-muted">Carts</div><div className="h4 mb-0">{stats.carts}</div></div></div>
                <div className="col-sm-6 col-lg-4"><div className="card p-3 shadow-sm"><div className="text-muted">Cart Items</div><div className="h4 mb-0">{stats.cart_items}</div></div></div>
              </div>
            )}
            <AdminUsers />
        </div>
      )}

      {isAdmin && (
        <div className="p-4 rounded-3 mb-4" style={{ background: "linear-gradient(90deg,#f8fafc,#fff)" }}>
          <h2>Add New Product</h2>
          <div className="row g-2 mb-3">
            <div className="col-md-3">
              <input type="text" className="form-control" placeholder="Name" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} />
            </div>
            <div className="col-md-4">
              <input type="text" className="form-control" placeholder="Description" value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} />
            </div>
            <div className="col-md-2">
              <input type="number" className="form-control" placeholder="Price" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} />
            </div>
            <div className="col-md-3">
              <button className="btn btn-primary w-100" onClick={addProduct}>Add Product</button>
            </div>
          </div>
        </div>
      )}

      {/* Product List */}
      <div className="row g-3">
        {products.length === 0 ? (
          <p>No products available.</p>
        ) : (
          products.map((p) => (
            <div key={p.id} className="col-sm-6 col-lg-3">
              <div className="card h-100 shadow-sm">
                <div className="card-body d-flex flex-column">
                  <div className="card-img-placeholder"></div>

                  {editingProduct === p.id ? (
                    <>
                      {/* Edit Form */}
                      <input type="text" className="form-control mb-2" value={editingData.name} onChange={(e) => setEditingData({ ...editingData, name: e.target.value })} />
                      <input type="text" className="form-control mb-2" value={editingData.description} onChange={(e) => setEditingData({ ...editingData, description: e.target.value })} />
                      <input type="number" className="form-control mb-3" value={editingData.price} onChange={(e) => setEditingData({ ...editingData, price: e.target.value })} />
                      <div className="d-flex justify-content-between mt-auto">
                        <button className="btn btn-sm btn-success" onClick={() => saveEdit(p.id)}>Save</button>
                        <button className="btn btn-sm btn-secondary" onClick={cancelEdit}>Cancel</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <h5 className="card-title">{p.name}</h5>
                      <p className="card-text">{p.description}</p>
                      <div className="mt-auto d-flex justify-content-between align-items-center">
                        <strong className="text-primary">${p.price}</strong>
                        <div>
                          <button className="btn btn-sm btn-success me-1" onClick={() => addToCart && addToCart(p)}>Add</button>
                          {isAdmin && (
                            <>
                              <button className="btn btn-sm btn-warning me-1" onClick={() => startEdit(p)}>Edit</button>
                              <button className="btn btn-sm btn-danger" onClick={() => deleteProduct(p.id)}>Delete</button>
                            </>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
