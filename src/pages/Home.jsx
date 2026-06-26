import { useEffect, useState } from "react";
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  LogOut,
  ArrowRight,
  Truck,
  ShieldCheck,
  Palette,
  MessageCircle,
  Star,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";

function Home({ user, logout, products, cart, wishlist, addToCart, toggleWishlist }) {
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [search, setSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const decreaseHandler = (e) => {
      const cartData = JSON.parse(localStorage.getItem("veltrixx_cart")) || [];
      const updated = cartData
        .map((item) =>
          (item._id || item.id) === e.detail ? { ...item, qty: item.qty - 1 } : item
        )
        .filter((item) => item.qty > 0);

      localStorage.setItem("veltrixx_cart", JSON.stringify(updated));
      window.location.reload();
    };

    window.addEventListener("decrease-cart", decreaseHandler);
    return () => window.removeEventListener("decrease-cart", decreaseHandler);
  }, []);

  const brands = ["All", "iPhone", "Samsung", "OnePlus", "Vivo", "Oppo", "Realme", "Redmi"];

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

    return brandMatch && searchMatch && item.status !== "draft";
  });

  const searchSuggestions =
    search.trim().length > 0
      ? products
          .filter((item) => {
            const text = search.toLowerCase().trim();

            return (
              item.status !== "draft" &&
              (item.name?.toLowerCase().includes(text) ||
                item.brand?.toLowerCase().includes(text) ||
                item.model?.toLowerCase().includes(text) ||
                item.availableModels?.join(" ").toLowerCase().includes(text))
            );
          })
          .slice(0, 6)
      : [];

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
            <div className="homeSearchBox">
              <Search size={18} />
              <input
                placeholder="Search iPhone, Samsung, Carbon..."
                value={search}
                onFocus={() => setShowSuggestions(true)}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setShowSuggestions(true);
                }}
              />

              {search && (
                <button
                  type="button"
                  className="clearSearchBtn"
                  onClick={() => {
                    setSearch("");
                    setShowSuggestions(false);
                  }}
                >
                  ×
                </button>
              )}
            </div>

            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="searchSuggestionBox">
                {searchSuggestions.map((item) => (
                  <Link
                    to={`/product/${item._id || item.id}`}
                    className="searchSuggestionItem"
                    key={item._id || item.id}
                    onClick={() => {
                      setSearch("");
                      setShowSuggestions(false);
                    }}
                  >
                    <img src={item.image} alt={item.name} />

                    <div>
                      <h4>{item.name}</h4>
                      <p>
                        {item.brand} • {item.model}
                      </p>
                      <strong>₹{item.price}</strong>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {showSuggestions && search.trim() && searchSuggestions.length === 0 && (
              <div className="searchSuggestionBox">
                <div className="noSearchResult">
                  <p>No matching products found</p>
                  <span>Try iPhone, Samsung, OnePlus, Matte, Carbon</span>
                </div>
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

      <section className="veltrixxHero">
        <div className="heroLeft">
          <span className="heroMiniText">NEW PREMIUM COLLECTION</span>

          <h1>
            Custom Phone Cases <br />
            <span>Made For Your Style.</span>
          </h1>

          <p>
            Premium, stylish and protective phone cases crafted for modern
            smartphone lovers.
          </p>

          <div className="heroActionRow">
            <a href="#products" className="goldHeroBtn">
              Shop Now <ArrowRight size={18} />
            </a>

            <Link to="/customize-case" className="outlineHeroBtn">
              Customize Case
            </Link>
          </div>

          <div className="heroFeatureRow">
            <div>
              <Users size={28} />
              <b>500+</b>
              <span>Happy Customers</span>
            </div>

            <div>
              <Star size={28} />
              <b>4.8★</b>
              <span>Customer Rating</span>
            </div>

            <div>
              <Truck size={30} />
              <b>Pan India</b>
              <span>Delivery</span>
            </div>
          </div>
        </div>

        <div className="heroRight">
          <div className="heroProductFrame">
            <div className="heroPhoneCard cardA"></div>
            <div className="heroPhoneCard cardB"></div>
            <div className="heroPhoneCard cardC"></div>
          </div>
        </div>
      </section>

      <section className="premiumHighlights">
        <div>
          <Truck size={28} />
          <b>Fast Delivery</b>
          <span>Quick & Reliable</span>
        </div>

        <div>
          <Palette size={28} />
          <b>Custom Designs</b>
          <span>Unique & Trendy</span>
        </div>

        <div>
          <ShieldCheck size={28} />
          <b>Premium Protection</b>
          <span>Durable & Secure</span>
        </div>

        <div>
          <MessageCircle size={28} />
          <b>WhatsApp Support</b>
          <span>We're Here to Help</span>
        </div>
      </section>

      <section className="brandFilterSection">
        <div className="brandFilterHeader">
          <span>SHOP BY BRAND</span>
          <h2>Find your perfect case</h2>
        </div>

        <div className="brands">
          {brands.map((brand) => (
            <button
              key={brand}
              className={selectedBrand === brand ? "activeBrand" : ""}
              onClick={() => setSelectedBrand(brand)}
            >
              {brand}
            </button>
          ))}
        </div>
      </section>

      <section className="shopSection" id="products">
        <div className="sectionHead">
          <p>THE COLLECTION</p>
          <h2>
            {selectedBrand === "All"
              ? "Premium Phone Cases"
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
