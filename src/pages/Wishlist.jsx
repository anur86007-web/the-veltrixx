import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

function Wishlist({ wishlist, toggleWishlist }) {
  return (
    <div className="pageContainer">
      <Link to="/" className="backLink">
        ← Back to shop
      </Link>

      <h1>Your Wishlist</h1>

      {wishlist.length === 0 ? (
        <p>No items in wishlist.</p>
      ) : (
        <div className="listBox">
          {wishlist.map((item) => (
            <div className="cartItem" key={item.id}>
              <Link to={`/product/${item.id}`}>
                <img src={item.image} alt={item.name} />
              </Link>

              <Link to={`/product/${item.id}`} className="cartInfo itemLink">
                <h3>{item.name}</h3>
                <p>{item.brand} • {item.model}</p>
                <h4>₹{item.price}</h4>
              </Link>

              <button
                className="deleteBtn activeWish"
                onClick={() => toggleWishlist(item)}
              >
                <Heart size={18} fill="red" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Wishlist;