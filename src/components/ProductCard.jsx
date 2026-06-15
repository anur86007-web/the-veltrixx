import { useState } from "react";
import { Heart, ShoppingBag, Star, Eye } from "lucide-react";
import { Link } from "react-router-dom";

function ProductCard({ product, cart, wishlist, addToCart, toggleWishlist }) {
  const productId = product._id || product.id;
  const firstColor = product.colorOptions?.[0] || null;

  const [selectedColor, setSelectedColor] = useState(firstColor);
  const [selectedModel, setSelectedModel] = useState(
    product.availableModels?.[0] || product.model || "Default"
  );
  const [quickView, setQuickView] = useState(false);

  const currentImage = selectedColor?.image || product.image;

  const selectedProductForCart = {
    ...product,
    selectedColor: selectedColor?.name || "Default",
    selectedImage: currentImage,
    selectedModel,
    image: currentImage,
  };

  const isWishlisted = wishlist.some(
    (item) => (item._id || item.id) === productId
  );

  const stock = Number(product.stock || 0);

  const stockStatus =
    stock <= 0 ? "Out of Stock" : stock <= 5 ? "Low Stock" : "In Stock";

  const isOutOfStock = stock <= 0;

  const cartItem = cart.find(
    (item) =>
      (item._id || item.id) === productId &&
      item.selectedColor === selectedProductForCart.selectedColor &&
      (item.selectedModel || item.model) === selectedProductForCart.selectedModel
  );

  return (
    <>
      <div className="productCard premiumProductCard">
        <div className="productImageWrap">
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
            title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart size={18} fill={isWishlisted ? "red" : "none"} />
          </button>
        </div>

        <div className="productInfo">
          <p className="brand">
            {product.brand} • {product.model}
          </p>

          <Link to={`/product/${productId}`} className="productTitleLink">
            <h3>{product.name}</h3>
          </Link>

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
                  style={{
                    "--dot-color": color.hex || color.name || "#000000",
                    backgroundColor: color.hex || color.name || "#000000",
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedColor(color);
                  }}
                />
              ))}
            </div>
          )}

          <div className="selectedMeta">
            <span>{selectedColor?.name || "Default"}</span>

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
          </div>

          <div className="rating">
            <Star size={15} fill="black" />
            <span>
              {product.rating || 4.8} ({product.reviews?.length || 0} reviews)
            </span>
          </div>

          <div className="priceRow">
            <div>
              <h4>₹{product.price}</h4>
              {cartItem && <small>Already in cart</small>}
            </div>

            <button
              type="button"
              disabled={isOutOfStock}
              className={isOutOfStock ? "disabledCartBtn" : ""}
              onClick={() => addToCart(selectedProductForCart)}
            >
              <ShoppingBag size={17} />
              {isOutOfStock ? "Sold Out" : "Add"}
            </button>
          </div>

          <button
            type="button"
            className="quickViewBtn"
            onClick={() => setQuickView(true)}
          >
            <Eye size={16} />
            Quick View
          </button>
        </div>
      </div>

      {quickView && (
        <div className="quickModal">
          <div className="quickModalContent premiumQuickModal">
            <button
              type="button"
              className="closeModal"
              onClick={() => setQuickView(false)}
            >
              ✕
            </button>

            <img src={currentImage} alt={product.name} />

            <p className="brand">
              {product.brand} • {selectedModel}
            </p>

            <h2>{product.name}</h2>

            <p>{product.description || "Premium phone case by THE VELTRIXX."}</p>

            <h3>₹{product.price}</h3>

            <div className="quickModalActions">
              <Link to={`/product/${productId}`} className="viewDetailsBtn">
                View Details
              </Link>

              <button
                type="button"
                className="modalCartBtn"
                disabled={isOutOfStock}
                onClick={() => {
                  addToCart(selectedProductForCart);
                  setQuickView(false);
                }}
              >
                {isOutOfStock ? "Sold Out" : "Add To Cart"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ProductCard;