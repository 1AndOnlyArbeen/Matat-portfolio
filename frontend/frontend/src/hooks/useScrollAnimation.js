import { useEffect, useCallback, useState } from "react";

function useScrollAnimation(threshold = 0.15, repeat = false) {
  const [element, setElement] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  // callback ref — fires whenever the DOM node attaches/detaches
  const ref = useCallback((node) => {
    setElement(node);
  }, []);

  useEffect(() => {
    if (!element) return;
    if (!repeat && isVisible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (!repeat) observer.unobserve(element);
        } else if (repeat) {
          setIsVisible(false);
        }
      },
      { threshold }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [element, threshold, repeat, isVisible]);

  return [ref, isVisible];
}

export default useScrollAnimation;
