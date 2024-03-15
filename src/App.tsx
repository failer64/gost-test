import { useState, useEffect } from "react";
import { Card, Modal, Select } from "antd";
import { useForm } from "react-hook-form";
import { Item } from "./components/item";
import "./App.scss";
import { getUniqeItems } from "./heplers";
import { Preloader } from "./components/preloader";

export interface Items {
  code: string;
  name: string;
  price: number;
}

interface FormDataType {
  name: string;
  description: string;
  select: Items[];
}

interface DataType {
  query: string;
  results: string[];
}

function App() {
  const [items, setItems] = useState<Items[]>([]);

  const [activeItems, setActiveItems] = useState<Items[]>([]);

  const [select, setSelect] = useState<string[]>([]);

  const [text, setText] = useState("");

  const [name, setName] = useState("");

  const [isOpen, setIsOpen] = useState(false);

  const [isFetching, setIsFetching] = useState(false);

  const totalPrice = activeItems.reduce((sum, cur) => sum + cur.price, 0);

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<FormDataType>({
    mode: "onBlur",
  });

  useEffect(() => {
    fetch("https://gostassistent.ru/api/oks")
      .then((res) => res.json())
      .then((data) => setItems(data));
  }, []);

  const onSubmit = (data: FormDataType) => {
    const { name, description } = data;
    console.log(name, description, select);
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
      <form onSubmit={handleSubmit(onSubmit)} className={"form"}>
        <div className={"item"}>
          <label htmlFor="name" className={"label"}>
            Название объявления
          </label>
          <input
            className={errors.name && "input"}
            id="name"
            {...register("name", {
              required: "Введите Название",
            })}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {errors.name && (
            <span className={"error"}>{errors.name.message}</span>
          )}
        </div>
        <div className={"item"}>
          <label htmlFor="description">Текст объявления</label>
          <textarea
            value={text}
            className={errors.description && "input"}
            id="description"
            {...register("description", {
              required: "Введите Описание",
            })}
            onChange={(e) => setText(e.target.value)}
          />
          {errors.description && (
            <span className={"error"}>{errors.description.message}</span>
          )}
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
          {/* <select
	            multiple
	            id="select"
	            {...register("select", {
	              required:
	                "Для размещения объявления, выберите хотя бы один раздел ОКС",
	            })}
	            value={select}
	            onChange={(e) => handleChangeSelect(e)}
	          >
	            {!!items.length &&
	              items.map((o) => (
	                <option id={o.code} value={o.name}>
	                  {o.name}
	                </option>
	              ))}
	          </select> */}
          <Select
            //{...register("select", {
            //required:
            //"Для размещения объявления, выберите хотя бы один раздел ОКС",
            //})}
            id="select"
            mode="multiple"
            value={select}
            //value={activeItems}
            style={{ width: "100%" }}
            //onChange={setSelect}
            onChange={handleChangeSelect}
            //disabled={loading}
            placeholder={"Выберите фильтр"}
            allowClear
            //showSearch={false}
            //options={options}
          >
            {items.map((item) => (
              <Select.Option value={item.name} key={item.code}>
                {item.name}
              </Select.Option>
            ))}
          </Select>
          {/* {errors.select && (
	            <span className={"error"}>{errors.select.message}</span>
	          )} */}
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
        <span>Для размещения объявления, выберите хотя бы один раздел ОКС</span>
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
