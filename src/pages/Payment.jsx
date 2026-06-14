import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const ORDER_API = "https://the-veltrixx-backend.onrender.com/api/orders";
const PAYMENT_API = "https://the-veltrixx-backend.onrender.com/api/payment";

function Payment({ cart, placeOrder }) {
  const navigate = useNavigate();

  const savedProfile =
    JSON.parse(localStorage.getItem("veltrixx_profile")) || {};

  const couponData =
    JSON.parse(localStorage.getItem("veltrixx_coupon")) || null;

  const subtotal = cart.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.qty || 1),
    0
  );

  const shipping = subtotal >= 999 ? 0 : 49;
  const discount = couponData?.discount ? Number(couponData.discount) : 0;
  const total = Math.max(subtotal + shipping - discount, 0);

  const [form, setForm] = useState({
    name: savedProfile.name || "",
    phone: savedProfile.phone || "",
    address: savedProfile.address || "",
    landmark: savedProfile.landmark || "",
    city: savedProfile.city || "",
    state: savedProfile.state || "",
    pincode: savedProfile.pincode || "",
  });

  const [paymentMethod, setPaymentMethod] = useState("");
  const [isEditingAddress, setIsEditingAddress] = useState(
    !savedProfile.address
  );
  const [loading, setLoading] = useState(false);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);

      document.body.appendChild(script);
    });
  };

  const validateAddress = () => {
    if (
      !form.name ||
      !form.phone ||
      !form.address ||
      !form.city ||
      !form.state ||
      !form.pincode
    ) {
      alert("Please fill all required address details");
      return false;
    }

    if (form.phone.length < 10) {
      alert("Please enter valid phone number");
      return false;
    }

    if (form.pincode.length < 6) {
      alert("Please enter valid pincode");
      return false;
    }

    return true;
  };

  const saveAddress = () => {
    if (!validateAddress()) return;

    localStorage.setItem("veltrixx_profile", JSON.stringify(form));
    setIsEditingAddress(false);
    alert("Address saved successfully");
  };

  const validateOrder = () => {
    if (cart.length === 0) {
      alert("Cart is empty");
      return false;
    }

    if (isEditingAddress) {
      alert("Please save delivery address first");
      return false;
    }

    if (!paymentMethod) {
      alert("Please select payment method");
      return false;
    }

    const token = localStorage.getItem("veltrixx_token");

    if (!token) {
      alert("Please login first");
      navigate("/login");
      return false;
    }

    return true;
  };

  const saveOrder = async (paymentStatus, method, razorpayData = {}) => {
    const token = localStorage.getItem("veltrixx_token");

    const orderData = {
      items: cart.map((item) => ({
        productId: item._id || item.id,
        name: item.name,
        brand: item.brand,
        model: item.selectedModel || item.model,
        price: Number(item.price),
        qty: Number(item.qty),
        image: item.selectedImage || item.image,
        selectedImage: item.selectedImage || item.image,
        selectedColor: item.selectedColor || "Default",
        selectedModel: item.selectedModel || item.model,
      })),

      customer: form,

      subtotal,
      shipping,
      discount,
      couponCode: couponData?.code || "",
      total,

      paymentMethod: method,
      paymentStatus,
      orderStatus: "Order Placed",

      razorpayOrderId: razorpayData.razorpay_order_id || "",
      razorpayPaymentId: razorpayData.razorpay_payment_id || "",
    };

    const res = await fetch(ORDER_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
    });

    const data = await res.json();

    if (!data.success) {
      alert(data.message || "Order failed");
      return null;
    }

    localStorage.removeItem("veltrixx_coupon");
    placeOrder(data.order);
    return data.order;
  };

  const placeCODOrder = async () => {
    const order = await saveOrder(
      "Pending - Cash On Delivery",
      "Cash On Delivery"
    );

    if (order) {
      alert("Order placed successfully");
      navigate("/orders");
    }
  };

  const handleWhatsAppPayment = async () => {
    const order = await saveOrder(
      "Pending - WhatsApp Payment",
      "WhatsApp Payment"
    );

    if (!order) return;

    const productsText = cart
      .map(
        (item, index) =>
          `${index + 1}. ${item.name} (${item.brand} ${
            item.selectedModel || item.model
          }) - ₹${item.price} × ${item.qty} - Color: ${
            item.selectedColor || "Default"
          }`
      )
      .join("\n");

    const message = `
Hello THE VELTRIXX,

I want to place this order:

Order ID: ${order._id}

Customer Details:
Name: ${form.name}
Phone: ${form.phone}

Delivery Address:
${form.address}
${form.landmark ? form.landmark + "," : ""}
${form.city}, ${form.state} - ${form.pincode}

Products:
${productsText}

Subtotal: ₹${subtotal}
Shipping: ${shipping === 0 ? "Free" : `₹${shipping}`}
Discount: ₹${discount}
Coupon: ${couponData?.code || "Not applied"}
Total Amount: ₹${total}

Payment Method: WhatsApp Payment

Please share payment details / QR code.
`;

    const whatsappNumber = "919899723391";

    window.open(
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`,
      "_blank"
    );

    alert("Order created. Continue payment on WhatsApp.");
    navigate("/orders");
  };

  const handleRazorpayPayment = async () => {
    const scriptLoaded = await loadRazorpayScript();

    if (!scriptLoaded) {
      alert("Razorpay script failed to load");
      return;
    }

    const orderRes = await fetch(`${PAYMENT_API}/create-order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount: total }),
    });

    const orderData = await orderRes.json();

    if (!orderData.success) {
      alert(orderData.message || "Could not create Razorpay order");
      return;
    }

    const options = {
      key: orderData.key,
      amount: orderData.order.amount,
      currency: "INR",
      name: "THE VELTRIXX",
      description: "Phone Case Order",
      order_id: orderData.order.id,

      prefill: {
        name: form.name,
        contact: form.phone,
      },

      theme: {
        color: "#111111",
      },

      handler: async function (response) {
        const verifyRes = await fetch(`${PAYMENT_API}/verify`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(response),
        });

        const verifyData = await verifyRes.json();

        if (!verifyData.success) {
          alert("Payment verification failed");
          return;
        }

        const order = await saveOrder(
          "Paid",
          "Razorpay Online Payment",
          response
        );

        if (order) {
          alert("Payment successful. Order placed.");
          navigate("/orders");
        }
      },
    };

    const razorpay = new window.Razorpay(options);

    razorpay.on("payment.failed", function (response) {
      console.log("PAYMENT FAILED:", response);
      alert(response.error.description || "Payment failed");
    });

    razorpay.open();
  };

  const handlePlaceOrder = async () => {
    if (!validateOrder()) return;

    try {
      setLoading(true);

      if (paymentMethod === "Cash On Delivery") {
        await placeCODOrder();
      } else if (paymentMethod === "WhatsApp Payment") {
        await handleWhatsAppPayment();
      } else if (paymentMethod === "Razorpay Online Payment") {
        await handleRazorpayPayment();
      }
    } catch (error) {
      console.log(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="paymentPage">
      <div className="paymentContainer">
        <Link to="/cart" className="backLink">
          ← Back to cart
        </Link>

        <h1>Checkout</h1>

        <div className="paymentLayout">
          <div className="paymentLeft">
            <div className="checkoutSection">
              <div className="sectionTitleRow">
                <h2>Delivery Address</h2>

                {!isEditingAddress && (
                  <button
                    type="button"
                    className="editAddressBtn"
                    onClick={() => setIsEditingAddress(true)}
                  >
                    Edit
                  </button>
                )}
              </div>

              {isEditingAddress ? (
                <>
                  <input
                    placeholder="Full Name *"
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                  />

                  <input
                    placeholder="Phone Number *"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                  />

                  <input
                    placeholder="House No, Street, Area *"
                    value={form.address}
                    onChange={(e) =>
                      setForm({ ...form, address: e.target.value })
                    }
                  />

                  <input
                    placeholder="Landmark"
                    value={form.landmark}
                    onChange={(e) =>
                      setForm({ ...form, landmark: e.target.value })
                    }
                  />

                  <input
                    placeholder="City *"
                    value={form.city}
                    onChange={(e) =>
                      setForm({ ...form, city: e.target.value })
                    }
                  />

                  <input
                    placeholder="State *"
                    value={form.state}
                    onChange={(e) =>
                      setForm({ ...form, state: e.target.value })
                    }
                  />

                  <input
                    placeholder="Pincode *"
                    value={form.pincode}
                    onChange={(e) =>
                      setForm({ ...form, pincode: e.target.value })
                    }
                  />

                  <button type="button" onClick={saveAddress}>
                    Save Address
                  </button>
                </>
              ) : (
                <div className="addressSummary">
                  <h3>{form.name}</h3>
                  <p>{form.phone}</p>
                  <p>
                    {form.address}
                    {form.landmark ? `, ${form.landmark}` : ""}
                  </p>
                  <p>
                    {form.city}, {form.state} - {form.pincode}
                  </p>
                </div>
              )}
            </div>

            <div className="checkoutSection">
              <h2>Payment Method</h2>

              {[
                "Cash On Delivery",
                "WhatsApp Payment",
                "Razorpay Online Payment",
              ].map((method) => (
                <label
                  key={method}
                  className={
                    paymentMethod === method
                      ? "paymentOption selectedPayment"
                      : "paymentOption"
                  }
                >
                  <input
                    type="radio"
                    name="payment"
                    value={method}
                    checked={paymentMethod === method}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <span>{method}</span>
                </label>
              ))}

              <p className="paymentNote">
                Choose COD, WhatsApp Payment, or Razorpay online payment.
              </p>
            </div>
          </div>

          <div className="paymentSummary">
            <h2>Order Summary</h2>

            <div className="paymentSummaryRow">
              <span>Subtotal</span>
              <b>₹{subtotal}</b>
            </div>

            <div className="paymentSummaryRow">
              <span>Shipping</span>
              <b>{shipping === 0 ? "Free" : `₹${shipping}`}</b>
            </div>

            <div className="paymentSummaryRow">
              <span>Discount</span>
              <b>- ₹{discount}</b>
            </div>

            {couponData?.code && (
              <p className="paymentCouponText">
                Coupon Applied: <b>{couponData.code}</b>
              </p>
            )}

            <div className="paymentSummaryRow paymentGrandTotal">
              <span>Total Amount</span>
              <b>₹{total}</b>
            </div>

            <button onClick={handlePlaceOrder} disabled={loading}>
              {loading
                ? "Processing..."
                : paymentMethod === "WhatsApp Payment"
                ? "Continue on WhatsApp"
                : paymentMethod === "Razorpay Online Payment"
                ? "Pay Online"
                : "Place COD Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Payment;