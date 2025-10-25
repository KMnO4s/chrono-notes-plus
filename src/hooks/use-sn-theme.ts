import { useEffect } from "react";
import { useTheme } from "next-themes";

export function useSNThemeSync() {
  const { setTheme } = useTheme();

  useEffect(() => {
    // Function to detect and apply Standard Notes theme
    const syncTheme = () => {
      try {
        // Check for dark mode via media query (Standard Notes sets this)
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        // Also check document.body classes that might be set by Standard Notes
        const bodyClasses = document.body.className;
        const isDark = bodyClasses.includes('dark') || 
                      bodyClasses.includes('Dark') ||
                      prefersDark;
        
        setTheme(isDark ? "dark" : "light");
        console.log('[Theme] Synced with Standard Notes:', isDark ? 'dark' : 'light');
      } catch (e) {
        console.error('[Theme] Failed to sync theme:', e);
      }
    };

    // Initial sync
    syncTheme();

    // Listen for theme changes via media query
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => syncTheme();
    
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [setTheme]);
}
