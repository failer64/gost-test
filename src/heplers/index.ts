import { Items } from "../App";

// Получать уникальные значение массива по code
export function getUniqeItems(items: Items[]) {
  return items.reduce(
    (res: Items[], cur) =>
      res.find((find) => find.code === cur.code) ? res : [...res, cur],
    []
  );
}
