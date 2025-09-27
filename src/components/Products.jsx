import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Products({ addToCart, isAdmin }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ name: "", description: "", price: "" });

  useEffect(() => {
    axios
      .get("/api/products/") // via Vite proxy
      .then((response) => {
        console.log("API Response:", response.data); // 👈 Debug log
        setProducts(response.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setError("Failed to load products. Please try again later.");
        setLoading(false);
      });
  }, []);

  const startEdit = (p) => {
    setEditingId(p.id);
    setEditData({ name: p.name, description: p.description || "", price: p.price });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({ name: "", description: "", price: "" });
  };

  const saveEdit = async (id) => {
    try {
      await axios.put(`/api/products/${id}/`, editData);
      // refresh
      const res = await axios.get("/api/products/");
      setProducts(res.data);
      cancelEdit();
    } catch (e) {
      alert(e.response?.data?.error || "Update failed (admin only)");
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await axios.delete(`/api/products/${id}/`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      alert(e.response?.data?.error || "Delete failed (admin only)");
    }
  };

  if (loading) {
    return <p>Loading products...</p>;
  }

  if (error) {
    return <p className="text-danger">{error}</p>;
  }

  return (
    <div className="container">
      <h2 className="my-3">Products</h2>
      <div className="row g-3">
        {products.length === 0 ? (
          <p>No products available.</p>
        ) : (
          products.map((product) => (
            <div className="col-sm-6 col-lg-4 mb-3" key={product.id}>
              <div className="card h-100">
                {/* Placeholder image */}
                <div className="card-img-placeholder"></div>
                <div className="card-body d-flex flex-column">
                  {editingId === product.id ? (
                    <>
                      <input className="form-control mb-2" value={editData.name} onChange={(e)=>setEditData({...editData, name:e.target.value})} />
                      <textarea className="form-control mb-2" value={editData.description} onChange={(e)=>setEditData({...editData, description:e.target.value})} />
                      <input type="number" className="form-control mb-3" value={editData.price} onChange={(e)=>setEditData({...editData, price:e.target.value})} />
                      <div className="d-flex gap-2 mt-auto">
                        <button className="btn btn-success flex-fill" onClick={()=>saveEdit(product.id)}>Save</button>
                        <button className="btn btn-secondary flex-fill" onClick={cancelEdit}>Cancel</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <h5 className="card-title">{product.name}</h5>
                      <p className="card-text">{product.description}</p>
                      <p className="card-text fw-bold text-primary">₹{product.price}</p>
                      <div className="d-flex gap-2 mt-auto">
                        <button className="btn btn-primary flex-fill" onClick={() => addToCart(product)}>Add to Cart</button>
                        {isAdmin && (
                          <>
                            <button className="btn btn-warning btn-sm" onClick={()=>startEdit(product)}>Edit</button>
                            <button className="btn btn-danger btn-sm" onClick={()=>deleteProduct(product.id)}>Delete</button>
                          </>
                        )}
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
