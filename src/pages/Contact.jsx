function Contact() {
  return (
    <div className="pageContainer">
      <div className="contactPage">

        <h1>Contact Us</h1>

        <div className="contactCard">
          <h3>📞 Phone</h3>
          <p>+91 9899723391</p>
        </div>

        <div className="contactCard">
          <h3>💬 WhatsApp</h3>
          <a
            href="https://wa.me/919899723391"
            target="_blank"
            rel="noreferrer"
          >
            Chat on WhatsApp
          </a>
        </div>

        <div className="contactCard">
          <h3>📧 Email</h3>
          <p>theveltrixx@gmail.com</p>
        </div>

        <div className="contactCard">
          <h3>📸 Instagram</h3>
          <a
            href="https://www.instagram.com/the.veltrixx/"
            target="_blank"
            rel="noreferrer"
          >
            @the.veltrixx
          </a>
        </div>

      </div>
    </div>
  );
}

export default Contact;