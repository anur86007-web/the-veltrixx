import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ShoppingBag, Star, ShieldCheck, Truck, RotateCcw } from "lucide-react";

const REVIEW_API = "https://the-veltrixx-backend.onrender.com/api/reviews";
const PRODUCT_API = "https://the-veltrixx-backend.onrender.com/api/products";

function ProductDetails({ products = [], addToCart }) {
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

  const [reviewImages, setReviewImages] = useState([]);
  const [zoomStyle, setZoomStyle] = useState({
    transform: "scale(1)",
    transformOrigin: "center",
  });

  const handleZoomMove = (e) => {
    const { left, top, width, height } =
      e.currentTarget.getBoundingClientRect();

    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: "scale(2)",
    });
  };

  const handleZoomLeave = () => {
    setZoomStyle({
      transform: "scale(1)",
      transformOrigin: "center",
    });
  };

  const normalize = (value) => String(value || "").trim().toLowerCase();

  const getSavedOrderItem = () => {
    try {
      return JSON.parse(localStorage.getItem("veltrixx_order_product_item")) || null;
    } catch {
      return null;
    }
  };

  const findMatchingProduct = (allProducts = []) => {
    const savedItem = getSavedOrderItem();

    if (!savedItem || allProducts.length === 0) return null;

    return (
      allProducts.find((item) => {
        const nameMatch = normalize(item.name) === normalize(savedItem.name);

        const brandMatch =
          !savedItem.brand || normalize(item.brand) === normalize(savedItem.brand);

        const savedModel =
          savedItem.selectedModel || savedItem.model || savedItem.availableModel || "";

        const modelMatch =
          !savedModel ||
          normalize(item.model) === normalize(savedModel) ||
          item.availableModels?.map((model) => normalize(model)).includes(normalize(savedModel));

        return nameMatch && brandMatch && modelMatch;
      }) ||
      allProducts.find((item) => normalize(item.name) === normalize(savedItem.name)) ||
      null
    );
  };

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

      if (data.success && data.product) {
        setProduct(data.product);
        return;
      }

      const allRes = await fetch(PRODUCT_API);
      const allData = await allRes.json();

      if (allData.success) {
        const matchedProduct = findMatchingProduct(allData.products || []);

        if (matchedProduct) {
          setProduct(matchedProduct);
          return;
        }
      }

      const matchedFromProps = findMatchingProduct(products);

      if (matchedFromProps) {
        setProduct(matchedFromProps);
        return;
      }

      setProduct(null);
    } catch (error) {
      console.log("Product load error:", error);

      const matchedFromProps = findMatchingProduct(products);
      setProduct(matchedFromProps || null);
    } finally {
      setProductLoading(false);
    }
  };

  const getCurrentProductId = () => product?._id || product?.id || id;

  const fetchReviews = async (productId = getCurrentProductId()) => {
    if (!productId) return;

    try {
      const res = await fetch(`${REVIEW_API}/product/${productId}`);
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
  }, [id, products]);

  useEffect(() => {
    if (product) {
      const firstColor = product.colorOptions?.[0] || null;
      const firstGalleryImage =
        product.images?.[0] || firstColor?.image || product.image || "";

      setSelectedColor(firstColor);
      setSelectedImage(firstGalleryImage);
      setSelectedModel(product.availableModels?.[0] || product.model || "");
      fetchReviews(product._id || product.id || id);
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
      const formData = new FormData();

      formData.append("product", getCurrentProductId());
      formData.append("rating", reviewForm.rating);
      formData.append("comment", reviewForm.comment);

      reviewImages.forEach((image) => {
        formData.append("images", image);
      });

      const res = await fetch(REVIEW_API, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
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

      setReviewImages([]);
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
      <div className="productDetailsPage">
        <div className="detailsLoadingBox">
          <h1>Loading product...</h1>
        </div>
      </div>
    );
  }

  if (!product) {
    const savedOrderProduct = JSON.parse(
      localStorage.getItem("veltrixx_order_product") || "null"
    );

    if (savedOrderProduct) {
      return (
        <div className="productDetailsPage">
          <div className="productDetailsInner">
            <Link to="/orders" className="backLink">
              ← Back to orders
            </Link>

            <div className="premiumDetailsGrid">
              <div className="detailsGallery">
                <div
                  className="mainDetailsImage amazonMainImage zoomContainer"
                  onMouseMove={handleZoomMove}
                  onMouseLeave={handleZoomLeave}
                >
                  <img
                    src={savedOrderProduct.selectedImage || savedOrderProduct.image}
                    alt={savedOrderProduct.name}
                    className="zoomImage"
                    style={zoomStyle}
                  />
                </div>
              </div>

              <div className="premiumDetailsInfo">
                <span className="detailsBrandTag">
                  {savedOrderProduct.brand} •{" "}
                  {savedOrderProduct.selectedModel || savedOrderProduct.model}
                </span>

                <h1>{savedOrderProduct.name}</h1>

                <h2>₹{savedOrderProduct.price}</h2>

                <p className="detailsDesc">
                  This product was part of your order. It may have been removed or updated from the live store.
                </p>

                <Link to="/">
                  <button className="detailsAddCartBtn">Continue Shopping</button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="productDetailsPage">
        <div className="detailsLoadingBox">
          <h1>Product not found</h1>
          <p>This product may have been removed or changed.</p>
          <Link to="/">Back to home</Link>
        </div>
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

  const galleryImages = [
    product.image,
    ...(product.images || []),
    ...(product.colorOptions?.map((color) => color.image).filter(Boolean) || []),
  ]
    .filter(Boolean)
    .filter((img, index, arr) => arr.indexOf(img) === index);

  return (
    <div className="productDetailsPage">
      <div className="productDetailsInner">
        <Link to="/" className="backLink">
          ← Back to shop
        </Link>

        <div className="premiumDetailsGrid">
          <div className="detailsGallery">
            <div
              className="mainDetailsImage amazonMainImage zoomContainer"
              onMouseMove={handleZoomMove}
              onMouseLeave={handleZoomLeave}
            >
              <img
                src={mainImage}
                alt={product.name}
                className="zoomImage"
                style={zoomStyle}
              />
            </div>

            {galleryImages.length > 1 && (
              <div className="bottomThumbs">
                {galleryImages.map((img, index) => (
                  <button
                    key={index}
                    type="button"
                    className={selectedImage === img ? "activeBottomThumb" : ""}
                    onClick={() => setSelectedImage(img)}
                  >
                    <img src={img} alt={`${product.name} ${index + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="premiumDetailsInfo">
            <span className="detailsBrandTag">
              {product.brand} • {selectedModel || product.model}
            </span>

            <h1>{product.name}</h1>

            <div className="detailsRatingRow">
              <span>
                <Star size={16} fill="black" /> {averageRating}
              </span>
              <p>({reviews.length} reviews)</p>
            </div>

            <h2>₹{product.price}</h2>

            <span
              className={`detailStockBadge ${stockStatus
                .replaceAll(" ", "")
                .toLowerCase()}`}
            >
              {stockStatus}
            </span>

            <p className="detailsDesc">
              {product.description || "Premium phone case by THE VELTRIXX."}
            </p>

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
                        "--circle-color": color.hex || color.name || "#000000",
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
              className="detailsAddCartBtn"
              onClick={handleAddToCart}
              disabled={Number(product.stock) <= 0}
            >
              <ShoppingBag size={19} />
              {Number(product.stock) <= 0 ? "Out of Stock" : "Add to Cart"}
            </button>

            <div className="detailsTrustBox">
              <div>
                <ShieldCheck size={22} />
                <span>Premium Protection</span>
              </div>

              <div>
                <Truck size={22} />
                <span>Fast Delivery</span>
              </div>

              <div>
                <RotateCcw size={22} />
                <span>Easy Support</span>
              </div>
            </div>
          </div>
        </div>

        <div className="premiumReviewGrid">
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

            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setReviewImages([...e.target.files])}
            />

            {reviewImages.length > 0 && (
              <p className="selectedReviewImagesText">
                {reviewImages.length} image selected
              </p>
            )}

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

                  {review.verifiedPurchase && (
                    <span className="verifiedBadge">✔ Verified Purchase</span>
                  )}

                  <p>{"⭐".repeat(Number(review.rating))}</p>
                  <p>{review.comment}</p>

                  {review.images?.length > 0 && (
                    <div className="reviewImages">
                      {review.images.map((img, index) => (
                        <img
                          key={index}
                          src={img}
                          alt="Customer Review"
                          className="reviewImage"
                        />
                      ))}
                    </div>
                  )}

                  <small>
                    {new Date(review.createdAt).toLocaleDateString()}
                  </small>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;