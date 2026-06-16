import { useState } from "react";
import { Link } from "react-router-dom";

function Navbar({ user, cart = [], wishlist = [], logout }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navLogo">
        <Link to="/" onClick={closeMenu} className="logoLink">
  <img
    src="/images/logo.PNG"
    alt="THE VELTRIXX"
    className="navLogoImg"
  />
</Link>
      </div>

      <button
        className="menuBtn"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        {menuOpen ? "✕" : "☰"}
      </button>

      <div className={menuOpen ? "navLinks navLinksOpen" : "navLinks"}>
        <Link to="/" onClick={closeMenu}>
          Home
        </Link>

        <Link to="/about" onClick={closeMenu}>
          About Us
        </Link>

        <Link to="/contact" onClick={closeMenu}>
          Contact Us
        </Link>

        <Link to="/orders" onClick={closeMenu}>
          Orders
        </Link>

        <Link to="/wishlist" onClick={closeMenu}>
          Wishlist ({wishlist.length})
        </Link>

        <Link to="/cart" onClick={closeMenu}>
          Cart ({cart.length})
        </Link>

        <Link to="/profile" onClick={closeMenu}>
          Profile
        </Link>

        {user ? (
          <>
            <span className="userName">Hi, {user.name}</span>

            <button
              className="logoutBtn"
              onClick={() => {
                closeMenu();
                logout();
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <Link to="/login" onClick={closeMenu}>
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;