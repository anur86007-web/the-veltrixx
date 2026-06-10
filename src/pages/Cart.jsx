import { Link } from "react-router-dom";
import { Minus, Plus, Trash2 } from "lucide-react";

function Cart({ cart, increaseQty, decreaseQty, removeFromCart }) {
  const getId = (item) => item._id || item.id;

  const getCartKey = (item) => {
    return (
      item.cartKey ||
      `${getId(item)}-${item.selectedModel || item.model || "Default"}-${
        item.selectedColor || "Default"
      }`
    );
  };

  const total = cart.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.qty),
    0
  );

  if (cart.length === 0) {
    return (
      <div className="emptyCartPage">
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

      <div className="listBox">
        {cart.map((item) => {
          const itemKey = getCartKey(item);

          return (
            <div className="cartItem" key={itemKey}>
              <img
                src={item.selectedImage || item.image}
                alt={item.name}
              />

              <div className="cartInfo">
                <h3>{item.name}</h3>

                <p>
                  {item.brand} • {item.selectedModel || item.model}
                </p>

                <p>
                  Color: {item.selectedColor || "Default"}
                </p>

                <h4>₹{item.price}</h4>
              </div>

              <div className="qtyBox">
                <button onClick={() => decreaseQty(itemKey)}>
                  <Minus size={16} />
                </button>

                <span>{item.qty}</span>

                <button onClick={() => increaseQty(itemKey)}>
                  <Plus size={16} />
                </button>
              </div>

              <button
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
        <h2>Total: ₹{total}</h2>

        <Link to="/payment">
          <button>Proceed to Payment</button>
        </Link>
      </div>
    </div>
  );
}

export default Cart;