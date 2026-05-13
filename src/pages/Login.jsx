import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/cabinet";
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function change(e) { setForm((f) => ({ ...f, [e.target.name]: e.target.value })); }

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate(from, { replace: true });
    } catch (err) {
      if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found") setError("Невірний email або пароль");
      else if (err.code === "auth/invalid-email") setError("Невірний формат email");
      else setError("Помилка входу. Спробуйте ще раз");
    }
    setLoading(false);
  }

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <div className="auth-logo">🌿 Разом</div>
          <h2>Раді бачити тебе знову!</h2>
          <p>Увійди до свого акаунту, щоб переглядати події та керувати своїм профілем.</p>
          <div className="auth-features">
            {["Мої зареєстровані події","Перегляд календаря","Оцінки ініціатив"].map((f) => (
              <div key={f} className="auth-feat">✅ {f}</div>
            ))}
          </div>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-box">
          <h1 className="auth-title">Вхід</h1>
          <p className="auth-sub">Немає акаунту? <Link to="/register">Зареєструватись</Link></p>

          <form onSubmit={submit}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" name="email" placeholder="you@example.com" value={form.email} onChange={change} required />
            </div>
            <div className="form-group">
              <label className="form-label">Пароль</label>
              <input className="form-input" type="password" name="password" placeholder="Ваш пароль" value={form.password} onChange={change} required />
            </div>
            {error && <p className="form-error">⚠️ {error}</p>}
            <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 8 }} disabled={loading}>
              {loading ? "Входимо..." : "Увійти →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
