import React from "react";

export enum AppTheme {
  LIGHT = "light",
  DARK = "dark",
}

type TThemeState = {
  theme: AppTheme | string;
  toggle: () => void;
};

export const initialThemeState: TThemeState = {
  theme: "",
  toggle: () => null,
};

const ThemeContext = React.createContext(initialThemeState);
export default ThemeContext;
