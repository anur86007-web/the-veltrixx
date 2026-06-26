import { useEffect, useState } from "react";
import AdminCustomDesigns from "./AdminCustomDesigns";

const PRODUCT_API = "https://the-veltrixx-backend.onrender.com/api/products";
const ORDER_API = "https://the-veltrixx-backend.onrender.com/api/orders/admin/all";
const REVIEW_API = "https://the-veltrixx-backend.onrender.com/api/reviews/admin/all";
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
  const [orderStatusDraft, setOrderStatusDraft] = useState({});

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
    isBestSeller: false,
    isNewArrival: false,
    isTrending: false,
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
  const deleteProductImage = (imageUrl) => {
  const updatedImages = form.images.filter((img) => img !== imageUrl);

  setForm({
    ...form,
    images: updatedImages,
    image: form.image === imageUrl ? updatedImages[0] || "" : form.image,
  });
};

  const fetchProducts = async () => {
    try {
      const res = await fetch(PRODUCT_API);
      const data = await res.json();
      if (data.success) setProducts(data.products || []);
    } catch (error) {
      console.log("Fetch products error:", error);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch(ORDER_API, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setOrders(data.orders || []);
    } catch (error) {
      console.log("Fetch orders error:", error);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await fetch(REVIEW_API, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setReviews(data.reviews || []);
    } catch (error) {
      console.log("Fetch reviews error:", error);
    }
  };

  const fetchCoupons = async () => {
    try {
      const res = await fetch(COUPON_API);
      const data = await res.json();

      if (data.success) {
        setCoupons(data.coupons || []);
      }
    } catch (error) {
      console.log("Fetch coupons error:", error);
    }
  };

  const fetchUsers = async (searchValue = userSearch) => {
    try {
      const res = await fetch(
        `${USER_API}?search=${encodeURIComponent(searchValue || "")}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        console.log("Fetch users failed:", data);
        setUsers([]);
        return;
      }

      if (Array.isArray(data)) {
        setUsers(data);
      } else if (Array.isArray(data.users)) {
        setUsers(data.users);
      } else if (Array.isArray(data.data)) {
        setUsers(data.data);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.log("Fetch users error:", error);
      setUsers([]);
    }
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
    if (activeTab === "users") fetchUsers(userSearch);
    if (activeTab === "customDesigns") fetchOrders();
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
    isBestSeller: form.isBestSeller,
    isNewArrival: form.isNewArrival,
    isTrending: form.isTrending,
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
      isBestSeller: item.isBestSeller || false,
      isNewArrival: item.isNewArrival || false,
      isTrending: item.isTrending || false,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingProductId(null);
    setForm(emptyForm);
  };

  const updateOrderStatus = async (orderId, orderStatus) => {
    if (!orderId) {
      alert("Order ID missing");
      return;
    }

    if (!orderStatus) {
      alert("Please select order status");
      return;
    }

    try {
      const res = await fetch(
        `https://the-veltrixx-backend.onrender.com/api/orders/admin/all/${orderId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ orderStatus }),
        }
      );

      const data = await res.json();

      if (!data.success) {
        alert(data.message || data.error || "Order status update failed");
        return;
      }

      alert("Order status updated successfully");
      setOrderStatusDraft({
        ...orderStatusDraft,
        [orderId]: "",
      });
      fetchOrders();
    } catch (error) {
      console.log("Update order error:", error);
      alert("Something went wrong while updating order");
    }
  };

  const deleteOrder = async (orderId) => {
  if (!window.confirm("Delete this order permanently?")) return;

  try {
    const res = await fetch(
      `https://the-veltrixx-backend.onrender.com/api/orders/admin/delete/${orderId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();

    if (!data.success) {
      alert(data.message || "Delete failed");
      return;
    }

    alert("Order deleted successfully");
    fetchOrders();
  } catch (error) {
    console.log(error);
    alert("Something went wrong");
  }
};


  const formatCurrency = (value) => {
    const amount = Number(value || 0);
    return `₹${amount.toLocaleString("en-IN")}`;
  };

  const downloadInvoice = (order) => {
    const invoiceWindow = window.open("", "_blank");

    if (!invoiceWindow) {
      alert("Please allow popups to download invoice");
      return;
    }

    const safe = (value) =>
      String(value || "N/A")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");

    const orderDate = order.createdAt
      ? new Date(order.createdAt).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "N/A";

    const itemsHtml =
      order.items?.length > 0
        ? order.items
            .map((item, index) => {
              const qty = Number(item.qty || 1);
              const price = Number(item.price || 0);
              const lineTotal = qty * price;

              return `
                <tr>
                  <td>${index + 1}</td>
                  <td>
                    <strong>${safe(item.name)}</strong>
                    <br />
                    <small>${safe(item.brand)} • ${safe(item.model)}</small>
                  </td>
                  <td>${safe(item.selectedColor || "Default")}</td>
                  <td>${qty}</td>
                  <td>${formatCurrency(price)}</td>
                  <td>${formatCurrency(lineTotal)}</td>
                </tr>
              `;
            })
            .join("")
        : `
          <tr>
            <td colspan="6" style="text-align:center;">No products found</td>
          </tr>
        `;

    invoiceWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${safe(order._id)}</title>
          <style>
            * {
              box-sizing: border-box;
            }

            body {
              margin: 0;
              padding: 40px;
              background: #f3f4f6;
              color: #111;
              font-family: Arial, Helvetica, sans-serif;
            }

            .invoicePage {
              max-width: 950px;
              margin: 0 auto;
              background: #fff;
              border-radius: 24px;
              overflow: hidden;
              box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12);
            }

            .invoiceHeader {
              background: #111;
              color: #fff;
              padding: 34px 40px;
              display: flex;
              justify-content: space-between;
              gap: 30px;
            }

            .brandTitle {
              font-size: 30px;
              letter-spacing: 3px;
              margin: 0 0 8px;
              font-weight: 800;
            }

            .brandSub {
              margin: 0;
              color: #d9d9d9;
              font-size: 14px;
            }

            .invoiceMeta {
              text-align: right;
            }

            .invoiceMeta h2 {
              margin: 0 0 8px;
              font-size: 28px;
            }

            .invoiceMeta p {
              margin: 4px 0;
              color: #d9d9d9;
              font-size: 14px;
            }

            .invoiceBody {
              padding: 36px 40px;
            }

            .infoGrid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 22px;
              margin-bottom: 32px;
            }

            .infoCard {
              border: 1px solid #e8e8e8;
              border-radius: 18px;
              padding: 20px;
              background: #fafafa;
            }

            .infoCard h3 {
              margin: 0 0 12px;
              font-size: 18px;
            }

            .infoCard p {
              margin: 7px 0;
              color: #333;
              line-height: 1.5;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 16px;
              border: 1px solid #e8e8e8;
              overflow: hidden;
              border-radius: 16px;
            }

            th {
              background: #111;
              color: #fff;
              padding: 14px;
              font-size: 13px;
              text-align: left;
            }

            td {
              padding: 14px;
              border-bottom: 1px solid #eee;
              color: #222;
              vertical-align: top;
            }

            td small {
              color: #666;
            }

            .summarySection {
              display: flex;
              justify-content: flex-end;
              margin-top: 28px;
            }

            .summaryBox {
              width: 350px;
              border: 1px solid #e8e8e8;
              border-radius: 18px;
              padding: 20px;
              background: #fafafa;
            }

            .summaryRow {
              display: flex;
              justify-content: space-between;
              margin: 10px 0;
              color: #333;
            }

            .grandTotal {
              border-top: 1px solid #ddd;
              margin-top: 14px;
              padding-top: 14px;
              font-size: 22px;
              font-weight: 800;
              color: #111;
            }

            .invoiceFooter {
              margin-top: 32px;
              padding-top: 24px;
              border-top: 1px solid #eee;
              display: flex;
              justify-content: space-between;
              gap: 20px;
              color: #555;
              font-size: 14px;
            }

            .printBtn {
              margin-top: 28px;
              width: 100%;
              padding: 15px;
              border: none;
              border-radius: 14px;
              background: #111;
              color: #fff;
              font-size: 15px;
              font-weight: 800;
              cursor: pointer;
            }

            .printBtn:hover {
              background: #333;
            }

            @media print {
              body {
                background: #fff;
                padding: 0;
              }

              .invoicePage {
                box-shadow: none;
                border-radius: 0;
              }

              .printBtn {
                display: none;
              }
            }
          </style>
        </head>

        <body>
          <div class="invoicePage">
            <div class="invoiceHeader">
              <div>
                <h1 class="brandTitle">THE VELTRIXX</h1>
                <p class="brandSub">Premium Custom Phone Cases</p>
              </div>

              <div class="invoiceMeta">
                <h2>INVOICE</h2>
                <p><strong>Order:</strong> #${safe(order._id?.slice(-8))}</p>
                <p><strong>Date:</strong> ${orderDate}</p>
              </div>
            </div>

            <div class="invoiceBody">
              <div class="infoGrid">
                <div class="infoCard">
                  <h3>Bill To</h3>
                  <p><strong>${safe(order.customer?.name)}</strong></p>
                  <p>${safe(order.customer?.phone)}</p>
                  <p>
                    ${safe(order.customer?.address)},
                    ${safe(order.customer?.city)},
                    ${safe(order.customer?.state)} -
                    ${safe(order.customer?.pincode)}
                  </p>
                </div>

                <div class="infoCard">
                  <h3>Order Details</h3>
                  <p><strong>Payment:</strong> ${safe(order.paymentMethod)}</p>
                  <p><strong>Payment Status:</strong> ${safe(order.paymentStatus || "Pending")}</p>
                  <p><strong>Order Status:</strong> ${safe(order.orderStatus || "Order Placed")}</p>
                  <p><strong>Coupon:</strong> ${safe(order.couponCode || "No Coupon")}</p>
                </div>
              </div>

              <h3>Purchased Items</h3>

              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Product</th>
                    <th>Color</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <div class="summarySection">
                <div class="summaryBox">
                  <div class="summaryRow">
                    <span>Subtotal</span>
                    <strong>${formatCurrency(order.subtotal)}</strong>
                  </div>

                  <div class="summaryRow">
                    <span>Shipping</span>
                    <strong>${formatCurrency(order.shipping)}</strong>
                  </div>

                  <div class="summaryRow">
                    <span>Discount</span>
                    <strong>- ${formatCurrency(order.discount)}</strong>
                  </div>

                  <div class="summaryRow grandTotal">
                    <span>Total</span>
                    <span>${formatCurrency(order.total)}</span>
                  </div>
                </div>
              </div>

              <div class="invoiceFooter">
                <p>Thank you for shopping with THE VELTRIXX.</p>
                <p>This is a computer generated invoice.</p>
              </div>

              <button class="printBtn" onclick="window.print()">
                Download / Print Invoice
              </button>
            </div>
          </div>
        </body>
      </html>
    `);

    invoiceWindow.document.close();
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


  const deleteReview = async (reviewId) => {
    if (!window.confirm("Delete this review?")) return;

    try {
      const res = await fetch(
        `https://the-veltrixx-backend.onrender.com/api/reviews/admin/delete/${reviewId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!data.success) {
        alert(data.message || "Review delete failed");
        return;
      }

      alert("Review deleted successfully");
      fetchReviews();
    } catch (error) {
      console.log("Delete review error:", error);
      alert("Something went wrong while deleting review");
    }
  };


  const handleCreateCoupon = async () => {
    if (!couponForm.code || !couponForm.discountValue || !couponForm.expiryDate) {
      alert("Please fill coupon code, discount value and expiry date");
      return;
    }

    try {
      const res = await fetch(`${COUPON_API}/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: couponForm.code.trim().toUpperCase(),
          discountType: couponForm.discountType,
          discountValue: Number(couponForm.discountValue),
          minOrderAmount: Number(couponForm.minOrderAmount) || 0,
          maxDiscountAmount: Number(couponForm.maxDiscountAmount) || 0,
          usageLimit: Number(couponForm.usageLimit) || 0,
          expiryDate: couponForm.expiryDate,
          isActive: true,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message || "Coupon create failed");
        return;
      }

      alert("Coupon created successfully");
      setCouponForm(emptyCouponForm);
      fetchCoupons();
    } catch (error) {
      console.log("Coupon create error:", error);
      alert("Something went wrong while creating coupon");
    }
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
        <button onClick={() => setActiveTab("customDesigns")}>Custom Designs</button>
      </aside>

      <main>
        <div className="adminHeader">
          <div>
            <p>Admin Control Panel</p>
            <h1>
              {activeTab === "products"
                ? "Products"
                : activeTab === "orders"
                ? "Manage Orders"
                : activeTab === "reviews"
                ? "Reviews"
                : activeTab === "coupons"
                ? "Coupons"
                : activeTab === "users"
                ? "Users"
                : activeTab === "customDesigns"
                ? "Custom Designs"
                : "Dashboard"}
            </h1>
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
      <div className="uploadedImageBox" key={index}>
        <img src={img} alt={`Product ${index + 1}`} />

        <button
          type="button"
          className="deleteUploadedImageBtn"
          onClick={() => deleteProductImage(img)}
        >
          ×
        </button>
      </div>
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

                <label className="checkRow">
                  <input
                    type="checkbox"
                    checked={form.isBestSeller}
                    onChange={(e) =>
                      setForm({ ...form, isBestSeller: e.target.checked })
                    }
                  />
                  🔥 Best Seller
                </label>

                <label className="checkRow">
                  <input
                    type="checkbox"
                    checked={form.isNewArrival}
                    onChange={(e) =>
                      setForm({ ...form, isNewArrival: e.target.checked })
                    }
                  />
                  ✨ New Arrival
                </label>

                <label className="checkRow">
                  <input
                    type="checkbox"
                    checked={form.isTrending}
                    onChange={(e) =>
                      setForm({ ...form, isTrending: e.target.checked })
                    }
                  />
                  ⭐ Trending
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

                      <div className="adminBadgeRow">
                        {item.isBestSeller && <span>🔥 Best Seller</span>}
                        {item.isNewArrival && <span>✨ New Arrival</span>}
                        {item.isTrending && <span>⭐ Trending</span>}
                        {item.featured && <span>Featured</span>}
                      </div>
                    </div>

                    <div>
                      <button onClick={() => startEditProduct(item)}>Edit</button>

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

        {activeTab === "orders" && (
  <div className="adminBox">
    <div className="ordersHeader">
      <div>
        <h2>Manage Orders</h2>
        <p>Track orders, update status and manage deliveries.</p>
      </div>
    </div>

    {orders.length === 0 ? (
      <div className="adminEmptyState">
        <h2>No Orders Yet</h2>
        <p>No customer orders have been placed yet.</p>
      </div>
    ) : (
      <div className="adminOrdersGrid">
        {orders.map((order) => (
          <div className="orderCard" key={order._id}>
            <div className="orderCardHeader">
              <div>
                <h3>Order #{order._id?.slice(-6)}</h3>
                <p>
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleString()
                    : "Date not available"}
                </p>
              </div>

              <span className="orderStatusBadge">
                {order.orderStatus || "Order Placed"}
              </span>
            </div>

            <div className="orderCustomerBox">
              <h4>Customer Details</h4>
              <p><b>Name:</b> {order.customer?.name || "N/A"}</p>
              <p><b>Phone:</b> {order.customer?.phone || "N/A"}</p>
              <p>
                <b>Address:</b>{" "}
                {order.customer?.address || "N/A"},{" "}
                {order.customer?.city || ""},{" "}
                {order.customer?.state || ""} -{" "}
                {order.customer?.pincode || ""}
              </p>
            </div>

            <div className="orderItemsBox">
              <h4>Products</h4>

              {order.items?.length > 0 ? (
                order.items.map((item, index) => (
                  <div className="orderItemMini" key={index}>
                    <img src={item.image} alt={item.name} />

                    <div>
                      <p><b>{item.name}</b></p>
                      <span>
                        {item.brand} • {item.model} • Qty: {item.qty}
                      </span>
                      <span>Color: {item.selectedColor || "Default"}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p>No products found</p>
              )}
            </div>

            <div className="orderPaymentBox">
              <p><b>Subtotal:</b> ₹{order.subtotal || 0}</p>
              <p><b>Shipping:</b> ₹{order.shipping || 0}</p>
              <p><b>Discount:</b> ₹{order.discount || 0}</p>
              <p><b>Coupon:</b> {order.couponCode || "No Coupon"}</p>
              <h3>Total: ₹{order.total || 0}</h3>
            </div>

            <div className="orderStatusBox">
  <label>Update Order Status</label>

  <div className="orderUpdateRow">
    <select
      value={orderStatusDraft[order._id] || order.orderStatus || "Order Placed"}
      onChange={(e) =>
        setOrderStatusDraft({
          ...orderStatusDraft,
          [order._id]: e.target.value,
        })
      }
    >
      <option value="Order Placed">Order Placed</option>
      <option value="Processing">Processing</option>
      <option value="Packed">Packed</option>
      <option value="Shipped">Shipped</option>
      <option value="Out For Delivery">Out For Delivery</option>
      <option value="Delivered">Delivered</option>
      <option value="Cancelled">Cancelled</option>
    </select>

    <button
      type="button"
      onClick={() =>
        updateOrderStatus(
          order._id,
          orderStatusDraft[order._id] || order.orderStatus || "Order Placed"
        )
      }
    >
      Update
    </button>
  </div>
</div>

            <div className="orderFooter">
              <span><b>Payment:</b> {order.paymentMethod || "N/A"}</span>
              <span><b>Status:</b> {order.paymentStatus || "Pending"}</span>
            </div>

            <button
              type="button"
              className="downloadInvoiceBtn"
              onClick={() => downloadInvoice(order)}
            >
              Download Invoice
            </button>

            <button
  type="button"
  className="deleteOrderBtn"
  onClick={() => deleteOrder(order._id)}
>
  Delete Order
</button>

          </div>
        ))}
      </div>
    )}
  </div>
)}

        {activeTab === "reviews" && (
          <div className="adminBox">
            <div className="reviewsHeader">
              <div>
                <h2>Customer Reviews</h2>
                <p>Monitor product ratings, feedback and customer experience.</p>
              </div>

              <span className="reviewCountBadge">
                {reviews.length} Review{reviews.length > 1 ? "s" : ""}
              </span>
            </div>

            {reviews.length === 0 ? (
              <div className="adminEmptyState">
                <h2>No Reviews Yet</h2>
                <p>Customer reviews will appear here after users rate delivered products.</p>
              </div>
            ) : (
              <div className="adminReviewsGrid">
                {reviews.map((review) => (
                  <div className="adminReviewCard" key={review._id}>
                    <div className="reviewCardTop">
                      <div>
                        <h3>{review.product?.name || "Product"}</h3>
                        <p>
                          {review.product?.brand || "N/A"} •{" "}
                          {review.product?.model || "N/A"}
                        </p>
                      </div>

                      <span className="reviewRatingBadge">
                        ⭐ {review.rating || 0}/5
                      </span>
                    </div>

                    <div className="reviewCustomerBox">
                      <p>
                        <b>Customer:</b>{" "}
                        {review.user?.name || review.name || "Customer"}
                      </p>
                      <p>
                        <b>Email:</b> {review.user?.email || "N/A"}
                      </p>
                      <p>
                        <b>Date:</b>{" "}
                        {review.createdAt
                          ? new Date(review.createdAt).toLocaleString()
                          : "N/A"}
                      </p>
                    </div>

                    <div className="reviewCommentBox">
                      <p>{review.comment || "No comment provided."}</p>
                    </div>

                    <button
                      type="button"
                      className="deleteReviewBtn"
                      onClick={() => deleteReview(review._id)}
                    >
                      Delete Review
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "coupons" && (
          <div className="adminBox productAdminBox">
            <h2>Create Coupon</h2>

            <div className="adminFormSection">
              <h3>Coupon Details</h3>

              <input
                placeholder="Coupon Code"
                value={couponForm.code}
                onChange={(e) =>
                  setCouponForm({
                    ...couponForm,
                    code: e.target.value.toUpperCase(),
                  })
                }
              />

              <select
                value={couponForm.discountType}
                onChange={(e) =>
                  setCouponForm({
                    ...couponForm,
                    discountType: e.target.value,
                  })
                }
              >
                <option value="percentage">Percentage</option>
                <option value="flat">Flat Amount</option>
              </select>

              <input
                type="number"
                placeholder="Discount Value"
                value={couponForm.discountValue}
                onChange={(e) =>
                  setCouponForm({
                    ...couponForm,
                    discountValue: e.target.value,
                  })
                }
              />

              <input
                type="number"
                placeholder="Minimum Order Amount"
                value={couponForm.minOrderAmount}
                onChange={(e) =>
                  setCouponForm({
                    ...couponForm,
                    minOrderAmount: e.target.value,
                  })
                }
              />

              <input
                type="number"
                placeholder="Max Discount Amount"
                value={couponForm.maxDiscountAmount}
                onChange={(e) =>
                  setCouponForm({
                    ...couponForm,
                    maxDiscountAmount: e.target.value,
                  })
                }
              />

              <input
                type="number"
                placeholder="Usage Limit"
                value={couponForm.usageLimit}
                onChange={(e) =>
                  setCouponForm({
                    ...couponForm,
                    usageLimit: e.target.value,
                  })
                }
              />

              <input
                type="date"
                value={couponForm.expiryDate}
                onChange={(e) =>
                  setCouponForm({
                    ...couponForm,
                    expiryDate: e.target.value,
                  })
                }
              />

              <button onClick={handleCreateCoupon}>Create Coupon</button>
            </div>

            {coupons.length === 0 ? (
              <div className="adminEmptyState">
                <h3>No Coupons Available</h3>
                <p>Create your first coupon to start offering discounts.</p>
              </div>
            ) : (
              <div className="adminProductList">
                {coupons.map((coupon) => (
                  <div className="adminProduct" key={coupon._id}>
                    <div>
                      <h3>{coupon.code}</h3>
                      <p>
                        {coupon.discountType} - {coupon.discountValue}
                      </p>
                      <p>Min Order: ₹{coupon.minOrderAmount || 0}</p>
                      <p>Max Discount: ₹{coupon.maxDiscountAmount || 0}</p>
                      <p>Usage Limit: {coupon.usageLimit || "Unlimited"}</p>
                      <p>
                        Expiry:{" "}
                        {coupon.expiryDate
                          ? coupon.expiryDate.slice(0, 10)
                          : "No Expiry"}
                      </p>
                      <p>Status: {coupon.isActive ? "Active" : "Inactive"}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "customDesigns" && (
          <AdminCustomDesigns />
        )}

        {activeTab === "users" && (
          <div className="adminBox">
            <div className="usersAdminHeader">
              <div>
                <h2>Users</h2>
                <p>View registered customers and their account details.</p>
              </div>

              <span className="userCountBadge">
                {users.length} User{users.length > 1 ? "s" : ""}
              </span>
            </div>

            <div className="usersSearchRow">
              <input
                type="text"
                placeholder="Search user by name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") fetchUsers(userSearch);
                }}
              />

              <button type="button" onClick={() => fetchUsers(userSearch)}>
                Search
              </button>

              {userSearch && (
                <button
                  type="button"
                  className="clearUserSearchBtn"
                  onClick={() => {
                    setUserSearch("");
                    fetchUsers("");
                  }}
                >
                  Clear
                </button>
              )}
            </div>

            {users.length === 0 ? (
              <div className="adminEmptyState">
                <h2>No Users Found</h2>
                <p>Registered users will appear here.</p>
              </div>
            ) : (
              <div className="adminUsersGrid">
                {users.map((user) => (
                  <div className="adminUserCard" key={user._id || user.id}>
                    <div className="userAvatar">
                      {(user.name || user.email || "U").charAt(0).toUpperCase()}
                    </div>

                    <div className="userDetails">
                      <h3>{user.name || "No Name"}</h3>
                      <p>{user.email || "No Email"}</p>

                      <div className="userMetaGrid">
                        <span>
                          <b>Role:</b> {user.role || "customer"}
                        </span>

                        <span>
                          <b>Joined:</b>{" "}
                          {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString()
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default Admin;
