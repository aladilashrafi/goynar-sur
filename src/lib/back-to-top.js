export default function BackToTop(value) {
  const result = document.querySelector(value);
  if (result) {
    let ticking = false;

    const updateButton = () => {
      if (window.scrollY > 200) {
        result.classList.add("back-to-top-btn-show");
      } else {
        result.classList.remove("back-to-top-btn-show");
      }

      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(updateButton);
      }
    };

    const handleClick = () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    updateButton();
    document.addEventListener("scroll", handleScroll, { passive: true });
    result.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("scroll", handleScroll);
      result.removeEventListener("click", handleClick);
    };
  }

  return undefined;
}
