import {
  Phone,
  Mail,
  Instagram,
  MessageCircle,
  MapPin,
  Clock,
  Send,
  Headphones,
} from "lucide-react";

function Contact() {
  return (
    <div className="premiumContactPage">
      <section className="contactHero">
        <span>GET IN TOUCH</span>
        <h1>Contact THE VELTRIXX</h1>
        <p>
          Need help with custom phone cases, orders, delivery or product
          details? We are here to help you.
        </p>
      </section>

      <section className="contactMainGrid">
        <div className="contactInfoPanel">
          <h2>Let’s Talk</h2>
          <p>
            Reach out to us anytime through WhatsApp, Email or Instagram. Our
            team will help you with product selection, custom orders and order
            support.
          </p>

          <div className="contactInfoList">
            <a href="tel:+919899723391" className="contactInfoItem">
              <Phone size={24} />
              <div>
                <h3>Phone</h3>
                <p>+91 9899723391</p>
              </div>
            </a>

            <a
              href="https://wa.me/919899723391"
              target="_blank"
              rel="noreferrer"
              className="contactInfoItem"
            >
              <MessageCircle size={24} />
              <div>
                <h3>WhatsApp</h3>
                <p>Chat with us instantly</p>
              </div>
            </a>

            <a
              href="mailto:theveltrixx@gmail.com"
              className="contactInfoItem"
            >
              <Mail size={24} />
              <div>
                <h3>Email</h3>
                <p>theveltrixx@gmail.com</p>
              </div>
            </a>

            <a
              href="https://www.instagram.com/the.veltrixx/"
              target="_blank"
              rel="noreferrer"
              className="contactInfoItem"
            >
              <Instagram size={24} />
              <div>
                <h3>Instagram</h3>
                <p>@the.veltrixx</p>
              </div>
            </a>
          </div>
        </div>

        <div className="contactFormPanel">
          <div className="contactFormHeader">
            <Headphones size={28} />
            <div>
              <h2>Send a Message</h2>
              <p>We usually reply within a few hours.</p>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();

              const form = e.currentTarget;
              const name = form.name.value;
              const phone = form.phone.value;
              const message = form.message.value;

              const whatsappText = `Hello THE VELTRIXX,%0A%0AName: ${name}%0APhone: ${phone}%0AMessage: ${message}`;

              window.open(
                `https://wa.me/919899723391?text=${whatsappText}`,
                "_blank"
              );
            }}
          >
            <input name="name" placeholder="Your Name" required />
            <input name="phone" placeholder="Your Phone Number" required />
            <input name="email" placeholder="Your Email (optional)" />
            <textarea
              name="message"
              placeholder="Tell us what you need..."
              required
            ></textarea>

            <button type="submit">
              <Send size={18} />
              Send on WhatsApp
            </button>
          </form>
        </div>
      </section>

      <section className="contactSupportStrip">
        <div>
          <Clock size={24} />
          <h3>Support Hours</h3>
          <p>10 AM - 8 PM</p>
        </div>

        <div>
          <MapPin size={24} />
          <h3>Delivery</h3>
          <p>Pan India Support</p>
        </div>

        <div>
          <MessageCircle size={24} />
          <h3>Fast Reply</h3>
          <p>WhatsApp Preferred</p>
        </div>
      </section>
    </div>
  );
}

export default Contact;