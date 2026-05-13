import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

export default function Navbar() {
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Список посилань (Адмінку додано в кінець)
  const links = [
    { to: "/", label: "Головна" },
    { to: "/events", label: "Події" },
    { to: "/calendar", label: "Календар" },
    { to: "/cabinet", label: "Мій кабінет" },
    { to: "/admin", label: "Керування" }, // Новий пункт меню
  ];

  async function handleLogout() {
    try {
      await logout();
      navigate("/");
      setMenuOpen(false);
    } catch (error) {
      console.error("Помилка при виході:", error);
    }
  }

  const isActive = (to) =>
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  return (
    <nav className="navbar">
      <div className="nav-inner">
        {/* Логотип */}
        <Link to="/" className="nav-logo" onClick={() => setMenuOpen(false)}>
          <span className="logo-icon">🌿</span>
          <span className="logo-text">VolunteerHub</span>
        </Link>

        {/* Навігаційні посилання */}
        <ul className={`nav-links ${menuOpen ? "open" : ""}`}>
          {links.map((l) => (
            <li key={l.to}>
              <Link
                to={l.to}
                className={isActive(l.to) ? "active" : ""}
                onClick={() => setMenuOpen(false)}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Права частина: Профіль або Кнопки входу */}
        <div className="nav-right">
          {currentUser ? (
            <div className="nav-user">
              <Link to="/cabinet" className="user-chip" onClick={() => setMenuOpen(false)}>
                <div className="user-avatar">
                  {(userProfile?.name || currentUser.email || "U")[0].toUpperCase()}
                </div>
                <span>{userProfile?.name?.split(" ")[0] || "Профіль"}</span>
              </Link>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
                Вийти
              </button>
            </div>
          ) : (
            <div className="nav-auth">
              <Link to="/login" className="btn btn-ghost btn-sm">Увійти</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Приєднатись</Link>
            </div>
          )}

          {/* Бургер-меню для мобілок */}
          <button
            className={`burger ${menuOpen ? "active" : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Меню"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </nav>
  );
}