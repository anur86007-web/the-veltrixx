import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PackageCheck, Truck, XCircle, ShoppingBag, Star } from "lucide-react";

const API = "https://the-veltrixx-backend.onrender.com/api/orders/my-orders";
const CANCEL_API = "https://the-veltrixx-backend.onrender.com/api/orders/cancel";
const REVIEW_API = "https://the-veltrixx-backend.onrender.com/api/reviews";
const PRODUCT_API = "https://the-veltrixx-backend.onrender.com/api/products";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewForms, setReviewForms] = useState({});
  const [reviewSubmitting, setReviewSubmitting] = useState({});
  const [reviewSubmitted, setReviewSubmitted] = useState({});
  const [products, setProducts] = useState([]);

  const trackingSteps = [
    "Order Placed",
    "Processing",
    "Packed",
    "Shipped",
    "Out For Delivery",
    "Delivered",
  ];

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("veltrixx_token");

      const res = await fetch(API, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.log(error);
      alert("Could not fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(PRODUCT_API);
      const data = await res.json();

      if (data.success) {
        setProducts(data.products || []);
      }
    } catch (error) {
      console.log("Could not fetch products:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, []);

  const cancelOrder = async (id) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this order?"
    );

    if (!confirmCancel) return;

    try {
      const token = localStorage.getItem("veltrixx_token");

      const res = await fetch(`${CANCEL_API}/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message);
        return;
      }

      alert("Order cancelled successfully");
      fetchOrders();
    } catch (error) {
      console.log(error);
      alert("Cancel failed");
    }
  };

  const getCurrentIndex = (status) => {
    const index = trackingSteps.indexOf(status);
    return index === -1 ? 0 : index;
  };

  const getRawProductId = (value) => {
    if (!value) return "";
    if (typeof value === "object") return value._id || value.id || "";
    return value;
  };

  const getProductId = (item) => {
    const directProductId =
      getRawProductId(item.product) || getRawProductId(item.productId);

    const directProductExists = products.some(
      (product) => String(product._id || product.id) === String(directProductId)
    );

    if (directProductId && directProductExists) {
      return directProductId;
    }

    const matchedProduct = products.find((product) => {
      const nameMatch =
        product.name?.trim().toLowerCase() === item.name?.trim().toLowerCase();

      const brandMatch =
        !item.brand ||
        product.brand?.trim().toLowerCase() === item.brand?.trim().toLowerCase();

      const modelMatch =
        !item.model ||
        !product.model ||
        product.model?.trim().toLowerCase() === item.model?.trim().toLowerCase() ||
        product.availableModels
          ?.map((model) => model.trim().toLowerCase())
          .includes(item.model?.trim().toLowerCase());

      return nameMatch && brandMatch && modelMatch;
    });

    return matchedProduct?._id || matchedProduct?.id || directProductId || "";
  };

  const getReviewKey = (orderId, item) => {
    return `${orderId}-${getProductId(item) || item.name}`;
  };

  const getReviewForm = (key) => {
    return reviewForms[key] || { rating: 5, comment: "" };
  };

  const updateReviewForm = (key, field, value) => {
    setReviewForms({
      ...reviewForms,
      [key]: {
        ...getReviewForm(key),
        [field]: value,
      },
    });
  };

  const submitProductReview = async (orderId, item) => {
    const productId = getProductId(item);
    const reviewKey = getReviewKey(orderId, item);
    const form = getReviewForm(reviewKey);

    if (!productId) {
      alert("Product ID missing. Review cannot be submitted.");
      return;
    }

    if (!form.comment.trim()) {
      alert("Please write your review");
      return;
    }

    try {
      const token = localStorage.getItem("veltrixx_token");

      if (!token) {
        alert("Please login first");
        return;
      }

      setReviewSubmitting({ ...reviewSubmitting, [reviewKey]: true });

      const res = await fetch(REVIEW_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          product: productId,
          rating: Number(form.rating),
          comment: form.comment.trim(),
        }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message || "Review submit failed");
        return;
      }

      setReviewSubmitted({ ...reviewSubmitted, [reviewKey]: true });
      setReviewForms({
        ...reviewForms,
        [reviewKey]: { rating: 5, comment: "" },
      });

      alert("Review submitted successfully");
    } catch (error) {
      console.log("Review submit error:", error);
      alert("Something went wrong while submitting review");
    } finally {
      setReviewSubmitting({ ...reviewSubmitting, [reviewKey]: false });
    }
  };

  if (loading) {
    return (
      <div className="ordersPage">
        <div className="ordersInner">
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="ordersPage">
        <div className="emptyOrdersBox">
          <ShoppingBag size={56} />
          <h1>No Orders Yet</h1>
          <p>Your purchased phone cases will appear here.</p>

          <Link to="/">
            <button>Start Shopping</button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="ordersPage">
      <div className="ordersInner">
        <Link to="/" className="backLink">
          ← Back to shop
        </Link>

        <div className="ordersHeader">
          <div>
            <p>Order History</p>
            <h1>My Orders</h1>
          </div>

          <span>
            {orders.length} order{orders.length > 1 ? "s" : ""}
          </span>
        </div>

        <div className="ordersList">
          {orders.map((order) => {
            const currentIndex = getCurrentIndex(order.orderStatus);
            const isCancelled = order.orderStatus === "Cancelled";
            const isDelivered = order.orderStatus === "Delivered";

            return (
              <div className="premiumOrderCard" key={order._id}>
                <div className="premiumOrderTop">
                  <div>
                    <p>Order #{order._id.slice(-6).toUpperCase()}</p>
                    <h3>{new Date(order.createdAt).toLocaleDateString()}</h3>
                  </div>

                  <span
                    className={
                      isCancelled ? "cancelStatusPill" : "orderStatusPill"
                    }
                  >
                    {isCancelled ? (
                      <XCircle size={16} />
                    ) : (
                      <PackageCheck size={16} />
                    )}
                    {order.orderStatus}
                  </span>
                </div>

                {isCancelled ? (
                  <div className="cancelTimeline">
                    <XCircle size={28} />
                    <div>
                      <h3>Order Cancelled</h3>
                      <p>This order has been cancelled successfully.</p>
                    </div>
                  </div>
                ) : (
                  <div className="premiumTimelineBox">
                    <div className="timelineTitle">
                      <Truck size={20} />
                      <h3>Order Tracking</h3>
                    </div>

                    <div className="premiumTimeline">
                      {trackingSteps.map((step, index) => (
                        <div
                          key={step}
                          className={
                            index <= currentIndex
                              ? "premiumTimelineStep completedStep"
                              : "premiumTimelineStep"
                          }
                        >
                          <div className="premiumTimelineCircle">
                            {index <= currentIndex ? "✓" : index + 1}
                          </div>

                          <p>{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="orderItemsGrid">
                  {order.items.map((item, index) => {
                    const productId = getProductId(item);

                    return (
                      <Link
                        to={productId ? `/product/${productId}` : "#"}
                        className="orderItemCard"
                        key={index}
                        onClick={() => {
                          localStorage.setItem(
                            "veltrixx_order_product_item",
                            JSON.stringify(item)
                          );
                        }}
                      >
                        <img
                          src={item.selectedImage || item.image}
                          alt={item.name}
                        />

                        <div>
                          <h3>{item.name}</h3>
                          <p>
                            {item.brand} • {item.selectedModel || item.model}
                          </p>
                          <p>Color: {item.selectedColor || "Default"}</p>
                          <strong>
                            ₹{item.price} × {item.qty}
                          </strong>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                <div className="orderInfoGrid">
                  <div className="orderAddressBox">
                    <h3>Delivery Address</h3>
                    <p>
                      <strong>{order.customer?.name}</strong>
                    </p>
                    <p>{order.customer?.phone}</p>
                    <p>
                      {order.customer?.address}
                      {order.customer?.landmark
                        ? `, ${order.customer?.landmark}`
                        : ""}
                    </p>
                    <p>
                      {order.customer?.city}, {order.customer?.state} -{" "}
                      {order.customer?.pincode}
                    </p>
                  </div>

                  <div className="orderPaymentBox">
                    <h3>Payment Summary</h3>

                    <p>
                      Method: <strong>{order.paymentMethod}</strong>
                    </p>

                    <p>
                      Payment: <strong>{order.paymentStatus}</strong>
                    </p>

                    {order.couponCode && (
                      <p>
                        Coupon: <strong>{order.couponCode}</strong>
                      </p>
                    )}

                    {order.discount > 0 && (
                      <p>
                        Discount: <strong>- ₹{order.discount}</strong>
                      </p>
                    )}

                    <h2>Total: ₹{order.total}</h2>
                  </div>
                </div>

                {isDelivered && (
                  <div className="deliveredReviewBox">
                    <div className="deliveredReviewHeader">
                      <div>
                        <p>Delivered Order</p>
                        <h3>Rate your purchased products</h3>
                      </div>
                      <span>Feedback helps other customers</span>
                    </div>

                    {order.items.map((item, index) => {
                      const reviewKey = getReviewKey(order._id, item);
                      const form = getReviewForm(reviewKey);
                      const productId = getProductId(item);

                      return (
                        <div className="productReviewCard" key={reviewKey}>
                          <div className="productReviewInfo">
                            <img
                              src={item.selectedImage || item.image}
                              alt={item.name}
                            />

                            <div>
                              <h4>{item.name}</h4>
                              <p>
                                {item.brand} • {item.selectedModel || item.model}
                              </p>
                              <p>Color: {item.selectedColor || "Default"}</p>
                            </div>
                          </div>

                          {reviewSubmitted[reviewKey] ? (
                            <div className="reviewSuccessBox">
                              <Star size={18} fill="currentColor" />
                              Review submitted successfully
                            </div>
                          ) : (
                            <div className="reviewFormBox">
                              <div className="starRatingRow">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    type="button"
                                    className={
                                      Number(form.rating) >= star
                                        ? "reviewStar activeReviewStar"
                                        : "reviewStar"
                                    }
                                    onClick={() =>
                                      updateReviewForm(reviewKey, "rating", star)
                                    }
                                  >
                                    ★
                                  </button>
                                ))}

                                <span>{form.rating}/5</span>
                              </div>

                              <textarea
                                placeholder="Share your experience with this product..."
                                value={form.comment}
                                onChange={(e) =>
                                  updateReviewForm(
                                    reviewKey,
                                    "comment",
                                    e.target.value
                                  )
                                }
                              />

                              <button
                                type="button"
                                className="submitReviewBtn"
                                disabled={
                                  reviewSubmitting[reviewKey] || !productId
                                }
                                onClick={() =>
                                  submitProductReview(order._id, item, index)
                                }
                              >
                                {reviewSubmitting[reviewKey]
                                  ? "Submitting..."
                                  : "Submit Review"}
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="statusHistoryBox premiumStatusHistory">
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

                {["Order Placed", "Processing", "Packed"].includes(
                  order.orderStatus
                ) && (
                  <button
                    className="cancelOrderBtn"
                    onClick={() => cancelOrder(order._id)}
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Orders;
