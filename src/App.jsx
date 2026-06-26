import { Routes, Route, useNavigate, Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import ProductDetails from "./pages/ProductDetails";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import Orders from "./pages/Orders";
import Payment from "./pages/Payment";
import Profile from "./pages/Profile";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import About from "./pages/About";
import Contact from "./pages/Contact";

import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import RefundPolicy from "./pages/RefundPolicy";
import ShippingPolicy from "./pages/ShippingPolicy";
import OrderSuccess from "./pages/OrderSuccess";
import CustomizeCase from "./pages/CustomizeCase";
const API = "https://the-veltrixx-backend.onrender.com/api";

function AdminProtectedRoute({ user, children }) {
  if (!user) {
    return (
      <div className="pageContainer">
        <h1>Admin Login Required</h1>
        <p>Please login with an admin account to open dashboard.</p>
        <Link to="/login">
          <button>Go to Login</button>
        </Link>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="pageContainer">
        <h1>Access Denied</h1>
        <p>You are not allowed to access the admin dashboard.</p>
        <Link to="/">
          <button>Back to Home</button>
        </Link>
      </div>
    );
  }

  return children;
}

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const isAdminPage = location.pathname === "/admin";

  const [user, setUser] = useState(
    () => JSON.parse(localStorage.getItem("veltrixx_user")) || null
  );

  const [products, setProducts] = useState([]);

  const [cart, setCart] = useState(
    () => JSON.parse(localStorage.getItem("veltrixx_cart")) || []
  );

  const [wishlist, setWishlist] = useState(
    () => JSON.parse(localStorage.getItem("veltrixx_wishlist")) || []
  );

  const [orders, setOrders] = useState(
    () => JSON.parse(localStorage.getItem("veltrixx_orders")) || []
  );

  const [toast, setToast] = useState("");

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API}/products`);
      const data = await res.json();

      if (data.success) {
        setProducts(data.products || []);
      }
    } catch (error) {
      console.log("Product fetch error:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    localStorage.setItem("veltrixx_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("veltrixx_wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem("veltrixx_orders", JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    if (user) {
      localStorage.setItem("veltrixx_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("veltrixx_user");
    }
  }, [user]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 1800);
  };

  const requireLogin = () => {
    if (!user) {
      showToast("Please login first");
      navigate("/login");
      return false;
    }

    return true;
  };

  const getId = (product) => product._id || product.id || product.productId || product.name;

  const getCartKey = (product) => {
    return `${getId(product)}-${
      product.selectedModel || product.model || "Default"
    }-${product.selectedColor || "Default"}`;
  };

  const addToCart = (product) => {
    if (!requireLogin()) return;

    const key = getCartKey(product);

    if (product.qtyAction === "minus") {
      setCart(
        cart
          .map((item) =>
            getCartKey(item) === key ? { ...item, qty: item.qty - 1 } : item
          )
          .filter((item) => item.qty > 0)
      );
      return;
    }

    const existingItem = cart.find((item) => getCartKey(item) === key);

    if (existingItem) {
      setCart(
        cart.map((item) =>
          getCartKey(item) === key ? { ...item, qty: item.qty + 1 } : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          ...product,
          cartKey: key,
          qty: 1,
        },
      ]);
    }

    showToast("Added to cart");
  };

  const reorderItems = (items = []) => {
    if (!requireLogin()) return;

    const preparedItems = items.map((item) => {
      const selectedModel = item.selectedModel || item.model || "Default";
      const selectedColor = item.selectedColor || "Default";
      const image = item.selectedImage || item.image;

      const productForCart = {
        ...item,
        _id: item.productId || item._id || item.id || item.name,
        id: item.productId || item._id || item.id || item.name,
        image,
        selectedImage: image,
        selectedModel,
        selectedColor,
      };

      return {
        ...productForCart,
        cartKey: getCartKey(productForCart),
        qty: Number(item.qty) || 1,
      };
    });

    setCart((prevCart) => {
      let updatedCart = [...prevCart];

      preparedItems.forEach((newItem) => {
        const existingItem = updatedCart.find(
          (cartItem) => cartItem.cartKey === newItem.cartKey
        );

        if (existingItem) {
          updatedCart = updatedCart.map((cartItem) =>
            cartItem.cartKey === newItem.cartKey
              ? { ...cartItem, qty: cartItem.qty + newItem.qty }
              : cartItem
          );
        } else {
          updatedCart.push(newItem);
        }
      });

      return updatedCart;
    });

    showToast("Order items added to cart");
    navigate("/cart");
  };

  const increaseQty = (cartKey) => {
    setCart(
      cart.map((item) =>
        item.cartKey === cartKey ? { ...item, qty: item.qty + 1 } : item
      )
    );
  };

  const decreaseQty = (cartKey) => {
    setCart(
      cart
        .map((item) =>
          item.cartKey === cartKey ? { ...item, qty: item.qty - 1 } : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  const removeFromCart = (cartKey) => {
    setCart(cart.filter((item) => item.cartKey !== cartKey));
  };

  const toggleWishlist = (product) => {
    if (!requireLogin()) return;

    const id = getId(product);
    const exists = wishlist.find((item) => getId(item) === id);

    if (exists) {
      setWishlist(wishlist.filter((item) => getId(item) !== id));
      showToast("Removed from wishlist");
    } else {
      setWishlist([...wishlist, product]);
      showToast("Added to wishlist");
    }
  };

  const placeOrder = (order) => {
    setOrders([...orders, order]);
    setCart([]);
    localStorage.removeItem("veltrixx_coupon");
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("veltrixx_user");
    localStorage.removeItem("veltrixx_token");
    showToast("Logged out");
    navigate("/");
  };

  const hideFloatingCartRoutes = ["/cart", "/payment", "/admin"];
  const showFloatingCart =
    cart.length > 0 && !hideFloatingCartRoutes.includes(location.pathname);

  return (
    <>
      {toast && <div className="toast">{toast}</div>}

      {!isAdminPage && (
        <Navbar user={user} cart={cart} wishlist={wishlist} logout={logout} />
      )}

      <Routes>
        <Route
          path="/"
          element={
            <Home
              user={user}
              logout={logout}
              products={products}
              cart={cart}
              wishlist={wishlist}
              addToCart={addToCart}
              toggleWishlist={toggleWishlist}
            />
          }
        />

        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/customize-case" element={<CustomizeCase addToCart={addToCart} />} />

        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
        <Route path="/shipping-policy" element={<ShippingPolicy />} />
        <Route
  path="/order-success/:orderId"
  element={<OrderSuccess />}
/>

        <Route
          path="/product/:id"
          element={
            <ProductDetails
              products={products}
              wishlist={wishlist}
              addToCart={addToCart}
              toggleWishlist={toggleWishlist}
            />
          }
        />

        <Route
          path="/cart"
          element={
            <Cart
              cart={cart}
              increaseQty={increaseQty}
              decreaseQty={decreaseQty}
              removeFromCart={removeFromCart}
            />
          }
        />

        <Route
          path="/wishlist"
          element={
            <Wishlist wishlist={wishlist} toggleWishlist={toggleWishlist} />
          }
        />

        <Route
          path="/payment"
          element={<Payment cart={cart} placeOrder={placeOrder} />}
        />

        <Route
          path="/orders"
          element={<Orders orders={orders} reorderItems={reorderItems} />}
        />

        <Route path="/login" element={<Login setUser={setUser} />} />

        <Route
          path="/admin"
          element={
            <AdminProtectedRoute user={user}>
              <Admin refreshProducts={fetchProducts} />
            </AdminProtectedRoute>
          }
        />

        <Route path="/profile" element={<Profile user={user} />} />
      </Routes>

      {!isAdminPage && <Footer />}

      {!isAdminPage && (
        <a
          href="https://wa.me/919899723391?text=Hi%20THE%20VELTRIXX,%20I%20need%20help%20with%20my%20order."
          target="_blank"
          rel="noopener noreferrer"
          className="whatsappSupport"
        >
          💬 Need Help?
        </a>
      )}

      {showFloatingCart && (
        <Link to="/cart" className="floatingCartBtn">
          Go To Cart ({cart.length})
        </Link>
      )}
    </>
  );
}

export default App;