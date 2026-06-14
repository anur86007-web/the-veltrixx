import { useState } from "react";
import { Heart, ShoppingBag, Star, Minus, Plus } from "lucide-react";
import { Link } from "react-router-dom";

function ProductCard({ product, cart, wishlist, addToCart, toggleWishlist }) {
  const productId = product._id || product.id;
  const firstColor = product.colorOptions?.[0] || null;

  const [selectedColor, setSelectedColor] = useState(firstColor);
  const [selectedModel, setSelectedModel] = useState(
  product.availableModels?.[0] || product.model
);
  const [quickView, setQuickView] = useState(false);

  const currentImage = selectedColor?.image || product.image;

  const selectedProductForCart = {
    ...product,
    selectedColor: selectedColor?.name || "Default",
    selectedImage: currentImage,
    selectedModel: selectedModel,
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

  const stockStatus =
    Number(product.stock) <= 0
      ? "Out of Stock"
      : Number(product.stock) <= 5
      ? "Low Stock"
      : "In Stock";

  return (
    <>
      <div className="productCard">
        <Link to={`/product/${productId}`} className="productImage">
          <img src={currentImage} alt={product.name} />
        </Link>

        <span
          className={`stockBadge ${stockStatus
            .replaceAll(" ", "")
            .toLowerCase()}`}
        >
          {stockStatus}
        </span>

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
            <>
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

              <p className="selectedColorText">
  Selected: {selectedColor?.name || "Default"}
</p>

{product.availableModels?.length > 0 && (
  <select
    className="modelSelect"
    value={selectedModel}
    onChange={(e) => setSelectedModel(e.target.value)}
  >
    {product.availableModels.map((model) => (
      <option key={model} value={model}>
        {model}
      </option>
    ))}
  </select>
)}

              <p className="selectedColorText">
                Selected: {selectedColor?.name || "Default"}
              </p>
            </>
          )}

          <button
            type="button"
            className="quickViewBtn"
            onClick={() => setQuickView(true)}
          >
            Quick View
          </button>

          <div className="rating">
            <Star size={15} fill="black" />
            <span>
              {product.rating || 4.8} ({product.reviews?.length || 0} reviews)
            </span>
          </div>

          <div className="priceRow">
  <h4>₹{product.price}</h4>

  {cartItem ? (
    <Link to="/cart" className="goCartBtn">
      Go to Cart
    </Link>
  ) : (
    <button type="button" onClick={() => addToCart(selectedProductForCart)}>
      <ShoppingBag size={17} />
      Add
    </button>
  )}
</div>
        </div>
      </div>

      {quickView && (
        <div className="quickModal">
          <div className="quickModalContent">
            <button
              type="button"
              className="closeModal"
              onClick={() => setQuickView(false)}
            >
              ✕
            </button>

            <img src={currentImage} alt={product.name} />

            <h2>{product.name}</h2>
            <p>{product.description}</p>
            <h3>₹{product.price}</h3>

            <button
              type="button"
              className="modalCartBtn"
              onClick={() => addToCart(selectedProductForCart)}
            >
              Add To Cart
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default ProductCard;