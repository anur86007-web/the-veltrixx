import { Heart, ShoppingBag, Star, Minus, Plus } from "lucide-react";
import { Link } from "react-router-dom";

function ProductCard({ product, cart, wishlist, addToCart, toggleWishlist }) {
  const productId = product._id || product.id;

  const isWishlisted = wishlist.some(
    (item) => (item._id || item.id) === productId
  );

  const cartItem = cart.find(
    (item) => (item._id || item.id) === productId
  );

  const firstColor = product.colorOptions?.[0];

  const defaultProductForCart = {
    ...product,
    selectedColor: firstColor?.name || "Default",
    selectedImage: firstColor?.image || product.image,
    selectedModel: product.availableModels?.[0] || product.model,
    image: firstColor?.image || product.image,
  };

  return (
    <div className="productCard">
      <Link to={`/product/${productId}`} className="productImage">
        <img src={product.image} alt={product.name} />
      </Link>

      <button
        className={isWishlisted ? "wishBtn activeWish" : "wishBtn"}
        onClick={() => toggleWishlist(product)}
      >
        <Heart size={18} fill={isWishlisted ? "red" : "none"} />
      </button>

      <div className="productInfo">
        <p className="brand">
          {product.brand} • {product.model}
        </p>

        <h3>{product.name}</h3>

        {product.colorOptions?.length > 0 && (
          <div className="cardColorPreview">
            {product.colorOptions.slice(0, 5).map((color) => (
              <span
                key={color.name}
                title={color.name}
                className="cardColorDot"
                style={{ "--circle-color": color.hex || color.name }}
              />
            ))}
          </div>
        )}

        <div className="rating">
          <Star size={15} fill="black" />
          <span>
            {product.rating || 4.8} ({product.reviews?.length || 0} reviews)
          </span>
        </div>

        <div className="priceRow">
          <h4>₹{product.price}</h4>

          {cartItem ? (
            <div className="qtyBox">
              <button onClick={() => addToCart({ ...defaultProductForCart, qtyAction: "minus" })}>
                <Minus size={14} />
              </button>

              <span>{cartItem.qty}</span>

              <button onClick={() => addToCart(defaultProductForCart)}>
                <Plus size={14} />
              </button>
            </div>
          ) : (
            <button onClick={() => addToCart(defaultProductForCart)}>
              <ShoppingBag size={17} />
              Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductCard;