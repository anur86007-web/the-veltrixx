import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PackageCheck, Truck, XCircle, ShoppingBag } from "lucide-react";

const API = "https://the-veltrixx-backend.onrender.com/api/orders/my-orders";
const CANCEL_API = "https://the-veltrixx-backend.onrender.com/api/orders/cancel";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchOrders();
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

          <span>{orders.length} order{orders.length > 1 ? "s" : ""}</span>
        </div>

        <div className="ordersList">
          {orders.map((order) => {
            const currentIndex = getCurrentIndex(order.orderStatus);
            const isCancelled = order.orderStatus === "Cancelled";

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
                    {isCancelled ? <XCircle size={16} /> : <PackageCheck size={16} />}
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
                    const productId = item.productId || item._id || item.id;

                    return (
                      <Link
                        to={productId ? `/product/${productId}` : "#"}
                        className="orderItemCard"
                        key={index}
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