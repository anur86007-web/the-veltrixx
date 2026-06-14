import { useState } from "react";
import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";

const COUPON_API = "https://the-veltrixx-backend.onrender.com/api/coupons";

function Cart({ cart, increaseQty, decreaseQty, removeFromCart }) {
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState("");

  const getId = (item) => item._id || item.id;

  const getCartKey = (item) =>
    item.cartKey ||
    `${getId(item)}-${item.selectedModel || item.model || "Default"}-${
      item.selectedColor || "Default"
    }`;

  const subtotal = cart.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.qty || 1),
    0
  );

  const shipping = subtotal >= 999 ? 0 : 49;
  const grandTotal = subtotal + shipping - discount;

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      alert("Please enter coupon code");
      return;
    }

    const res = await fetch(`${COUPON_API}/apply`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code: couponCode,
        subtotal,
      }),
    });

    const data = await res.json();

    if (!data.success) {
      alert(data.message || "Invalid coupon");
      setDiscount(0);
      setAppliedCoupon("");
      return;
    }

    setDiscount(Number(data.discount || 0));
    setAppliedCoupon(data.coupon.code);
    alert("Coupon applied successfully");
  };

  const removeCoupon = () => {
    setCouponCode("");
    setDiscount(0);
    setAppliedCoupon("");
  };

  if (cart.length === 0) {
    return (
      <div className="emptyCartPage">
        <ShoppingBag size={54} />
        <h1>Your Cart is Empty</h1>
        <p>Add products to your cart to continue shopping.</p>

        <Link to="/">
          <button className="shopNowBtn">Shop Now</button>
        </Link>
      </div>
    );
  }

  return (
    <div className="pageContainer">
      <Link to="/" className="backLink">
        ← Continue Shopping
      </Link>

      <h1>Your Cart</h1>

      <div className="cartLayout">
        <div className="listBox">
          {cart.map((item) => {
            const itemKey = getCartKey(item);
            const lineTotal = Number(item.price || 0) * Number(item.qty || 1);

            return (
              <div className="cartItem" key={itemKey}>
                <img src={item.selectedImage || item.image} alt={item.name} />

                <div className="cartInfo">
                  <h3>{item.name}</h3>
                  <p>
                    {item.brand} • {item.selectedModel || item.model || "Default"}
                  </p>
                  <p>Color: {item.selectedColor || "Default"}</p>
                  <h4>₹{item.price}</h4>
                  <small>Item Total: ₹{lineTotal}</small>
                </div>

                <div className="qtyBox">
                  <button type="button" onClick={() => decreaseQty(itemKey)}>
                    <Minus size={16} />
                  </button>

                  <span>{item.qty}</span>

                  <button type="button" onClick={() => increaseQty(itemKey)}>
                    <Plus size={16} />
                  </button>
                </div>

                <button
                  type="button"
                  className="deleteBtn"
                  onClick={() => removeFromCart(itemKey)}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            );
          })}
        </div>

        <div className="checkoutBox">
          <h2>Order Summary</h2>

          <div className="couponBox">
            <input
              placeholder="Enter coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            />

            <button type="button" onClick={applyCoupon}>
              Apply
            </button>
          </div>

          {appliedCoupon && (
            <p className="appliedCoupon">
              Coupon Applied: <b>{appliedCoupon}</b>
              <button type="button" onClick={removeCoupon}>
                Remove
              </button>
            </p>
          )}

          <div className="summaryRow">
            <span>Subtotal</span>
            <strong>₹{subtotal}</strong>
          </div>

          <div className="summaryRow">
            <span>Shipping</span>
            <strong>{shipping === 0 ? "Free" : `₹${shipping}`}</strong>
          </div>

          <div className="summaryRow">
            <span>Discount</span>
            <strong>- ₹{discount}</strong>
          </div>

          <div className="summaryRow grandTotal">
            <span>Grand Total</span>
            <strong>₹{grandTotal}</strong>
          </div>

          {shipping > 0 && (
            <p className="shippingNote">
              Add products worth ₹{999 - subtotal} more for free shipping.
            </p>
          )}

          <Link to="/payment">
            <button className="paymentBtn">Proceed to Payment</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Cart;