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

  const token = localStorage.getItem("veltrixx_token");

  const emptyForm = {
    name: "",
    brand: "",
    model: "",
    price: "",
    image: "",
    stock: "",
    description: "",
    availableModels: "",
    colorOptions: "",
    colorName: "",
    colorHex: "#000000",
    colorImage: "",
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
      alert("Please fill color name, color and image URL");
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

  const getProductPayload = () => ({
    name: form.name,
    brand: form.brand,
    model: form.model,
    price: Number(form.price),
    image: form.image,
    stock: Number(form.stock) || 10,
    description: form.description || "Premium phone case by THE VELTRIXX.",
    availableModels: form.availableModels
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    colorOptions: parsedColors,
  });

  const handleSubmitProduct = async () => {
    if (!form.name || !form.brand || !form.model || !form.price || !form.image) {
      alert("Please fill required fields");
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
      name: item.name || "",
      brand: item.brand || "",
      model: item.model || "",
      price: item.price || "",
      image: item.image || "",
      stock: item.stock || "",
      description: item.description || "",
      availableModels: item.availableModels?.join(", ") || "",
      colorOptions:
        item.colorOptions
          ?.map((c) => `${c.name}|${c.hex}|${c.image}`)
          .join(", ") || "",
      colorName: "",
      colorHex: "#000000",
      colorImage: "",
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

  const updateOrderStatus = async (id, status) => {
    const res = await fetch(`${UPDATE_ORDER_API}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ orderStatus: status }),
    });

    const data = await res.json();

    if (!data.success) {
      alert(data.message || "Order update failed");
      return;
    }

    alert("Order status updated");
    fetchOrders();
  };

  const deleteOrder = async (id) => {
    if (!window.confirm("Delete this order?")) return;

    const res = await fetch(`${DELETE_ORDER_API}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    if (!data.success) {
      alert(data.message || "Order delete failed");
      return;
    }

    alert("Order deleted");
    fetchOrders();
  };

  const deleteReview = async (id) => {
    if (!window.confirm("Delete this review?")) return;

    const res = await fetch(`${DELETE_REVIEW_API}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    if (!data.success) {
      alert(data.message || "Review delete failed");
      return;
    }

    alert("Review deleted");
    fetchReviews();
  };

  const createCoupon = async () => {
    if (!couponForm.code || !couponForm.discountValue || !couponForm.expiryDate) {
      alert("Please fill coupon code, discount and expiry date");
      return;
    }

    const res = await fetch(`${COUPON_API}/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        code: couponForm.code,
        discountType: couponForm.discountType,
        discountValue: Number(couponForm.discountValue),
        minOrderAmount: Number(couponForm.minOrderAmount) || 0,
        maxDiscountAmount: Number(couponForm.maxDiscountAmount) || 0,
        usageLimit: Number(couponForm.usageLimit) || 0,
        expiryDate: couponForm.expiryDate,
      }),
    });

    const data = await res.json();

    if (!data.success) {
      alert(data.message || "Coupon create failed");
      return;
    }

    alert("Coupon created");
    setCouponForm(emptyCouponForm);
    fetchCoupons();
  };

  const toggleCoupon = async (id) => {
    const res = await fetch(`${COUPON_API}/${id}/toggle`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    if (!data.success) {
      alert(data.message || "Coupon update failed");
      return;
    }

    fetchCoupons();
  };

  const deleteCoupon = async (id) => {
    if (!window.confirm("Delete this coupon?")) return;

    const res = await fetch(`${COUPON_API}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    if (!data.success) {
      alert(data.message || "Coupon delete failed");
      return;
    }

    alert("Coupon deleted");
    fetchCoupons();
  };

  const updateUserRole = async (id, role) => {
    const res = await fetch(`${USER_API}/${id}/role`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ role }),
    });

    const data = await res.json();

    if (!data.success) {
      alert(data.message || "Role update failed");
      return;
    }

    alert("User role updated");
    fetchUsers();
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;

    const res = await fetch(`${USER_API}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    if (!data.success) {
      alert(data.message || "User delete failed");
      return;
    }

    alert("User deleted");
    fetchUsers();
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
    (product) => Number(product.stock || 0) <= 5
  ).length;

  const orderStatuses = [
    "Order Placed",
    "Processing",
    "Packed",
    "Shipped",
    "Out For Delivery",
    "Delivered",
    "Cancelled",
  ];

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
       