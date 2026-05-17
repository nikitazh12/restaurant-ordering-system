import { Link } from "react-router";

export default function Header() {
  return (
    <nav>
      <Link to='/'>Главная</Link>
      <Link to='/menu'>Меню</Link>
      <Link to='/cart' className="cart">Корзина</Link>
      <Link to='/checkout' className="checkout">Оформить заказ</Link>
    </nav>
  );
}