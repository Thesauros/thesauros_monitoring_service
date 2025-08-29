import { useContext } from "react";
import ThemeContext from "./theme.context";

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("Theme context is required!");
  }
  return context;
};
