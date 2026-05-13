import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function change(e) { setForm((f) => ({ ...f, [e.target.name]: e.target.value })); }

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) return setError("Введіть ваше ім'я");
    if (form.password !== form.confirm) return setError("Паролі не збігаються");
    if (form.password.length < 6) return setError("Пароль має бути не менше 6 символів");
    setLoading(true);
    try {
      await register(form.email, form.password, form.name);
      navigate("/cabinet");
    } catch (err) {
      if (err.code === "auth/email-already-in-use") setError("Цей email вже зареєстровано");
      else if (err.code === "auth/invalid-email") setError("Невірний формат email");
      else setError("Помилка реєстрації. Спробуйте ще раз");
    }
    setLoading(false);
  }

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <div className="auth-logo">🌿 Разом</div>
          <h2>Долучайся до спільноти волонтерів</h2>
          <p>Разом ми можемо змінити світ на краще — одна ініціатива за раз.</p>
          <div className="auth-features">
            {["Запис на волонтерські події","Особистий кабінет","Оцінка ініціатив"].map((f) => (
              <div key={f} className="auth-feat">✅ {f}</div>
            ))}
          </div>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-box">
          <h1 className="auth-title">Реєстрація</h1>
          <p className="auth-sub">Вже є акаунт? <Link to="/login">Увійти</Link></p>

          <form onSubmit={submit}>
            <div className="form-group">
              <label className="form-label">Ваше ім'я</label>
              <input className="form-input" name="name" placeholder="Іванна Петренко" value={form.name} onChange={change} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" name="email" placeholder="you@example.com" value={form.email} onChange={change} required />
            </div>
            <div className="form-group">
              <label className="form-label">Пароль</label>
              <input className="form-input" type="password" name="password" placeholder="Мін. 6 символів" value={form.password} onChange={change} required />
            </div>
            <div className="form-group">
              <label className="form-label">Підтвердіть пароль</label>
              <input className="form-input" type="password" name="confirm" placeholder="Повторіть пароль" value={form.confirm} onChange={change} required />
            </div>
            {error && <p className="form-error">⚠️ {error}</p>}
            <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 8 }} disabled={loading}>
              {loading ? "Реєстрація..." : "Зареєструватись →"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
