import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";

const COUPON_API = "https://the-veltrixx-backend.onrender.com/api/coupons";

function Cart({ cart, increaseQty, decreaseQty, removeFromCart }) {
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState("");

  useEffect(() => {
    const savedCoupon = JSON.parse(localStorage.getItem("veltrixx_coupon"));

    if (savedCoupon) {
      setCouponCode(savedCoupon.code || "");
      setAppliedCoupon(savedCoupon.code || "");
      setDiscount(Number(savedCoupon.discount || 0));
    }
  }, []);

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

  const safeDiscount = Math.min(Number(discount || 0), subtotal);
  const shipping = subtotal >= 999 ? 0 : 49;
  const grandTotal = Math.max(subtotal + shipping - safeDiscount, 0);

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      alert("Please enter coupon code");
      return;
    }

    try {
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
        localStorage.removeItem("veltrixx_coupon");
        return;
      }

      const finalDiscount = Number(data.discount || 0);

      setDiscount(finalDiscount);
      setAppliedCoupon(data.coupon.code);

      localStorage.setItem(
        "veltrixx_coupon",
        JSON.stringify({
          code: data.coupon.code,
          discount: finalDiscount,
        })
      );

      alert("Coupon applied successfully");
    } catch (error) {
      alert("Coupon apply failed");
      console.log(error);
    }
  };

  const removeCoupon = () => {
    setCouponCode("");
    setDiscount(0);
    setAppliedCoupon("");
    localStorage.removeItem("veltrixx_coupon");
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
      <div className="cartPageInner">
        <Link to="/" className="backLink">
          ← Continue Shopping
        </Link>

        <div className="cartHeader">
          <div>
            <p>Shopping Bag</p>
            <h1>Your Cart</h1>
          </div>

          <span>{cart.length} item{cart.length > 1 ? "s" : ""}</span>
        </div>

        <div className="cartMainLayout">
          <div className="cartItemsArea">
            {cart.map((item) => {
              const itemKey = getCartKey(item);
              const productId = getId(item);
              const lineTotal =
                Number(item.price || 0) * Number(item.qty || 1);

              return (
                <div className="cartProductCard" key={itemKey}>
                  <Link
                    to={`/product/${productId}`}
                    className="cartProductImageLink"
                  >
                    <img
                      src={item.selectedImage || item.image}
                      alt={item.name}
                    />
                  </Link>

                  <div className="cartProductInfo">
                    <Link
                      to={`/product/${productId}`}
                      className="cartProductNameLink"
                    >
                      <h3>{item.name}</h3>
                    </Link>

                    <p>
                      {item.brand} • {item.selectedModel || item.model}
                    </p>

                    <p>Color: {item.selectedColor || "Default"}</p>

                    <div className="cartPriceInfo">
                      <strong>₹{item.price}</strong>
                      <small>Item Total: ₹{lineTotal}</small>
                    </div>
                  </div>

                  <div className="cartQtyControl">
                    <button type="button" onClick={() => decreaseQty(itemKey)}>
                      <Minus size={15} />
                    </button>

                    <span>{item.qty}</span>

                    <button type="button" onClick={() => increaseQty(itemKey)}>
                      <Plus size={15} />
                    </button>
                  </div>

                  <button
                    type="button"
                    className="cartDeleteBtn"
                    onClick={() => removeFromCart(itemKey)}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              );
            })}
          </div>

          <aside className="cartSummaryCard">
            <h2>Order Summary</h2>

            <div className="cartCouponRow">
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
              <div className="cartAppliedCoupon">
                <span>
                  Coupon Applied: <b>{appliedCoupon}</b>
                </span>

                <button type="button" onClick={removeCoupon}>
                  Remove
                </button>
              </div>
            )}

            <div className="cartSummaryDivider"></div>

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
              <b>- ₹{safeDiscount}</b>
            </div>

            <div className="cartSummaryDivider"></div>

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
          </aside>
        </div>
      </div>
    </div>
  );
}

export default Cart;