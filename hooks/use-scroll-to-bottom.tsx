import { useEffect, useRef, type RefObject } from "react";

export function useScrollToBottom<T extends HTMLElement>(): [
  RefObject<T>,
  RefObject<T>,
] {
  const containerRef = useRef<T>(null);
  const endRef = useRef<T>(null);

  useEffect(() => {
    const container = containerRef.current;
    const end = endRef.current;

    if (container && end) {
      const shouldAutoScroll = () => {
        const distanceFromBottom =
          container.scrollHeight - container.clientHeight - container.scrollTop;
        return distanceFromBottom < 120; // only auto-scroll when user is near bottom
      };

      const observer = new MutationObserver(() => {
        // Only scroll when new nodes are added and the user is near the bottom.
        if (!shouldAutoScroll()) return;
        requestAnimationFrame(() => {
          end.scrollIntoView({ behavior: "auto", block: "end" });
        });
      });

      observer.observe(container, {
        childList: true,
        subtree: true,
        attributes: false,
        characterData: false,
      });

      return () => observer.disconnect();
    }
  }, []);

  return [containerRef, endRef];
}
