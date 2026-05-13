import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase/config";
import EventCard from "../components/EventCard";
import "./Home.css";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ volunteers: 0, events: 0, avgRating: 0 });
  const { currentUser } = useAuth(); // Отримуємо статус користувача

  useEffect(() => {
    async function load() {
      try {
        // Recent events
        const q = query(collection(db, "events"), orderBy("date", "desc"), limit(3));
        const snap = await getDocs(q);
        const evList = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setEvents(evList);

        // Stats
        const usersSnap = await getDocs(collection(db, "users"));
        const allEvSnap = await getDocs(collection(db, "events"));
        const allEv = allEvSnap.docs.map((d) => d.data());
        const ratings = allEv.filter((e) => e.avgRating).map((e) => e.avgRating);
        const avg = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : "—";
        setStats({ volunteers: usersSnap.size, events: allEv.length, avgRating: avg });
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="home">
      {/* HERO */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-blob b1" />
          <div className="hero-blob b2" />
        </div>
        <div className="hero-inner">
          <div className="hero-text">
            <div className="section-tag" style={{ display: "inline-block", marginBottom: 20 }}>🌿 Волонтерська ініціатива</div>
            <h1 className="hero-title">Разом ми<br /><em>змінюємо</em><br />світ на краще</h1>
            <p className="hero-sub">Приєднуйся до спільноти волонтерів — беруй участь у подіях, допомагай ближнім і оцінюй ініціативи.</p>
            
            <div className="hero-btns">
              <Link to="/events" className="btn btn-primary btn-lg">Переглянути події →</Link>
              
              {/* ЛОГІКА КНОПКИ: Якщо не залогінений - "Стати волонтером", якщо залогінений - "Мій кабінет" */}
              {currentUser ? (
                <Link to="/cabinet" className="btn btn-outline btn-lg">Мій кабінет</Link>
              ) : (
                <Link to="/register" className="btn btn-outline btn-lg">Стати волонтером</Link>
              )}
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-card hc-1">
              <span className="hc-emoji">🏙️</span>
              <div>
                <strong>Прибирання парку</strong>
                <p>Сьогодні · 10:00</p>
              </div>
            </div>
            <div className="hero-main-blob">
              <div className="blob-emoji">💚</div>
            </div>
            <div className="hero-card hc-2">
              <span className="hc-emoji">⭐</span>
              <div>
                <strong>Рейтинг {stats.avgRating}</strong>
                <p>від спільноти</p>
              </div>
            </div>
            <div className="hero-card hc-3">
              <span className="hc-dot" />
              <div><strong>+{stats.volunteers}</strong> волонтерів</div>
            </div>
          </div>
        </div>

        <div className="hero-stats">
          <div className="hero-stats-inner">
            <div className="hs-item">
              <span className="hs-num">{stats.volunteers}</span>
              <span className="hs-label">Волонтерів</span>
            </div>
            <div className="hs-divider" />
            <div className="hs-item">
              <span className="hs-num">{stats.events}</span>
              <span className="hs-label">Подій проведено</span>
            </div>
            <div className="hs-divider" />
            <div className="hs-item">
              <span className="hs-num">{stats.avgRating}</span>
              <span className="hs-label">Середній рейтинг</span>
            </div>
          </div>
        </div>
      </section>

      {/* RECENT EVENTS */}
      <section className="section">
        <div className="section-inner">
          <div className="section-header">
            <div className="section-tag">Останні події</div>
            <h2 className="section-title">Актуальні ініціативи</h2>
            <p className="section-sub">Долучайся до найближчих подій та допомагай своїй громаді</p>
          </div>
          {loading ? (
            <div className="spinner-wrap"><div className="spinner" /></div>
          ) : events.length ? (
            <div className="grid-2">
              {events.map((e) => <EventCard key={e.id} event={e} />)}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🌱</div>
              <h3>Ще немає подій</h3>
              <p>Незабаром тут з'являться перші ініціативи!</p>
            </div>
          )}
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <Link to="/events" className="btn btn-outline btn-lg">Всі події →</Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section how-section">
        <div className="section-inner">
          <div className="section-header">
            <div className="section-tag">Як це працює</div>
            <h2 className="section-title">3 простих кроки</h2>
          </div>
          <div className="steps-grid">
            {[
              { num: "01", icon: "👤", title: "Зареєструйся", desc: "Створи акаунт за кілька секунд — лише email і пароль." },
              { num: "02", icon: "🗓️", title: "Обери подію", desc: "Переглядай події та записуйся на ті, що тебе цікавлять." },
              { num: "03", icon: "⭐", title: "Оціни ініціативу", desc: "Після участі залиш оцінку та допоможи спільноті зростати." },
            ].map((s) => (
              <div key={s.num} className="step-card">
                <div className="step-num">{s.num}</div>
                <div className="step-icon">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA: Ховаємо або міняємо текст для зареєстрованих */}
      <section className="cta-section">
        <div className="cta-inner">
          {currentUser ? (
            <>
              <h2>Раді бачити тебе знову!</h2>
              <p>Твоя допомога робить світ кращим кожного дня.</p>
              <Link to="/events" className="btn btn-accent btn-lg">До нових пригод! →</Link>
            </>
          ) : (
            <>
              <h2>Готовий змінювати світ?</h2>
              <p>Приєднуйся до тисяч волонтерів вже сьогодні</p>
              <Link to="/register" className="btn btn-accent btn-lg">Приєднатись безкоштовно →</Link>
            </>
          )}
        </div>
      </section>
    </div>
  );
}