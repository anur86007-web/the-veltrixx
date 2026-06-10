import { Routes, Route, useNavigate } from "react-router-dom";
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

const API = "http://localhost:5000/api";

function App() {
  const navigate = useNavigate();

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
        setProducts(data.products);
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

  const getId = (product) => product._id || product.id;

const getCartKey = (product) => {
  return `${getId(product)}-${product.selectedModel || product.model || "Default"}-${product.selectedColor || "Default"}`;
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
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("veltrixx_user");
    localStorage.removeItem("veltrixx_token");
    showToast("Logged out");
    navigate("/");
  };

  return (
  <>
    {toast && <div className="toast">{toast}</div>}

    <Navbar
      user={user}
      cart={cart}
      wishlist={wishlist}
      logout={logout}
    />

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
            <Wishlist
              wishlist={wishlist}
              toggleWishlist={toggleWishlist}
            />
          }
        />

        <Route
          path="/payment"
          element={
            <Payment
              cart={cart}
              placeOrder={placeOrder}
            />
          }
        />

        <Route
          path="/orders"
          element={<Orders orders={orders} />}
        />

        <Route
          path="/login"
          element={<Login setUser={setUser} />}
        />

        <Route
          path="/admin"
          element={<Admin refreshProducts={fetchProducts} />}
        />
        <Route path="/profile" element={<Profile user={user} />} />
      </Routes>
    </>
  );
}

export default App;