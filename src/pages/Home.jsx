import { useEffect, useState } from "react";
import { Search, ShoppingBag, Heart, User, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";

function Home({ user, logout, products, cart, wishlist, addToCart, toggleWishlist }) {
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [search, setSearch] = useState("");
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const decreaseHandler = (e) => {
      const cartData = JSON.parse(localStorage.getItem("veltrixx_cart")) || [];
      const updated = cartData
        .map((item) => (item._id || item.id) === e.detail ? { ...item, qty: item.qty - 1 } : item)
        .filter((item) => item.qty > 0);

      localStorage.setItem("veltrixx_cart", JSON.stringify(updated));
      window.location.reload();
    };

    window.addEventListener("decrease-cart", decreaseHandler);
    return () => window.removeEventListener("decrease-cart", decreaseHandler);
  }, []);

  const brands = ["All", "iPhone", "Samsung", "OnePlus", "Vivo", "Oppo", "Realme", "Redmi"];

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

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <>
      <nav className="navbar">
        <Link to="/" className="logo">THE VELTRIXX</Link>

        <div className="searchArea">
          <div className="searchBox">
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

        <div className="navIcons">
          <Link to="/wishlist" className="iconBox">
            <Heart />
            <span>{wishlist.length}</span>
          </Link>

          <Link to="/cart" className="iconBox">
            <ShoppingBag />
            <span>{cartCount}</span>
          </Link>

          {user ? (
            <button className="logoutBtn" onClick={logout}>
              <LogOut size={20} />
            </button>
          ) : (
            <Link to="/login">
              <User />
            </Link>
          )}
        </div>
      </nav>

      <section className="heroBanner">
  <div className="heroOverlay"></div>

  <div className="heroContent">
    <h1>Premium Custom Phone Cases</h1>

    <p>Protect Your Phone In Style with Premium Quality Cases</p>

    <div className="heroFeatures">
      <span>✔ High Quality Prints</span>
      <span>✔ Fast Delivery</span>
      <span>✔ Premium Protection</span>
    </div>

    <a href="#products" className="shopNowBtn">
      Shop Now
    </a>
  </div>
</section>

      <section className="hero">
        <p>Premium Phone Cases</p>
        <h1>Minimal protection for modern phones.</h1>
        <button onClick={() => window.scrollTo({ top: 650, behavior: "smooth" })}>
          Shop Collection
        </button>
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

      <section className="shopSection">
        <div className="sectionHead">
          <p>THE COLLECTION</p>
          <h2>{selectedBrand === "All" ? "All Phone Cases" : `${selectedBrand} Cases`}</h2>
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