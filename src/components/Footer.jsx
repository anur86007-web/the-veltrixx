import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="footer">
      <div className="footerContainer">
        <div className="footerSection">
          <h2>THE VELTRIXX</h2>
          <p>
            Premium customized phone cases designed for style, protection and
            personality. Discover unique designs crafted for every phone lover.
          </p>
        </div>

        <div className="footerSection">
          <h3>Quick Links</h3>
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
          <Link to="/refund-policy">Refund & Cancellation Policy</Link>
          <Link to="/shipping-policy">Shipping Policy</Link>
        </div>

        <div className="footerSection">
          <h3>Contact Us</h3>

          <p>
            📞 Mobile:
            <br />
            <a href="tel:+919899723391">+91 9899723391</a>
          </p>

          <p>
            💬 WhatsApp:
            <br />
            <a
              href="https://wa.me/919899723391"
              target="_blank"
              rel="noreferrer"
            >
              Chat on WhatsApp
            </a>
          </p>

          <p>
            📧 Email:
            <br />
            <a href="mailto:theveltrixx@gmail.com">
              theveltrixx@gmail.com
            </a>
          </p>
        </div>

        <div className="footerSection">
          <h3>Follow Us</h3>

          <a
            href="https://www.instagram.com/the.veltrixx/"
            target="_blank"
            rel="noreferrer"
          >
            📸 Instagram
          </a>

          <a
            href="https://wa.me/919899723391"
            target="_blank"
            rel="noreferrer"
          >
            💬 WhatsApp
          </a>

          <p style={{ marginTop: "15px" }}>
            🛍️ THE VELTRIXX
            <br />
            Premium Custom Phone Cases
          </p>
        </div>
      </div>

      <div className="footerBottom">
        © 2026 THE VELTRIXX. All Rights Reserved.
      </div>
    </footer>
  );
}

export default Footer;