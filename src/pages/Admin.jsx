import { useEffect, useState } from "react";

const PRODUCT_API = "https://the-veltrixx-backend.onrender.com/api/products";
const ORDER_API = "https://the-veltrixx-backend.onrender.com/api/orders/admin/all";
const UPDATE_ORDER_API = "https://the-veltrixx-backend.onrender.com/api/orders/admin/update";
const DELETE_ORDER_API = "https://the-veltrixx-backend.onrender.com/api/orders/admin/delete";
const REVIEW_API = "https://the-veltrixx-backend.onrender.com/api/reviews/admin/all";
const DELETE_REVIEW_API = "https://the-veltrixx-backend.onrender.com/api/reviews/admin/delete";
const COUPON_API = "https://the-veltrixx-backend.onrender.com/api/coupons";

function Admin({ refreshProducts }) {
  const [activeTab, setActiveTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [coupons, setCoupons] = useState([]);

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
    expiryDate: "",
  };

  const [form, setForm] = useState(emptyForm);
  const [couponForm, setCouponForm] = useState(emptyCouponForm);

  const token = localStorage.getItem("veltrixx_token");

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

  useEffect(() => {
    fetchProducts();
    fetchCoupons();
  }, []);

  useEffect(() => {
    if (activeTab === "orders") fetchOrders();
    if (activeTab === "reviews") fetchReviews();
    if (activeTab === "coupons") fetchCoupons();
  }, [activeTab]);

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

  const handleAdd = async () => {
    if (!form.name || !form.brand || !form.model || !form.price || !form.image) {
      alert("Please fill required fields");
      return;
    }

    const res = await fetch(PRODUCT_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
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

        colorOptions: form.colorOptions
          .split(",")
          .map((item) => {
            const [name, hex, image] = item.split("|").map((v) => v.trim());
            return { name, hex, image };
          })
          .filter((item) => item.name && item.hex && item.image),
      }),
    });

    const data = await res.json();

    if (!data.success) {
      alert(data.message || "Product add failed");
      return;
    }

    alert("Product added");
    setForm(emptyForm);
    fetchProducts();
    if (refreshProducts) refreshProducts();
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

  const totalRevenue = orders.reduce(
    (sum, order) => sum + Number(order.total || 0),
    0
  );

  const pendingOrders = orders.filter(
    (order) =>
      order.orderStatus !== "Delivered" && order.orderStatus !== "Cancelled"
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

        <button onClick={() => setActiveTab("products")}>Products</button>
        <button onClick={() => setActiveTab("orders")}>Manage Orders</button>
        <button onClick={() => setActiveTab("reviews")}>Reviews</button>
        <button onClick={() => setActiveTab("coupons")}>Coupons</button>
        <button onClick={() => setActiveTab("users")}>Users</button>
      </aside>

      <main>
        <h1>Dashboard</h1>

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
            <h3>Total Reviews</h3>
            <p>{reviews.length}</p>
          </div>

          <div>
            <h3>Total Coupons</h3>
            <p>{coupons.length}</p>
          </div>

          <div>
            <h3>Revenue</h3>
            <p>₹{totalRevenue}</p>
          </div>
        </div>

        {activeTab === "products" && (
          <>
            <div className="adminBox">
              <h2>Add Product</h2>

              <input
                placeholder="Product name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />

              <input
                placeholder="Brand"
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
              />

              <input
                placeholder="Main Model"
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
              />

              <input
                placeholder="Price"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />

              <input
                placeholder="Main Image URL"
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
              />

              <input
                placeholder="Stock"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
              />

              <input
                placeholder="Description"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />

              <input
                placeholder="Available Models: iPhone 13, iPhone 14, Samsung S24"
                value={form.availableModels}
                onChange={(e) =>
                  setForm({ ...form, availableModels: e.target.value })
                }
              />

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

              <input
                placeholder="Color Image URL"
                value={form.colorImage}
                onChange={(e) =>
                  setForm({ ...form, colorImage: e.target.value })
                }
              />

              <button type="button" onClick={addColor}>
                Add Color
              </button>

              <p>Added Colors: {form.colorOptions || "No colors added"}</p>

              <button onClick={handleAdd}>Add Product</button>
            </div>

            <div className="adminProductList">
              {products.length === 0 ? (
                <p>No products yet.</p>
              ) : (
                products.map((item) => (
                  <div className="adminProduct" key={item._id}>
                    <div>
                      <h3>{item.name}</h3>
                      <p>
                        {item.brand} • {item.model}
                      </p>
                      <strong>₹{item.price}</strong>

                      <p>
                        <b>Models:</b>{" "}
                        {item.availableModels?.length
                          ? item.availableModels.join(", ")
                          : "Not added"}
                      </p>

                      <div className="adminColorList">
                        <b>Colors:</b>{" "}
                        {item.colorOptions?.length ? (
                          item.colorOptions.map((color) => (
                            <span key={color.name} className="adminColorChip">
                              <span
                                className="adminColorDot"
                                style={{ backgroundColor: color.hex }}
                              ></span>
                              {color.name}
                            </span>
                          ))
                        ) : (
                          "Not added"
                        )}
                      </div>
                    </div>

                    <button onClick={() => deleteProduct(item._id)}>
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {activeTab === "coupons" && (
          <div className="adminBox">
            <h2>Coupons</h2>

            <input
              placeholder="Coupon Code: WELCOME10"
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
              <option value="percentage">Percentage Discount</option>
              <option value="flat">Flat Discount</option>
            </select>

            <input
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
              type="date"
              value={couponForm.expiryDate}
              onChange={(e) =>
                setCouponForm({
                  ...couponForm,
                  expiryDate: e.target.value,
                })
              }
            />

            <button onClick={createCoupon}>Create Coupon</button>

            <div className="adminProductList">
              {coupons.length === 0 ? (
                <p>No coupons yet.</p>
              ) : (
                coupons.map((coupon) => (
                  <div className="adminProduct" key={coupon._id}>
                    <div>
                      <h3>{coupon.code}</h3>

                      <p>
                        {coupon.discountType === "percentage"
                          ? `${coupon.discountValue}% OFF`
                          : `₹${coupon.discountValue} OFF`}
                      </p>

                      <p>Min Order: ₹{coupon.minOrderAmount}</p>

                      <p>
                        Max Discount:{" "}
                        {coupon.maxDiscountAmount > 0
                          ? `₹${coupon.maxDiscountAmount}`
                          : "No limit"}
                      </p>

                      <p>
                        Expiry:{" "}
                        {new Date(coupon.expiryDate).toLocaleDateString()}
                      </p>

                      <p>Status: {coupon.isActive ? "Active" : "Inactive"}</p>
                    </div>

                    <div>
                      <button onClick={() => toggleCoupon(coupon._id)}>
                        {coupon.isActive ? "Deactivate" : "Activate"}
                      </button>

                      <button
                        className="dangerBtn"
                        onClick={() => deleteCoupon(coupon._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="adminOrders">
            <h2>Manage Orders</h2>

            {orders.length === 0 ? (
              <p>No orders yet.</p>
            ) : (
              orders.map((order) => (
                <div className="adminOrderCard" key={order._id}>
                  <div className="orderTop">
                    <div>
                      <h3>Order #{order._id.slice(-6)}</h3>
                      <p>{new Date(order.createdAt).toLocaleString()}</p>
                      <p>
                        Customer: {order.user?.name || order.customer?.name}
                      </p>
                      <p>Email: {order.user?.email || "Not available"}</p>
                    </div>

                    <strong>{order.orderStatus}</strong>
                  </div>

                  <div className="adminAddressBox">
                    <h3>Delivery Address</h3>
                    <p>{order.customer?.name}</p>
                    <p>{order.customer?.phone}</p>
                    <p>
                      {order.customer?.address}
                      {order.customer?.landmark
                        ? `, ${order.customer.landmark}`
                        : ""}
                    </p>
                    <p>
                      {order.customer?.city}, {order.customer?.state} -{" "}
                      {order.customer?.pincode}
                    </p>
                  </div>

                  <div className="statusHistoryBox">
                    <h3>Status History</h3>

                    {order.statusHistory?.length > 0 ? (
                      order.statusHistory.map((history, index) => (
                        <p key={index}>
                          <strong>{history.status}</strong> -{" "}
                          {new Date(history.date).toLocaleString()}
                        </p>
                      ))
                    ) : (
                      <p>No status history yet.</p>
                    )}
                  </div>

                  {order.items.map((item, index) => (
                    <div className="cartItem" key={index}>
                      <img src={item.image} alt={item.name} />

                      <div>
                        <h3>{item.name}</h3>
                        <p>
                          {item.brand} • {item.model}
                        </p>
                        <h4>
                          ₹{item.price} × {item.qty}
                        </h4>
                      </div>
                    </div>
                  ))}

                  <div className="adminOrderBottom">
                    <div>
                      <h3>Total: ₹{order.total}</h3>
                      <p>Payment Method: {order.paymentMethod}</p>
                      <p>Payment Status: {order.paymentStatus}</p>
                    </div>

                    <div className="statusButtons">
                      {orderStatuses.map((status) => (
                        <button
                          key={status}
                          className={
                            order.orderStatus === status
                              ? "activeStatusBtn"
                              : ""
                          }
                          onClick={() => updateOrderStatus(order._id, status)}
                        >
                          {status}
                        </button>
                      ))}

                      <button
                        className="dangerBtn"
                        onClick={() => deleteOrder(order._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="adminReviews">
            <h2>Reviews</h2>

            {reviews.length === 0 ? (
              <p>No reviews yet.</p>
            ) : (
              reviews.map((review) => (
                <div className="adminReviewCard" key={review._id}>
                  <h3>{review.product?.name}</h3>

                  <p>
                    Product: {review.product?.brand} • {review.product?.model}
                  </p>

                  <p>
                    User: {review.user?.name} ({review.user?.email})
                  </p>

                  <p>{"⭐".repeat(review.rating)}</p>

                  <p>{review.comment}</p>

                  <small>{new Date(review.createdAt).toLocaleString()}</small>

                  <br />

                  <button
                    className="dangerBtn"
                    onClick={() => deleteReview(review._id)}
                  >
                    Delete Review
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "users" && (
          <div className="adminBox">
            <h2>Users</h2>
            <p>User management will be added next.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default Admin;