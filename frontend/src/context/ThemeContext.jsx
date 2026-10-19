import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({
  theme: "dark",
  isLight: false,
  toggleTheme: () => {},
  setTheme: () => {},
});



export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try {
      const saved = localStorage.getItem("anifind_theme");
      if (saved === "light" || saved === "dark") return saved;
      if (window.matchMedia?.("(prefers-color-scheme: light)").matches) {
        return "light";
      }
    } catch {
      /* ignore storage access error */
    }
    return "dark";
  });

  const applyThemeToDOM = (nextTheme, withTransition = false) => {
    const root = document.documentElement;

    if (withTransition) {
      root.classList.add("theme-transitioning");
      window.clearTimeout(window.__themeTransitionTimeout);
      window.__themeTransitionTimeout = window.setTimeout(() => {
        root.classList.remove("theme-transitioning");
      }, 260);
    }

    root.setAttribute("data-theme", nextTheme);
    root.classList.toggle("dark", nextTheme === "dark");
    root.classList.toggle("light", nextTheme === "light");

    // update theme-color meta tag
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute("content", nextTheme === "light" ? "#E6E9DF" : "#0a0a14");
    }
  };

  useEffect(() => {
    applyThemeToDOM(theme, false);
  }, []);

  const setTheme = (nextTheme) => {
    setThemeState(nextTheme);
    applyThemeToDOM(nextTheme, true);
    try {
      localStorage.setItem("anifind_theme", nextTheme);
    } catch {
      /* ignore */
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isLight: theme === "light",
        toggleTheme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
