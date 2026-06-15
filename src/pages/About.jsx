import { Link } from "react-router-dom";
import {
  Sparkles,
  ShieldCheck,
  Truck,
  MessageCircle,
  Star,
  Heart,
  Palette,
} from "lucide-react";

function About() {
  return (
    <div className="premiumAboutPage">
      <section className="aboutHero">
        <div className="aboutHeroText">
          <span>THE VELTRIXX STORY</span>

          <h1>Designed to Protect. Made to Stand Out.</h1>

          <p>
            THE VELTRIXX is a premium phone case brand creating stylish,
            durable and customized cases for modern smartphone users.
          </p>

          <div className="aboutHeroBtns">
            <Link to="/" className="aboutPrimaryBtn">
              Shop Collection
            </Link>

            <Link to="/contact" className="aboutSecondaryBtn">
              Custom Order
            </Link>
          </div>
        </div>

        <div className="aboutHeroCard">
          <div className="aboutFloatingCard cardOne">
            <Sparkles size={24} />
            <b>Premium Finish</b>
          </div>

          <div className="aboutPhoneMockup">
            <div className="aboutPhoneCamera"></div>
            <h3>THE VELTRIXX</h3>
            <p>Custom Case</p>
          </div>

          <div className="aboutFloatingCard cardTwo">
            <ShieldCheck size={24} />
            <b>Strong Protection</b>
          </div>
        </div>
      </section>

      <section className="aboutStats">
        <div>
          <h2>500+</h2>
          <p>Happy Customers</p>
        </div>

        <div>
          <h2>50+</h2>
          <p>Premium Designs</p>
        </div>

        <div>
          <h2>Pan India</h2>
          <p>Delivery Support</p>
        </div>

        <div>
          <h2>24/7</h2>
          <p>WhatsApp Help</p>
        </div>
      </section>

      <section className="aboutStory">
        <div>
          <span>WHO WE ARE</span>
          <h2>More than a phone case brand.</h2>
        </div>

        <p>
          We believe a phone case should do more than protect your device. It
          should match your style, personality and daily lifestyle. From minimal
          designs to custom prints, THE VELTRIXX focuses on quality, comfort and
          a premium user experience.
        </p>
      </section>

      <section className="aboutPremiumGrid">
        <div className="aboutPremiumCard">
          <Palette size={30} />
          <h3>Unique Designs</h3>
          <p>
            Trendy, modern and premium designs that make your phone stand out.
          </p>
        </div>

        <div className="aboutPremiumCard">
          <ShieldCheck size={30} />
          <h3>Strong Protection</h3>
          <p>
            Quality material and safe edges to protect your phone from daily
            scratches and drops.
          </p>
        </div>

        <div className="aboutPremiumCard">
          <Truck size={30} />
          <h3>Fast Delivery</h3>
          <p>
            Secure packaging and quick delivery support for a smooth shopping
            experience.
          </p>
        </div>

        <div className="aboutPremiumCard">
          <MessageCircle size={30} />
          <h3>Customer Support</h3>
          <p>
            Friendly support through WhatsApp, Instagram and Email whenever you
            need help.
          </p>
        </div>
      </section>

      <section className="aboutValues">
        <div className="aboutValueLeft">
          <span>WHY CHOOSE US</span>
          <h2>Premium quality with a personal touch.</h2>
          <p>
            Every case is selected with attention to design, comfort and
            long-lasting protection. Our goal is to give every customer a case
            that feels premium and looks unique.
          </p>
        </div>

        <div className="aboutValueList">
          <div>
            <Star size={22} />
            <p>Premium look and feel</p>
          </div>

          <div>
            <Heart size={22} />
            <p>Customer-first support</p>
          </div>

          <div>
            <Sparkles size={22} />
            <p>Custom design options</p>
          </div>
        </div>
      </section>

      <section className="aboutCTA">
        <h2>Ready to give your phone a premium look?</h2>
        <p>Explore our latest phone case collection and custom designs.</p>

        <Link to="/" className="aboutPrimaryBtn">
          Explore Cases
        </Link>
      </section>
    </div>
  );
}

export default About;