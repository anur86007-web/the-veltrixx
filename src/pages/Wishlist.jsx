import { Link } from "react-router-dom";
import { Heart, ShoppingBag } from "lucide-react";

function Wishlist({ wishlist, toggleWishlist }) {
  const getId = (item) => item._id || item.id;

  if (wishlist.length === 0) {
    return (
      <div className="wishlistPage">
        <div className="emptyWishlistBox">
          <Heart size={54} />
          <h1>Your Wishlist is Empty</h1>
          <p>Save your favourite phone cases and find them here later.</p>

          <Link to="/">
            <button>Explore Collection</button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlistPage">
      <div className="wishlistInner">
        <Link to="/" className="backLink">
          ← Back to shop
        </Link>

        <div className="wishlistHeader">
          <div>
            <p>Saved Collection</p>
            <h1>Your Wishlist</h1>
          </div>

          <span>{wishlist.length} item{wishlist.length > 1 ? "s" : ""}</span>
        </div>

        <div className="wishlistGrid">
          {wishlist.map((item) => {
            const productId = getId(item);

            return (
              <div className="wishlistCard" key={productId}>
                <Link
                  to={`/product/${productId}`}
                  className="wishlistImageLink"
                >
                  <img src={item.selectedImage || item.image} alt={item.name} />
                </Link>

                <button
                  type="button"
                  className="wishlistHeartBtn"
                  onClick={() => toggleWishlist(item)}
                  title="Remove from wishlist"
                >
                  <Heart size={19} fill="red" />
                </button>

                <div className="wishlistInfo">
                  <p className="wishlistBrand">
                    {item.brand} • {item.model}
                  </p>

                  <Link
                    to={`/product/${productId}`}
                    className="wishlistNameLink"
                  >
                    <h3>{item.name}</h3>
                  </Link>

                  <div className="wishlistBottom">
                    <strong>₹{item.price}</strong>

                    <Link to={`/product/${productId}`} className="wishlistViewBtn">
                      <ShoppingBag size={16} />
                      View Product
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Wishlist;