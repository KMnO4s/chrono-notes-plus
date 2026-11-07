import { useEffect } from "react";
import { useTheme } from "next-themes";

// Detects whether the active Standard Notes theme is dark from its background color.
function isBackgroundDark(): boolean | null {
  const probe = document.createElement("div");
  probe.style.color = "var(--sn-stylekit-background-color)";
  probe.style.display = "none";
  document.body.appendChild(probe);
  const raw = getComputedStyle(document.documentElement).getPropertyValue("--sn-stylekit-background-color").trim();
  const color = getComputedStyle(probe).color;
  probe.remove();
  if (!raw) return null;
  const nums = color.match(/[\d.]+/g)?.map(Number);
  if (!nums || nums.length < 3) return null;
  const [r, g, b] = nums;
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.5;
}

export function useSNThemeSync() {
  const { setTheme } = useTheme();

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => {
      const dark = isBackgroundDark();
      setTheme((dark ?? mq.matches) ? "dark" : "light");
    };
    sync();
    const timers = [200, 1000, 3000].map((t) => setTimeout(sync, t));
    const observer = new MutationObserver(() => setTimeout(sync, 50));
    observer.observe(document.head, { childList: true, subtree: true, attributes: true });
    document.querySelectorAll("link[rel=stylesheet]").forEach((l) => l.addEventListener("load", sync));
    const onLoad = (e: Event) => { if ((e.target as HTMLElement)?.tagName === "LINK") sync(); };
    document.addEventListener("load", onLoad, true);
    mq.addEventListener("change", sync);
    return () => {
      timers.forEach(clearTimeout);
      observer.disconnect();
      document.removeEventListener("load", onLoad, true);
      mq.removeEventListener("change", sync);
    };
  }, [setTheme]);
}
