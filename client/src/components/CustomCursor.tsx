import { useEffect, useRef, useState } from 'react';

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  const requestRef = useRef<number>(0);
  const mouse = useRef({ x: 0, y: 0 });
  const ring = useRef({ x: 0, y: 0 });

  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
      }
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive = 
        target.tagName.toLowerCase() === 'button' ||
        target.tagName.toLowerCase() === 'a' ||
        target.closest('button') !== null ||
        target.closest('a') !== null ||
        target.classList.contains('editorial-card') ||
        target.closest('.editorial-card') !== null;
      
      setIsHovering(isInteractive);
    };

    const onMouseLeave = () => {
      setIsVisible(false);
    };

    const onMouseEnter = () => {
      setIsVisible(true);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseover', onMouseOver);
    window.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('mouseenter', onMouseEnter);

    const updateRing = () => {
      ring.current.x += (mouse.current.x - ring.current.x) * 0.14;
      ring.current.y += (mouse.current.y - ring.current.y) * 0.14;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.current.x}px, ${ring.current.y}px, 0) translate(-50%, -50%)`;
      }

      requestRef.current = requestAnimationFrame(updateRing);
    };

    requestRef.current = requestAnimationFrame(updateRing);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', onMouseOver);
      window.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('mouseenter', onMouseEnter);
      cancelAnimationFrame(requestRef.current);
    };
  }, [isVisible]);

  return (
    <>
      <style>
        {`
          @media (hover: hover) and (pointer: fine) {
            html, body, a, button, input, select, textarea, [role="button"] {
              cursor: none !important;
            }
          }

          .custom-cursor-dot {
            position: fixed;
            top: 0;
            left: 0;
            width: 6px;
            height: 6px;
            background-color: var(--foreground);
            border-radius: 50%;
            pointer-events: none !important;
            z-index: 9999;
            transition: opacity 150ms ease;
            opacity: ${isVisible ? (isHovering ? 0 : 1) : 0};
          }

          .custom-cursor-ring {
            position: fixed;
            top: 0;
            left: 0;
            width: ${isHovering ? '42px' : '26px'};
            height: ${isHovering ? '42px' : '26px'};
            border: 1px solid var(--foreground);
            background-color: transparent !important;
            border-radius: 50%;
            pointer-events: none !important;
            z-index: 9998;
            transition: width 150ms ease, height 150ms ease, border-color 150ms ease, opacity 150ms ease;
            opacity: ${isVisible ? 0.75 : 0};
          }

          @media (hover: none) {
            .custom-cursor-dot, .custom-cursor-ring {
              display: none !important;
            }
          }
        `}
      </style>
      <div ref={dotRef} className="custom-cursor-dot" />
      <div ref={ringRef} className="custom-cursor-ring" />
    </>
  );
}
