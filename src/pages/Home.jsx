import { useEffect, useState } from "react";
import { Search, ShoppingBag, Heart, User, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";

function Home({
  user,
  logout,
  products,
  cart,
  wishlist,
  addToCart,
  toggleWishlist,
}) {
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [search, setSearch] = useState("");
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const decreaseHandler = (e) => {
      const cartData = JSON.parse(localStorage.getItem("veltrixx_cart")) || [];

      const updated = cartData
        .map((item) =>
          (item._id || item.id) === e.detail
            ? { ...item, qty: item.qty - 1 }
            : item
        )
        .filter((item) => item.qty > 0);

      localStorage.setItem("veltrixx_cart", JSON.stringify(updated));
      window.location.reload();
    };

    window.addEventListener("decrease-cart", decreaseHandler);
    return () => window.removeEventListener("decrease-cart", decreaseHandler);
  }, []);

  const brands = [
    "All",
    "iPhone",
    "Samsung",
    "OnePlus",
    "Vivo",
    "Oppo",
    "Realme",
    "Redmi",
  ];

  const handleSearch = (value) => {
    setSearch(value);

    const cleanValue = value.trim();

    if (cleanValue.length > 1 && !history.includes(cleanValue)) {
      setHistory([cleanValue, ...history].slice(0, 5));
    }
  };

  const filteredProducts = products.filter((item) => {
    const searchText = search.toLowerCase().trim();

    const brandMatch =
      selectedBrand === "All" ||
      item.brand?.toLowerCase() === selectedBrand.toLowerCase();

    const searchMatch =
      searchText === "" ||
      item.name?.toLowerCase().includes(searchText) ||
      item.brand?.toLowerCase().includes(searchText) ||
      item.model?.toLowerCase().includes(searchText) ||
      item.availableModels?.join(" ").toLowerCase().includes(searchText);

    return brandMatch && searchMatch;
  });

  const cartCount = cart.reduce((sum, item) => sum + Number(item.qty || 1), 0);

  return (
    <>
      <nav className="homePremiumNav">
        <div className="homeNavTop">
          <Link to="/" className="brandArea">
            <h1>THE VELTRIXX</h1>
            <p>Premium Custom Phone Cases</p>
          </Link>

          <div className="homeSearchArea">
            <span className="topTag">Premium • Custom • Protection</span>

            <div className="homeSearchBox">
              <Search size={18} />

              <input
                placeholder="Search iPhone, Samsung, Carbon..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            {history.length > 0 && search.length > 0 && (
              <div className="searchHistory">
                {history.map((item, index) => (
                  <button key={index} onClick={() => setSearch(item)}>
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="homeNavActions">
            <Link to="/wishlist" className="homeIconBtn">
              <Heart size={22} />
              <span>{wishlist.length}</span>
            </Link>

            <Link to="/cart" className="homeIconBtn">
              <ShoppingBag size={22} />
              <span>{cartCount}</span>
            </Link>

            {user ? (
              <button className="homeLogoutBtn" onClick={logout}>
                <LogOut size={22} />
              </button>
            ) : (
              <Link to="/login" className="homeIconBtn">
                <User size={22} />
              </Link>
            )}
          </div>
        </div>
      </nav>

      <section className="premiumHero">
        <div className="premiumHeroText">
          <span className="heroTag">THE VELTRIXX COLLECTION</span>

          <h1>Premium Phone Cases For Every Style</h1>

          <p>
            Protect. Personalize. Stand Out. Discover stylish and durable phone
            cases crafted for your everyday lifestyle.
          </p>

          <div className="heroButtons">
            <a href="#products" className="primaryHeroBtn">
              Shop Collection
            </a>

            <Link to="/contact" className="secondaryHeroBtn">
              Custom Order
            </Link>
          </div>

          <div className="heroStats">
            <div>
              <b>500+</b>
              <span>Happy Customers</span>
            </div>

            <div>
              <b>Pan India</b>
              <span>Delivery</span>
            </div>

            <div>
              <b>Premium</b>
              <span>Protection</span>
            </div>
          </div>
        </div>

        <div className="premiumHeroVisual">
          <div className="phoneShowcase">
            <div className="phoneSlide phoneSlide1"></div>
            <div className="phoneSlide phoneSlide2"></div>
            <div className="phoneSlide phoneSlide3"></div>
            <div className="phoneSlide phoneSlide4"></div>
          </div>
        </div>
      </section>

      <section className="brands">
        {brands.map((brand) => (
          <button
            key={brand}
            className={selectedBrand === brand ? "activeBrand" : ""}
            onClick={() => setSelectedBrand(brand)}
          >
            {brand}
          </button>
        ))}
      </section>

      <section className="shopSection" id="products">
        <div className="sectionHead">
          <p>THE COLLECTION</p>

          <h2>
            {selectedBrand === "All"
              ? "All Phone Cases"
              : `${selectedBrand} Cases`}
          </h2>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="emptyState">
            <h3>No products found</h3>
            <p>Try searching iPhone, Samsung, Carbon, Matte, OnePlus.</p>
          </div>
        ) : (
          <div className="productGrid">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product._id || product.id}
                product={product}
                cart={cart}
                wishlist={wishlist}
                addToCart={addToCart}
                toggleWishlist={toggleWishlist}
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

export default Home;