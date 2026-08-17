import { useEffect, useRef, useState } from 'react';

/**
 * useInView — triggers an animation when an element enters the viewport.
 * @param {Object} options
 * @param {number} options.threshold - 0 to 1, how much of the element must be visible
 * @param {string} options.rootMargin - margin around root (e.g. '0px 0px -50px 0px')
 * @param {boolean} options.once - if true, only triggers once (default: true)
 * @returns {{ ref, inView }}
 */
export function useInView({ threshold = 0.15, rootMargin = '0px 0px -40px 0px', once = true } = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return { ref, inView };
}
