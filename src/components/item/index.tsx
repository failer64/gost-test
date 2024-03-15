import { FC } from "react";
import { Items } from "../../App";
import styles from "./style.module.scss";

interface Props extends Items {
  onDeleteItem: (code: string) => void;
}

export const Item: FC<Props> = ({ code, name, price, onDeleteItem }) => {
  const handleClick = () => {
    onDeleteItem(code);
  };

  return (
    <div className={styles.item}>
      <span className={styles.code}>{code}</span>
      <span className={styles.name}>{name}</span>
      <span className={styles.price}>{price} ₽</span>
      <span className={styles.delete} onClick={handleClick}>
        &times;
      </span>
    </div>
  );
};
