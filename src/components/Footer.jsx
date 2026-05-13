import { Link } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="footer-logo">🌿 <strong>Разом</strong></div>
          <p>Волонтерська ініціатива, що об'єднує людей для добрих справ.</p>
        </div>
        <div className="footer-links">
          <div>
            <h4>Навігація</h4>
            <ul>
              <li><Link to="/">Головна</Link></li>
              <li><Link to="/events">Події</Link></li>
              <li><Link to="/calendar">Календар</Link></li>
              <li><Link to="/cabinet">Кабінет</Link></li>
            </ul>
          </div>
          <div>
            <h4>Акаунт</h4>
            <ul>
              <li><Link to="/login">Увійти</Link></li>
              <li><Link to="/register">Реєстрація</Link></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Разом. Всі права захищені.</span>
      </div>
    </footer>
  );
}
