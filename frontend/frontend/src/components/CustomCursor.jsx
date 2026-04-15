import { useEffect, useRef } from "react";

function CustomCursor() {
  const outerRef = useRef(null);
  const innerRef = useRef(null);

  useEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    let mouseX = 0, mouseY = 0;
    let outerX = 0, outerY = 0;

    const onMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      inner.style.left = `${mouseX}px`;
      inner.style.top = `${mouseY}px`;
    };

    // smooth follow for outer ring
    let raf;
    const follow = () => {
      outerX += (mouseX - outerX) * 0.15;
      outerY += (mouseY - outerY) * 0.15;
      outer.style.left = `${outerX}px`;
      outer.style.top = `${outerY}px`;
      raf = requestAnimationFrame(follow);
    };

    // enlarge cursor on interactive elements
    const onEnter = () => document.body.classList.add("cursor-hover");
    const onLeave = () => document.body.classList.remove("cursor-hover");

    const attachHovers = () => {
      document.querySelectorAll("a, button, input, textarea, select, [role='button'], .cursor-pointer").forEach((el) => {
        el.addEventListener("mouseenter", onEnter);
        el.addEventListener("mouseleave", onLeave);
      });
    };

    window.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(follow);
    attachHovers();

    // re-attach on DOM changes (for dynamic content)
    const mo = new MutationObserver(attachHovers);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
      mo.disconnect();
      document.body.classList.remove("cursor-hover");
    };
  }, []);

  return (
    <>
      <div ref={outerRef} className="cursor-outer" />
      <div ref={innerRef} className="cursor-inner" />
    </>
  );
}

export default CustomCursor;
