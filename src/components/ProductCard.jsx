import { useState } from "react";
import { Heart, ShoppingBag, Star, Minus, Plus } from "lucide-react";
import { Link } from "react-router-dom";

function ProductCard({ product, cart, wishlist, addToCart, toggleWishlist }) {
  const productId = product._id || product.id;
  const firstColor = product.colorOptions?.[0] || null;

  const [selectedColor, setSelectedColor] = useState(firstColor);

  const currentImage = selectedColor?.image || product.image;

  const selectedProductForCart = {
    ...product,
    selectedColor: selectedColor?.name || "Default",
    selectedImage: currentImage,
    selectedModel: product.availableModels?.[0] || product.model,
    image: currentImage,
  };

  const isWishlisted = wishlist.some(
    (item) => (item._id || item.id) === productId
  );

  const cartItem = cart.find(
    (item) =>
      (item._id || item.id) === productId &&
      item.selectedColor === selectedProductForCart.selectedColor
  );

  return (
    <div className="productCard">
      <Link to={`/product/${productId}`} className="productImage">
        <img src={currentImage} alt={product.name} />
      </Link>

      <button
        type="button"
        className={isWishlisted ? "wishBtn activeWish" : "wishBtn"}
        onClick={() => toggleWishlist(selectedProductForCart)}
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
            {product.colorOptions.slice(0, 6).map((color) => (
              <button
                type="button"
                key={color.name}
                title={color.name}
                className={
                  selectedColor?.name === color.name
                    ? "cardColorDot activeColorDot"
                    : "cardColorDot"
                }
                style={{ backgroundColor: color.hex || "#000000" }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedColor(color);
                }}
              ></button>
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
              <button
                type="button"
                onClick={() =>
                  addToCart({
                    ...selectedProductForCart,
                    qtyAction: "minus",
                  })
                }
              >
                <Minus size={14} />
              </button>

              <span>{cartItem.qty}</span>

              <button
                type="button"
                onClick={() => addToCart(selectedProductForCart)}
              >
                <Plus size={14} />
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => addToCart(selectedProductForCart)}>
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