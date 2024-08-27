import { useEffect, useState } from "react";

export function useDarkMode(): [string, () => void] {
  const [theme, setTheme] = useState<string>(() =>
    typeof window !== "undefined" && localStorage.getItem("THEME")
      ? localStorage.getItem("THEME")!
      : "light"
  );

  useEffect(() => {
    if (theme) {
      document.documentElement.classList.toggle("dark", theme === "dark");
      localStorage.setItem("THEME", theme);
    } else {
      localStorage.setItem("THEME", "light");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return [theme, toggleTheme];
}
