import { FC, useEffect, useState } from "react";
import { Items } from "../../types";
import styles from "./style.module.scss";
import { AnimatePresence, motion } from "framer-motion";

interface Props extends Items {
  onDeleteItem: (code: string) => void;
}

export const Item: FC<Props> = ({ code, name, price, onDeleteItem }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleClick = () => {
    setIsVisible(false);
    setTimeout(() => {
      onDeleteItem(code);
    }, 500);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: "auto" }}
          exit={{ height: 0 }}
          style={{
            overflow: "hidden",
            borderBottom: "1px solid #ddd",
            paddingBottom: "0.5rem",
            marginBottom: "0.5rem",
          }}
          transition={{ duration: 0.2 }}
        >
          <div className={styles.item}>
            <span className={styles.code}>{code}</span>
            <span className={styles.name}>{name}</span>
            <span className={styles.price}>{price} ₽</span>
            <span className={styles.delete} onClick={handleClick}>
              &times;
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
