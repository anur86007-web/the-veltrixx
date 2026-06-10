import { Link } from "react-router-dom";

function Navbar({ user, cart = [], wishlist = [], logout }) {
  return (
    <nav className="navbar">
      <div className="navLogo">
        <Link to="/">THE VELTRIXX</Link>
      </div>

      <div className="navLinks">
        <Link to="/">Home</Link>

        <Link to="/orders">Orders</Link>

        <Link to="/wishlist">
          Wishlist ({wishlist.length})
        </Link>

        <Link to="/cart">
          Cart ({cart.length})
        </Link>

        <Link to="/profile">Profile</Link>

        {user ? (
          <>
            <span className="userName">
              Hi, {user.name}
            </span>

            <button
              className="logoutBtn"
              onClick={logout}
            >
              Logout
            </button>
          </>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;