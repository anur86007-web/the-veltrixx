import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

const REVIEW_API = "https://the-veltrixx-backend.onrender.com/api/reviews";
const PRODUCT_API = "https://the-veltrixx-backend.onrender.com/api/products";

function ProductDetails({ products, addToCart }) {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [productLoading, setProductLoading] = useState(true);
  const [reviews, setReviews] = useState([]);

  const [selectedImage, setSelectedImage] = useState("");
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedModel, setSelectedModel] = useState("");

  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: "",
  });

  const loadProduct = async () => {
    try {
      setProductLoading(true);

      const localProduct = products.find(
        (item) => String(item._id || item.id) === String(id)
      );

      if (localProduct) {
        setProduct(localProduct);
        return;
      }

      const res = await fetch(`${PRODUCT_API}/${id}`);
      const data = await res.json();

      if (data.success) {
        setProduct(data.product);
      } else {
        setProduct(null);
      }
    } catch (error) {
      console.log("Product load error:", error);
      setProduct(null);
    } finally {
      setProductLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${REVIEW_API}/product/${id}`);
      const data = await res.json();

      if (data.success) {
        setReviews(data.reviews || []);
      }
    } catch (error) {
      console.log("Review fetch error:", error);
    }
  };

  useEffect(() => {
    loadProduct();
    fetchReviews();
  }, [id, products]);

  useEffect(() => {
    if (product) {
      const firstColor = product.colorOptions?.[0] || null;

      setSelectedColor(firstColor);
      setSelectedImage(firstColor?.image || product.image || "");
      setSelectedModel(product.availableModels?.[0] || product.model || "");
    }
  }, [product]);

  const submitReview = async () => {
    if (!reviewForm.comment.trim()) {
      alert("Please write a review");
      return;
    }

    const token = localStorage.getItem("veltrixx_token");

    if (!token) {
      alert("Please login first");
      return;
    }

    try {
      const res = await fetch(REVIEW_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          product: id,
          rating: Number(reviewForm.rating),
          comment: reviewForm.comment,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message || "Review add failed");
        return;
      }

      alert("Review added successfully");

      setReviewForm({
        rating: 5,
        comment: "",
      });

      fetchReviews();
    } catch (error) {
      console.log("Review submit error:", error);
      alert("Something went wrong");
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    if (Number(product.stock) <= 0) {
      alert("This product is out of stock");
      return;
    }

    addToCart({
      ...product,
      model: selectedModel || product.model,
      selectedModel: selectedModel || product.model,
      image: selectedImage || product.image,
      selectedImage: selectedImage || product.image,
      selectedColor: selectedColor?.name || "Default",
    });
  };

  if (productLoading) {
    return (
      <div className="pageContainer">
        <h1>Loading product...</h1>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pageContainer">
        <h1>Product not found</h1>
        <Link to="/">Back to home</Link>
      </div>
    );
  }

  const mainImage = selectedImage || product.image;

  const stockStatus =
    Number(product.stock) <= 0
      ? "Out of Stock"
      : Number(product.stock) <= 5
      ? "Low Stock"
      : "In Stock";

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, item) => sum + Number(item.rating), 0) /
          reviews.length
        ).toFixed(1)
      : "No ratings";

  return (
    <div className="pageContainer">
      <Link to="/" className="backLink">
        ← Back to shop
      </Link>

      <div className="productDetailsBox">
        <div className="detailsImageBox">
          <img src={mainImage} alt={product.name} />
        </div>

        <div className="detailsInfoBox">
          <h1>{product.name}</h1>

          <p>
            {product.brand} • {selectedModel || product.model}
          </p>

          <h2>₹{product.price}</h2>

          <span
            className={`detailStockBadge ${stockStatus
              .replaceAll(" ", "")
              .toLowerCase()}`}
          >
            {stockStatus}
          </span>

          <p className="productRating">
            ⭐ {averageRating} ({reviews.length} reviews)
          </p>

          <p>{product.description || "Premium phone case by THE VELTRIXX."}</p>

          {product.availableModels?.length > 0 && (
            <div className="productOptionsBox">
              <h3>Select Model</h3>

              <div className="modelChips">
                {product.availableModels.map((model) => (
                  <button
                    key={model}
                    type="button"
                    className={
                      selectedModel === model
                        ? "modelChip activeModelChip"
                        : "modelChip"
                    }
                    onClick={() => setSelectedModel(model)}
                  >
                    {model}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.colorOptions?.length > 0 && (
            <div className="colorSelectorBox">
              <h3>Choose Color</h3>

              <div className="colorCircles">
                {product.colorOptions.map((color) => (
                  <button
                    key={color.name}
                    type="button"
                    title={color.name}
                    className={
                      selectedColor?.name === color.name
                        ? "colorCircle activeColorCircle"
                        : "colorCircle"
                    }
                    style={{
  backgroundColor:
    color.hex ||
    color.name ||
    "#000000"
}}
                    onClick={() => {
                      setSelectedColor(color);
                      setSelectedImage(color.image || product.image);
                    }}
                  />
                ))}
              </div>

              <p className="selectedColorText">
                Selected Color: {selectedColor?.name || "Default"}
              </p>
            </div>
          )}

          <button
            onClick={handleAddToCart}
            disabled={Number(product.stock) <= 0}
          >
            {Number(product.stock) <= 0 ? "Out of Stock" : "Add to Cart"}
          </button>
        </div>
      </div>

      <div className="reviewSection">
        <h2>Write a Review</h2>

        <select
          value={reviewForm.rating}
          onChange={(e) =>
            setReviewForm({ ...reviewForm, rating: e.target.value })
          }
        >
          <option value="5">⭐⭐⭐⭐⭐ 5 Stars</option>
          <option value="4">⭐⭐⭐⭐ 4 Stars</option>
          <option value="3">⭐⭐⭐ 3 Stars</option>
          <option value="2">⭐⭐ 2 Stars</option>
          <option value="1">⭐ 1 Star</option>
        </select>

        <textarea
          placeholder="Write your review..."
          value={reviewForm.comment}
          onChange={(e) =>
            setReviewForm({ ...reviewForm, comment: e.target.value })
          }
        />

        <button onClick={submitReview}>Submit Review</button>
      </div>

      <div className="reviewSection">
        <h2>Customer Reviews</h2>

        {reviews.length === 0 ? (
          <p>No reviews yet.</p>
        ) : (
          reviews.map((review) => (
            <div className="reviewCard" key={review._id}>
              <h3>{review.user?.name || review.name || "Customer"}</h3>
              <p>{"⭐".repeat(Number(review.rating))}</p>
              <p>{review.comment}</p>
              <small>{new Date(review.createdAt).toLocaleDateString()}</small>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ProductDetails;