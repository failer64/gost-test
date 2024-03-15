import { useState, useEffect, FormEvent } from "react";
import { Card, Modal, Select } from "antd";
import { Item } from "./components/item";
import { getUniqeItems } from "./heplers";
import { Preloader } from "./components/preloader";
import { Items, DataType } from "./types";
import "./App.scss";

function App() {
  const [items, setItems] = useState<Items[]>([]);

  const [activeItems, setActiveItems] = useState<Items[]>([]);

  const [select, setSelect] = useState<string[]>([]);

  const [text, setText] = useState("");

  const [name, setName] = useState("");

  const [isOpen, setIsOpen] = useState(false);

  const [isFetching, setIsFetching] = useState(false);

  const totalPrice = activeItems.reduce((sum, cur) => sum + cur.price, 0);

  useEffect(() => {
    setIsFetching(true);
    fetch("https://gostassistent.ru/api/oks")
      .then((res) => res.json())
      .then((data) => setItems(data))
      .finally(() => setIsFetching(false));
  }, []);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log(name, text, select);
    setIsOpen(true);
  };

  const onHandleClick = () => {
    setIsFetching(true);
    //массив гостов из текстового поля
    const arrGosts = text.match(/ГОСТ\s[0-9]{3,5}(-[0-9]{2,4})?/gim);

    if (arrGosts) {
      const body = { query: [...arrGosts] };
      fetch("https://gostassistent.ru/api/query-oks", {
        method: "POST",
        body: JSON.stringify(body),
      })
        .then((res) => res.json())
        .then((data: DataType[]) => {
          const newArrGosts: Items[] = [];
          for (let i = 0; i < data.length; i++) {
            for (let j = 0; j < items.length; j++) {
              if (data[i].results.includes(items[j].code)) {
                newArrGosts.push(items[j]);
              }
            }
          }
          if (newArrGosts.length) {
            const uniqeItems = getUniqeItems(newArrGosts);
            setActiveItems([...uniqeItems]);
            setSelect(uniqeItems.map((item) => item.name));
          }
        })
        .finally(() => setIsFetching(false));
    } else {
      setIsFetching(false);
    }
  };

  const handleChangeSelect = (arr: string[]) => {
    const newArr = [];
    for (let i = 0; i < arr.length; i++) {
      const el = items.find((item) => item.name === arr[i]);
      if (el) {
        newArr.push(el);
      }
    }
    setSelect([...arr]);
    setActiveItems([...newArr]);
  };

  const handleOk = () => {
    setIsOpen(false);
    setText("");
    setName("");
    setSelect([]);
    setActiveItems([]);
  };

  const onDeleteItem = (code: string) => {
    setActiveItems((prev) => prev.filter((p) => p.code !== code));
    const el = items.find((item) => item.code === code);
    if (el) {
      setSelect((prev) => prev.filter((p) => p !== el.name));
    }
  };

  return (
    <Card>
      <form onSubmit={onSubmit} className={"form"}>
        <div className={"item"}>
          <label htmlFor="name" className={"label"}>
            Название объявления
          </label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className={"item"}>
          <label htmlFor="description">Текст объявления</label>
          <textarea value={text} onChange={(e) => setText(e.target.value)} />
        </div>
        <div className={"item"}>
          <button
            disabled={isFetching}
            type="button"
            onClick={onHandleClick}
            className={"button"}
          >
            Подобрать ОКС на основе текста объявления
          </button>
        </div>
        <div className={"item"}>
          <label htmlFor="select">
            Список ОКС (Общероссийский классификатор стандартов)
          </label>
          <Select
            id="select"
            mode="multiple"
            value={select}
            style={{ maxWidth: "500px" }}
            onChange={handleChangeSelect}
            placeholder={"Выберите фильтр"}
            allowClear
          >
            {items.map((item) => (
              <Select.Option value={item.name} key={item.code}>
                {item.name}
              </Select.Option>
            ))}
          </Select>
        </div>
        <div className={"item"}>
          <button disabled={!activeItems.length} className={"button"}>
            Разместить объявление
          </button>
        </div>
      </form>
      {activeItems.length ? (
        <>
          {activeItems.map((item) => (
            <Item key={item.code} onDeleteItem={onDeleteItem} {...item} />
          ))}
          <span className="total">
            Итого: <b>{totalPrice} ₽</b>
          </span>
        </>
      ) : (
        <span className="error">
          Для размещения объявления, выберите хотя бы один раздел ОКС
        </span>
      )}
      <Modal
        title={`Ваше объявление "${name}" успешно размещено!`}
        open={isOpen}
        footer={null}
        onCancel={handleOk}
      ></Modal>
      {isFetching && <Preloader />}
    </Card>
  );
}

export default App;
