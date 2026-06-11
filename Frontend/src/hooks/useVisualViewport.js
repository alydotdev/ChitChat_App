import { useEffect, useState } from "react";

export function useVisualViewport() {
  const [height, setHeight] = useState(
    () => window.visualViewport?.height ?? window.innerHeight
  );
  const [offsetTop, setOffsetTop] = useState(
    () => window.visualViewport?.offsetTop ?? 0
  );

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const update = () => {
      setHeight(viewport.height);
      setOffsetTop(viewport.offsetTop);
    };

    update();
    viewport.addEventListener("resize", update);
    viewport.addEventListener("scroll", update);
    return () => {
      viewport.removeEventListener("resize", update);
      viewport.removeEventListener("scroll", update);
    };
  }, []);

  return { height, offsetTop };
}
