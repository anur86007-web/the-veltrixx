import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="footer">
      <div className="footerTopLine"></div>

      <div className="footerContainer">
        <div className="footerBrand">
          <h2>THE VELTRIXX</h2>
          <span>Premium Custom Phone Cases</span>
          <p>
            Luxury customized phone cases designed for style, protection and
            personality. Crafted for modern smartphone lovers.
          </p>
        </div>

        <div className="footerSection">
          <h3>Explore</h3>
          <Link to="/">Home</Link>
          <Link to="/cart">Cart</Link>
          <Link to="/wishlist">Wishlist</Link>
          <Link to="/orders">Orders</Link>
          <Link to="/profile">My Account</Link>
        </div>

        <div className="footerSection">
          <h3>Policies</h3>
          <Link to="/privacy-policy">Privacy Policy</Link>
          <Link to="/terms">Terms & Conditions</Link>
          <Link to="/refund-policy">Refund Policy</Link>
          <Link to="/shipping-policy">Shipping Policy</Link>
        </div>

        <div className="footerSection">
          <h3>Contact</h3>

          <a href="tel:+919899723391">+91 9899723391</a>

          <a
            href="https://wa.me/919899723391"
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp Support
          </a>

          <a href="mailto:theveltrixx@gmail.com">theveltrixx@gmail.com</a>
        </div>

        <div className="footerSection">
          <h3>Social</h3>

          <a
            href="https://www.instagram.com/the.veltrixx/"
            target="_blank"
            rel="noreferrer"
          >
            Instagram
          </a>

          <a
            href="https://wa.me/919899723391"
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp
          </a>

          <p className="footerTagline">
            Designed for premium style.
          </p>
        </div>
      </div>

      <div className="footerBottom">
        <p>© 2026 THE VELTRIXX. All Rights Reserved.</p>
        <span>Made with style for modern phone lovers.</span>
      </div>
    </footer>
  );
}

export default Footer;