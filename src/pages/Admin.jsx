import { useEffect, useState } from "react";

const PRODUCT_API = "https://the-veltrixx-backend.onrender.com/api/products";
const ORDER_API = "https://the-veltrixx-backend.onrender.com/api/orders/admin/all";
const UPDATE_ORDER_API = "https://the-veltrixx-backend.onrender.com/api/orders/admin/update";
const DELETE_ORDER_API = "https://the-veltrixx-backend.onrender.com/api/orders/admin/delete";
const REVIEW_API = "https://the-veltrixx-backend.onrender.com/api/reviews/admin/all";
const DELETE_REVIEW_API = "https://the-veltrixx-backend.onrender.com/api/reviews/admin/delete";
const COUPON_API = "https://the-veltrixx-backend.onrender.com/api/coupons";
const USER_API = "https://the-veltrixx-backend.onrender.com/api/users";

function Admin({ refreshProducts }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [editingProductId, setEditingProductId] = useState(null);
  const [uploading, setUploading] = useState(false);

  const token = localStorage.getItem("veltrixx_token");

  const emptyForm = {
    name: "",
    description: "",
    brand: "",
    model: "",
    category: "Phone Case",
    tags: "",
    price: "",
    comparePrice: "",
    costPrice: "",
    image: "",
    images: [],
    stock: "",
    sku: "",
    lowStockAlert: "5",
    availableModels: "",
    colorOptions: "",
    colorName: "",
    colorHex: "#000000",
    colorImage: "",
    weight: "",
    deliveryDays: "3-7 business days",
    shippingCharge: "",
    returnPolicy: "Replacement only for damaged or defective products.",
    seoTitle: "",
    seoDescription: "",
    status: "active",
    featured: false,
  };

  const emptyCouponForm = {
    code: "",
    discountType: "percentage",
    discountValue: "",
    minOrderAmount: "",
    maxDiscountAmount: "",
    usageLimit: "",
    expiryDate: "",
  };

  const [form, setForm] = useState(emptyForm);
  const [couponForm, setCouponForm] = useState(emptyCouponForm);

  const uploadImages = async (files) => {
    if (!files || files.length === 0) return [];

    const formData = new FormData();

    Array.from(files).forEach((file) => {
      formData.append("images", file);
    });

    setUploading(true);

    try {
      const res = await fetch(`${PRODUCT_API}/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message || "Image upload failed");
        return [];
      }

      return data.images || [];
    } catch (error) {
      console.log("Upload error:", error);
      alert("Image upload failed");
      return [];
    } finally {
      setUploading(false);
    }
  };

  const handleMainImagesUpload = async (e) => {
    const urls = await uploadImages(e.target.files);

    if (urls.length > 0) {
      setForm({
        ...form,
        image: urls[0],
        images: [...form.images, ...urls],
      });
    }
  };

  const handleColorImageUpload = async (e) => {
    const urls = await uploadImages(e.target.files);

    if (urls.length > 0) {
      setForm({
        ...form,
        colorImage: urls[0],
      });
    }
  };

  const fetchProducts = async () => {
    const res = await fetch(PRODUCT_API);
    const data = await res.json();
    if (data.success) setProducts(data.products || []);
  };

  const fetchOrders = async () => {
    const res = await fetch(ORDER_API, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.success) setOrders(data.orders || []);
  };

  const fetchReviews = async () => {
    const res = await fetch(REVIEW_API, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.success) setReviews(data.reviews || []);
  };

  const fetchCoupons = async () => {
    const res = await fetch(COUPON_API);
    const data = await res.json();
    if (data.success) setCoupons(data.coupons || []);
  };

  const fetchUsers = async () => {
    const res = await fetch(`${USER_API}?search=${userSearch}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (Array.isArray(data)) setUsers(data);
    else setUsers([]);
  };

  useEffect(() => {
    fetchProducts();
    fetchCoupons();
    fetchOrders();
    fetchReviews();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (activeTab === "orders") fetchOrders();
    if (activeTab === "reviews") fetchReviews();
    if (activeTab === "coupons") fetchCoupons();
    if (activeTab === "users") fetchUsers();
  }, [activeTab]);

  const parsedColors = form.colorOptions
    .split(",")
    .map((item) => {
      const [name, hex, image] = item.split("|").map((v) => v.trim());
      return { name, hex, image };
    })
    .filter((item) => item.name && item.hex && item.image);

  const addColor = () => {
    if (!form.colorName || !form.colorHex || !form.colorImage) {
      alert("Please fill color name, color and upload color image");
      return;
    }

    const newColor = `${form.colorName}|${form.colorHex}|${form.colorImage}`;

    setForm({
      ...form,
      colorOptions: form.colorOptions
        ? `${form.colorOptions}, ${newColor}`
        : newColor,
      colorName: "",
      colorHex: "#000000",
      colorImage: "",
    });
  };

  const profit = Number(form.price || 0) - Number(form.costPrice || 0);
  const margin =
    Number(form.price || 0) > 0
      ? Math.round((profit / Number(form.price)) * 100)
      : 0;

  const getProductPayload = () => ({
    name: form.name,
    description: form.description || "Premium phone case by THE VELTRIXX.",
    brand: form.brand,
    model: form.model,
    category: form.category,
    tags: form.tags
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    price: Number(form.price),
    comparePrice: Number(form.comparePrice) || 0,
    costPrice: Number(form.costPrice) || 0,
    image: form.image,
    images: form.images,
    stock: Number(form.stock) || 0,
    sku: form.sku,
    lowStockAlert: Number(form.lowStockAlert) || 5,
    availableModels: form.availableModels
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    colorOptions: parsedColors,
    weight: Number(form.weight) || 0,
    deliveryDays: form.deliveryDays,
    shippingCharge: Number(form.shippingCharge) || 0,
    returnPolicy: form.returnPolicy,
    seoTitle: form.seoTitle,
    seoDescription: form.seoDescription,
    status: form.status,
    featured: form.featured,
  });

  const handleSubmitProduct = async () => {
    if (!form.name || !form.brand || !form.model || !form.price || !form.image) {
      alert("Please fill product name, brand, model, price and image");
      return;
    }

    const url = editingProductId
      ? `${PRODUCT_API}/${editingProductId}`
      : PRODUCT_API;

    const method = editingProductId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(getProductPayload()),
    });

    const data = await res.json();

    if (!data.success) {
      alert(data.message || "Product save failed");
      return;
    }

    alert(editingProductId ? "Product updated" : "Product added");
    setForm(emptyForm);
    setEditingProductId(null);
    fetchProducts();
    if (refreshProducts) refreshProducts();
  };

  const startEditProduct = (item) => {
    setEditingProductId(item._id);

    setForm({
      ...emptyForm,
      name: item.name || "",
      description: item.description || "",
      brand: item.brand || "",
      model: item.model || "",
      category: item.category || "Phone Case",
      tags: item.tags?.join(", ") || "",
      price: item.price || "",
      comparePrice: item.comparePrice || "",
      costPrice: item.costPrice || "",
      image: item.image || "",
      images: item.images || [],
      stock: item.stock || "",
      sku: item.sku || "",
      lowStockAlert: item.lowStockAlert || "5",
      availableModels: item.availableModels?.join(", ") || "",
      colorOptions:
        item.colorOptions
          ?.map((c) => `${c.name}|${c.hex}|${c.image}`)
          .join(", ") || "",
      weight: item.weight || "",
      deliveryDays: item.deliveryDays || "3-7 business days",
      shippingCharge: item.shippingCharge || "",
      returnPolicy:
        item.returnPolicy ||
        "Replacement only for damaged or defective products.",
      seoTitle: item.seoTitle || "",
      seoDescription: item.seoDescription || "",
      status: item.status || "active",
      featured: item.featured || false,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingProductId(null);
    setForm(emptyForm);
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    const res = await fetch(`${PRODUCT_API}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    if (!data.success) {
      alert(data.message || "Product delete failed");
      return;
    }

    alert("Product deleted");
    fetchProducts();
    if (refreshProducts) refreshProducts();
  };

  const totalRevenue = orders.reduce(
    (sum, order) => sum + Number(order.total || 0),
    0
  );

  const pendingOrders = orders.filter(
    (order) =>
      order.orderStatus !== "Delivered" && order.orderStatus !== "Cancelled"
  ).length;

  const activeCoupons = coupons.filter((coupon) => coupon.isActive).length;

  const lowStockProducts = products.filter(
    (product) => Number(product.stock || 0) <= Number(product.lowStockAlert || 5)
  ).length;

  return (
    <div className="adminPage">
      <aside>
        <h2>THE VELTRIXX</h2>
        <p>Admin Dashboard</p>

        <button onClick={() => setActiveTab("dashboard")}>Dashboard</button>
        <button onClick={() => setActiveTab("products")}>Products</button>
        <button onClick={() => setActiveTab("orders")}>Manage Orders</button>
        <button onClick={() => setActiveTab("reviews")}>Reviews</button>
        <button onClick={() => setActiveTab("coupons")}>Coupons</button>
        <button onClick={() => setActiveTab("users")}>Users</button>
      </aside>

      <main>
        <div className="adminHeader">
          <div>
            <p>Admin Control Panel</p>
            <h1>{activeTab === "products" ? "Products" : "Dashboard"}</h1>
          </div>

          <button onClick={() => setActiveTab("products")}>+ Add Product</button>
        </div>

        <div className="statsGrid">
          <div>
            <h3>Total Products</h3>
            <p>{products.length}</p>
          </div>

          <div>
            <h3>Total Orders</h3>
            <p>{orders.length}</p>
          </div>

          <div>
            <h3>Pending Orders</h3>
            <p>{pendingOrders}</p>
          </div>

          <div>
            <h3>Low Stock</h3>
            <p>{lowStockProducts}</p>
          </div>

          <div>
            <h3>Active Coupons</h3>
            <p>{activeCoupons}</p>
          </div>

          <div>
            <h3>Revenue</h3>
            <p>₹{totalRevenue}</p>
          </div>
        </div>

        {activeTab === "dashboard" && (
          <div className="dashboardOverview">
            <div className="welcomeAdminBox">
              <div>
                <p>Welcome back 👋</p>
                <h2>THE VELTRIXX Admin Overview</h2>
                <span>
                  Manage products, orders, users, coupons and reviews from one
                  place.
                </span>
              </div>

              <button onClick={() => setActiveTab("products")}>
                Add New Product
              </button>
            </div>
          </div>
        )}

        {activeTab === "products" && (
          <>
            <div className="adminBox productAdminBox">
              <h2>{editingProductId ? "Edit Product" : "Add Product"}</h2>

              <div className="adminFormSection">
                <h3>Basic Info</h3>

                <input
                  placeholder="Product name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />

                <textarea
                  placeholder="Product description"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />

                <input
                  placeholder="Brand: iPhone, Samsung, Pixel"
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                />

                <input
                  placeholder="Main Model: iPhone 15"
                  value={form.model}
                  onChange={(e) => setForm({ ...form, model: e.target.value })}
                />

                <input
                  placeholder="Category"
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                />

                <input
                  placeholder="Tags: iphone, black, premium"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                />
              </div>

              <div className="adminFormSection">
                <h3>Pricing</h3>

                <div className="adminGrid3">
                  <input
                    type="number"
                    placeholder="Selling Price"
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: e.target.value })
                    }
                  />

                  <input
                    type="number"
                    placeholder="Strikethrough Price"
                    value={form.comparePrice}
                    onChange={(e) =>
                      setForm({ ...form, comparePrice: e.target.value })
                    }
                  />

                  <input
                    type="number"
                    placeholder="Cost Price"
                    value={form.costPrice}
                    onChange={(e) =>
                      setForm({ ...form, costPrice: e.target.value })
                    }
                  />
                </div>

                <div className="profitBox">
                  <span>Profit: ₹{profit}</span>
                  <span>Margin: {margin}%</span>
                </div>
              </div>

              <div className="adminFormSection">
                <h3>Images and Videos</h3>

                <label className="uploadBox">
                  {uploading ? "Uploading..." : "Click to Upload Product Images"}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    hidden
                    onChange={handleMainImagesUpload}
                  />
                </label>

                <div className="uploadedImageGrid">
                  {form.images.length === 0 ? (
                    <p>No images uploaded</p>
                  ) : (
                    form.images.map((img, index) => (
                      <img key={index} src={img} alt={`Product ${index + 1}`} />
                    ))
                  )}
                </div>
              </div>

              <div className="adminFormSection">
                <h3>Product Options</h3>

                <input
                  placeholder="Available Models: iPhone 15, iPhone 15 Pro, Samsung S24"
                  value={form.availableModels}
                  onChange={(e) =>
                    setForm({ ...form, availableModels: e.target.value })
                  }
                />
              </div>

              <div className="adminFormSection">
                <h3>Color Options</h3>

                <div className="colorInputGrid">
                  <input
                    placeholder="Color Name"
                    value={form.colorName}
                    onChange={(e) =>
                      setForm({ ...form, colorName: e.target.value })
                    }
                  />

                  <input
                    type="color"
                    value={form.colorHex}
                    onChange={(e) =>
                      setForm({ ...form, colorHex: e.target.value })
                    }
                  />

                  <label className="smallUploadBtn">
                    Upload Color Image
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleColorImageUpload}
                    />
                  </label>

                  <button type="button" onClick={addColor}>
                    Add Color
                  </button>
                </div>

                {form.colorImage && (
                  <div className="singleColorPreview">
                    <span style={{ backgroundColor: form.colorHex }}></span>
                    <img src={form.colorImage} alt="Color preview" />
                    <p>{form.colorName || "Color name"}</p>
                  </div>
                )}

                <div className="addedColorPreviewGrid">
                  {parsedColors.length === 0 ? (
                    <p>No colors added</p>
                  ) : (
                    parsedColors.map((color, index) => (
                      <div className="addedColorCard" key={index}>
                        <img src={color.image} alt={color.name} />
                        <div>
                          <span style={{ backgroundColor: color.hex }}></span>
                          <p>{color.name}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="adminFormSection">
                <h3>Inventory and Pre-order</h3>

                <div className="adminGrid3">
                  <input
                    placeholder="SKU"
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  />

                  <input
                    type="number"
                    placeholder="Stock Quantity"
                    value={form.stock}
                    onChange={(e) =>
                      setForm({ ...form, stock: e.target.value })
                    }
                  />

                  <input
                    type="number"
                    placeholder="Low Stock Alert"
                    value={form.lowStockAlert}
                    onChange={(e) =>
                      setForm({ ...form, lowStockAlert: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="adminFormSection">
                <h3>Shipping and Fulfillment</h3>

                <div className="adminGrid3">
                  <input
                    type="number"
                    placeholder="Shipping Weight KG"
                    value={form.weight}
                    onChange={(e) =>
                      setForm({ ...form, weight: e.target.value })
                    }
                  />

                  <input
                    placeholder="Delivery Days"
                    value={form.deliveryDays}
                    onChange={(e) =>
                      setForm({ ...form, deliveryDays: e.target.value })
                    }
                  />

                  <input
                    type="number"
                    placeholder="Shipping Charge"
                    value={form.shippingCharge}
                    onChange={(e) =>
                      setForm({ ...form, shippingCharge: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="adminFormSection">
                <h3>Return & Refund Policy</h3>

                <textarea
                  value={form.returnPolicy}
                  onChange={(e) =>
                    setForm({ ...form, returnPolicy: e.target.value })
                  }
                />
              </div>

              <div className="adminFormSection">
                <h3>Marketing & SEO</h3>

                <input
                  placeholder="SEO Title"
                  value={form.seoTitle}
                  onChange={(e) =>
                    setForm({ ...form, seoTitle: e.target.value })
                  }
                />

                <textarea
                  placeholder="SEO Description"
                  value={form.seoDescription}
                  onChange={(e) =>
                    setForm({ ...form, seoDescription: e.target.value })
                  }
                />
              </div>

              <div className="adminFormSection">
                <h3>Product Status</h3>

                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="out-of-stock">Out of Stock</option>
                </select>

                <label className="checkRow">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) =>
                      setForm({ ...form, featured: e.target.checked })
                    }
                  />
                  Featured Product
                </label>
              </div>

              <div className="adminProductActions">
                <button onClick={handleSubmitProduct}>
                  {editingProductId ? "Update Product" : "Add Product"}
                </button>

                {editingProductId && (
                  <button
                    type="button"
                    className="dangerBtn"
                    onClick={cancelEdit}
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </div>

            <div className="adminProductList">
              {products.length === 0 ? (
                <p>No products yet.</p>
              ) : (
                products.map((item) => (
                  <div className="adminProduct" key={item._id}>
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{
                        width: "90px",
                        height: "90px",
                        objectFit: "cover",
                        borderRadius: "14px",
                      }}
                    />

                    <div>
                      <h3>{item.name}</h3>
                      <p>
                        {item.brand} • {item.model}
                      </p>

                      <strong>₹{item.price}</strong>

                      {item.comparePrice > 0 && (
                        <p>
                          MRP: <del>₹{item.comparePrice}</del>
                        </p>
                      )}

                      <p>Stock: {item.stock}</p>
                      <p>Status: {item.status}</p>
                    </div>

                    <div>
                      <button onClick={() => startEditProduct(item)}>
                        Edit
                      </button>

                      <button
                        className="dangerBtn"
                        onClick={() => deleteProduct(item._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {activeTab !== "dashboard" && activeTab !== "products" && (
          <div className="adminBox">
            <h2>{activeTab}</h2>
            <p>
              Tumhare existing {activeTab} section ka code same reh sakta hai.
              Products section updated ho gaya hai.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default Admin;