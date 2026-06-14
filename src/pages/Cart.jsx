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
  const grandTotal = Math.max(subtotal + shipping - discount, 0);

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
      body: JSON.stringify({ code: couponCode, subtotal }),
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
    <div className="cartPage">
      <Link to="/" className="backLink">
        ← Continue Shopping
      </Link>

      <h1>Your Cart</h1>

      <div className="cartMainLayout">
        <div className="cartItemsArea">
          {cart.map((item) => {
            const itemKey = getCartKey(item);
            const lineTotal = Number(item.price || 0) * Number(item.qty || 1);

            return (
              <div className="cartProductCard" key={itemKey}>
                <img
                  className="cartProductImg"
                  src={item.selectedImage || item.image}
                  alt={item.name}
                />

                <div className="cartProductInfo">
                  <h3>{item.name}</h3>
                  <p>{item.brand} • {item.selectedModel || item.model}</p>
                  <p>Color: {item.selectedColor || "Default"}</p>
                  <strong>₹{item.price}</strong>
                  <small>Item Total: ₹{lineTotal}</small>
                </div>

                <div className="cartQtyControl">
                  <button onClick={() => decreaseQty(itemKey)}>
                    <Minus size={15} />
                  </button>
                  <span>{item.qty}</span>
                  <button onClick={() => increaseQty(itemKey)}>
                    <Plus size={15} />
                  </button>
                </div>

                <button
                  className="cartDeleteBtn"
                  onClick={() => removeFromCart(itemKey)}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            );
          })}
        </div>

        <div className="cartSummaryCard">
          <h2>Order Summary</h2>

          <div className="cartCouponRow">
            <input
              placeholder="Enter coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            />
            <button onClick={applyCoupon}>Apply</button>
          </div>

          {appliedCoupon && (
            <div className="cartAppliedCoupon">
              <span>
                Coupon Applied: <b>{appliedCoupon}</b>
              </span>
              <button onClick={removeCoupon}>Remove</button>
            </div>
          )}

          <div className="cartSummaryRow">
            <span>Subtotal</span>
            <b>₹{subtotal}</b>
          </div>

          <div className="cartSummaryRow">
            <span>Shipping</span>
            <b>{shipping === 0 ? "Free" : `₹${shipping}`}</b>
          </div>

          <div className="cartSummaryRow">
            <span>Discount</span>
            <b>- ₹{discount}</b>
          </div>

          <div className="cartSummaryRow cartGrandTotal">
            <span>Grand Total</span>
            <b>₹{grandTotal}</b>
          </div>

          {shipping > 0 && (
            <p className="cartShippingNote">
              Add products worth ₹{999 - subtotal} more for free shipping.
            </p>
          )}

          <Link to="/payment">
            <button className="cartPaymentBtn">Proceed to Payment</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Cart;