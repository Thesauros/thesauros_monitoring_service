import Link from "next/link";

import styles from "./NavMenu.module.scss";
const menuItems = [{ name: "Locus Admin", url: "/" }];

export const NavMenu = () => {
  return (
    <div className={styles.root}>
      {menuItems.map(({ name, url }) => (
        <Link href={url} className={styles.menuItem} key={`${name}_${url}`}>
          {name}
        </Link>
      ))}
    </div>
  );
};
