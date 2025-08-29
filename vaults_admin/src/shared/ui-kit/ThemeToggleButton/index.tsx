import { useTheme } from "@/shared/theme/theme";
import styles from "./ThemeToggleButton.module.scss";

export const ThemeToggleButton = () => {
  const { toggle } = useTheme();

  const handleChange = () => {
    toggle();
  };

  return (
    <div className={styles.toggle}>
      <input
        onChange={handleChange}
        type="checkbox"
        id="checkbox"
        className={styles.checkbox}
      />
      <label htmlFor="checkbox" className={styles.label}>
        <i className="fas fa-moon" />
        <i className="fas fa-sun" />
        <div className={styles.ball}></div>
      </label>
    </div>
  );
};
