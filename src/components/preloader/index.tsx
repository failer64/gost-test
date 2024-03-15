import loader from "../../assets/loading.gif";
import styles from "./style.module.scss";

export const Preloader = () => {
  return (
    <div className={styles.loading}>
      <img src={loader} alt="loading..." />
    </div>
  );
};
