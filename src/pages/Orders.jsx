import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API = "http://localhost:5000/api/orders/my-orders";
const CANCEL_API = "http://localhost:5000/api/orders/cancel";

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
        setOrders(data.orders);
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
    return trackingSteps.indexOf(status);
  };

  return (
    <div className="pageContainer">
      <Link to="/" className="backLink">
        ← Back to shop
      </Link>

      <h1>My Orders</h1>

      {loading ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        <div className="listBox">
          {orders.map((order) => {
            const currentIndex = getCurrentIndex(order.orderStatus);

            return (
              <div className="orderCard" key={order._id}>
                <div className="orderTop">
                  <div>
                    <h3>Order #{order._id.slice(-6)}</h3>
                    <p>{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>

                  <strong
                    className={
                      order.orderStatus === "Cancelled"
                        ? "cancelStatus"
                        : "orderStatusPill"
                    }
                  >
                    {order.orderStatus}
                  </strong>
                </div>

                {order.orderStatus === "Cancelled" ? (
                  <div className="cancelTimeline">
                    <h3>Order Cancelled</h3>
                    <p>This order has been cancelled.</p>
                  </div>
                ) : (
                  <div className="timelineBox">
                    <h3>Order Tracking</h3>

                    <div className="timeline">
                      {trackingSteps.map((step, index) => (
                        <div
                          key={step}
                          className={
                            index <= currentIndex
                              ? "timelineStep completedStep"
                              : "timelineStep"
                          }
                        >
                          <div className="timelineCircle">
                            {index <= currentIndex ? "✓" : index + 1}
                          </div>

                          <div>
                            <h4>{step}</h4>
                            <p>
                              {index <= currentIndex ? "Completed" : "Pending"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {order.items.map((item, index) => (
                  <div className="cartItem" key={index}>
                    <img
                      src={item.selectedImage || item.image}
                      alt={item.name}
                    />

                    <div>
                      <h3>{item.name}</h3>
                      <p>
                        {item.brand} • {item.model}
                      </p>
                      <p>Color: {item.selectedColor || "Default"}</p>
                      <h4>
                        ₹{item.price} × {item.qty}
                      </h4>
                    </div>
                  </div>
                ))}

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

                <h2>Total: ₹{order.total}</h2>
                <p>Payment: {order.paymentStatus}</p>
                <p>Method: {order.paymentMethod}</p>

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
      )}
    </div>
  );
}

export default Orders;