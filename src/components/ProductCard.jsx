import { useState } from "react";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { Link } from "react-router-dom";

function ProductCard({ product, wishlist, addToCart, toggleWishlist }) {
  const productId = product._id || product.id;
  const firstColor = product.colorOptions?.[0] || null;

  const [selectedColor, setSelectedColor] = useState(firstColor);
  const [selectedModel, setSelectedModel] = useState(
    product.availableModels?.[0] || product.model || "Default"
  );

  const currentImage = selectedColor?.image || product.image;
  const stock = Number(product.stock || 0);
  const isOutOfStock = stock <= 0;

  const averageRating = product.averageRating || product.rating || "4.8";
  const reviewCount = product.reviewCount || product.reviews?.length || 0;

  const isWishlisted = wishlist.some(
    (item) => (item._id || item.id) === productId
  );

  const cartProduct = {
    ...product,
    image: currentImage,
    selectedImage: currentImage,
    selectedColor: selectedColor?.name || "Default",
    selectedModel,
  };

  return (
    <div className="velProductCard">
      <Link to={`/product/${productId}`} className="velProductImageBox">
        <img src={currentImage} alt={product.name} />

        <div className="productBadgeStack">
          {product.isBestSeller && (
            <span className="productBadge bestSellerBadge">
              🔥 Best Seller
            </span>
          )}

          {product.isNewArrival && (
            <span className="productBadge newArrivalBadge">
              ✨ New Arrival
            </span>
          )}

          {product.isTrending && (
            <span className="productBadge trendingBadge">
              ⭐ Trending
            </span>
          )}
        </div>

        <span className={isOutOfStock ? "velStock out" : "velStock"}>
          {isOutOfStock ? "Out of Stock" : "In Stock"}
        </span>
      </Link>

      <button
        type="button"
        className={isWishlisted ? "velWish active" : "velWish"}
        onClick={() => toggleWishlist(cartProduct)}
      >
        <Heart size={18} fill={isWishlisted ? "#e11d48" : "none"} />
      </button>

      <div className="velProductInfo">
        <p className="velBrand">
          {product.brand} • {selectedModel || product.model}
        </p>

        <Link to={`/product/${productId}`} className="velProductName">
          {product.name}
        </Link>

        <div className="velRating">
          <Star size={14} fill="black" />
          <span>{averageRating}</span>
          <small>({reviewCount} reviews)</small>
        </div>

        {product.colorOptions?.length > 0 && (
          <div className="velColors">
            {product.colorOptions.slice(0, 4).map((color) => (
              <button
                key={color.name}
                type="button"
                title={color.name}
                className={
                  selectedColor?.name === color.name ? "activeColor" : ""
                }
                style={{ backgroundColor: color.hex || "#111" }}
                onClick={() => setSelectedColor(color)}
              />
            ))}
          </div>
        )}

        <div className="velBottom">
          <h3>₹{product.price}</h3>

          <button
            type="button"
            disabled={isOutOfStock}
            onClick={() => addToCart(cartProduct)}
          >
            <ShoppingBag size={17} />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;