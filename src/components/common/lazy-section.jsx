import { useEffect, useRef, useState } from "react";

const LazySection = ({ children, minHeight = 240, rootMargin = "240px" }) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isVisible) return;
    if (!("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    const node = ref.current;
    if (node) observer.observe(node);

    return () => observer.disconnect();
  }, [isVisible, rootMargin]);

  return (
    <div ref={ref} style={!isVisible ? { minHeight } : undefined}>
      {isVisible ? children : null}
    </div>
  );
};

export default LazySection;
