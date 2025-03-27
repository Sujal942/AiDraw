const Footer = () => {
  return (
    <footer className="bg-dark text-center text-white mt-5">
      {/* Grid container */}
      <div className="container p-4"></div>

      {/* Section: Text */}
      <section className="mb-4">
        <p>Designed & Developed by Sujal and Sneha</p>
      </section>

      {/* Copyright */}
      <div
        className="text-center p-3"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.2)" }}
      >
        © 2025 Copyright: AI Draw
      </div>
    </footer>
  );
};

export default Footer;
