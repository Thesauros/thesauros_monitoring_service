import React, { useState, useEffect, ReactNode, useCallback } from "react";
import ThemeContext from "./theme.context";
import { AppTheme } from "./index";

const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<AppTheme | string>("");

  useEffect(() => {
    if (theme) {
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem("theme", theme);
    }
    if (!theme) {
      const localStorageTheme = localStorage.getItem("theme");

      if (localStorageTheme) {
        setTheme(localStorageTheme);
      } else {
        setTheme(AppTheme.LIGHT);
      }
    }
  }, [theme]);

  const toggle = useCallback(() => {
    if (theme === AppTheme.LIGHT) {
      setTheme(AppTheme.DARK);
    } else {
      setTheme(AppTheme.LIGHT);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      <div className={`theme--${theme}`}>{children}</div>
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
