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
  const isOutOfStock = stock <= 0;

  return (
    <div className="premiumCaseCard">
      <div className="caseImageBox">
        <Link to={`/product/${productId}`}>
          <img src={currentImage} alt={product.name} />
        </Link>

        <span className={isOutOfStock ? "caseStock out" : "caseStock"}>
          {isOutOfStock ? "Out of Stock" : "In Stock"}
        </span>

        <button
          type="button"
          className={isWishlisted ? "caseWish activeWish" : "caseWish"}
          onClick={() => toggleWishlist(selectedProductForCart)}
        >
          <Heart size={18} fill={isWishlisted ? "red" : "none"} />
        </button>
      </div>

      <div className="caseInfo">
        <p className="caseBrand">
          {product.brand} • {product.model}
        </p>

        <Link to={`/product/${productId}`} className="caseNameLink">
          <h3>{product.name}</h3>
        </Link>

        {product.colorOptions?.length > 0 && (
          <div className="caseColors">
            {product.colorOptions.slice(0, 5).map((color) => (
              <button
                key={color.name}
                type="button"
                title={color.name}
                className={
                  selectedColor?.name === color.name
                    ? "caseColor activeCaseColor"
                    : "caseColor"
                }
                style={{
                  backgroundColor: color.hex || color.name || "#000",
                }}
                onClick={() => setSelectedColor(color)}
              />
            ))}
          </div>
        )}

        <div className="caseMetaRow">
          <span>{selectedColor?.name || "Default"}</span>

          {product.availableModels?.length > 0 && (
            <select
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

        <div className="caseRating">
          <Star size={15} fill="black" />
          <span>{product.rating || 4.8} ({product.reviews?.length || 0} reviews)</span>
        </div>

        <div className="caseBottom">
          <div>
            <h4>₹{product.price}</h4>
          </div>

          <button
            type="button"
            disabled={isOutOfStock}
            onClick={() => addToCart(selectedProductForCart)}
          >
            <ShoppingBag size={17} />
            Add
          </button>
        </div>

        <Link to={`/product/${productId}`} className="caseViewBtn">
          <Eye size={16} />
          View Details
        </Link>
      </div>
    </div>
  );
}

export default ProductCard;