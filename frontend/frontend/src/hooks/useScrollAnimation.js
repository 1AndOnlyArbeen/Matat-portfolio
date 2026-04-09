import { useEffect, useCallback, useState } from "react";

function useScrollAnimation(threshold = 0.15) {
  const [element, setElement] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  // callback ref — fires whenever the DOM node attaches/detaches
  const ref = useCallback((node) => {
    setElement(node);
  }, []);

  useEffect(() => {
    if (!element || isVisible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      { threshold }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [element, threshold, isVisible]);

  return [ref, isVisible];
}

export default useScrollAnimation;
