import { useState } from "react";

export default function AdminProduct() {
  const [title, setTitle] = useState('');
  const [price, setPrise] = useState('');
  const [category, setCategory] = useState('soups');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    const newDish = {
      title: title,
      price: Number(price),
      category: category,
      description: description,
      imageUrl: imageUrl
    }

    console.log('Данные готовы к отправке на backend:', newDish);

    alert(`Блюдо "${title}" успешно создано! (пока в консоли)`);

    setTitle('');
    setPrise('');
    setDescription('');
    setImageUrl('');
  };

  return (
    <div className="home">
      <h1>Панель управления: Меню</h1>

      <form onSubmit={handleSubmit} className="form-product">

        <label>
          <input 
          placeholder="Название блюда"
          type="text"
          value={title} 
          onChange={(e) => setTitle(e.target.value)}
          required
          className="input-form"
          />
        </label>

        <label>
          <input 
          placeholder="Цена"
          type="number" 
          value={price}
          onChange={(e) => setPrise(e.target.value)}
          required
          className="input-form"
          />
        </label>

        <label>
          Категория:
          <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="input-form">
            <option value="soups">Супы</option>
            <option value="main-dishes">Горячие блюда</option>
            <option value="pancakes">Блины и выпечка</option>
            <option value="salads">Салаты</option>
            <option value="drinks">Напитки</option>
          </select>
        </label>

        <label>
          Описание:
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="3"
            className="input-form"
          />

        </label>

        <label>
          <input 
          placeholder="Ссылка на картинку"
          type="url" 
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="input-form"
          />
        </label>

        <button
        type="submit"
        className="btn-product">
          Добавить
        </button>
        
      </form>
    </div>
  );
}