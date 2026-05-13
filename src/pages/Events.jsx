import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../firebase/config";
import EventCard from "../components/EventCard";
import "./Events.css";

// Знайти цей блок у Events.jsx і замінити на цей:
const CATEGORIES = [
  { value: "all", label: "Всі" },
  { value: "Екологія", label: "🌱 Екологія" }, // Було "ecology"
  { value: "Соціальне", label: "🤝 Соціальне" }, // Було "social"
  { value: "Тварини", label: "🐾 Тварини" }, // Було "animals"
  { value: "Освіта", label: "📚 Освіта" }, // Було "education"
  { value: "Культура", label: "🎨 Культура" }, // Було "culture"
  { value: "Допомога армії", label: "🪖 Допомога армії" }, // Додайте нові, якщо треба
  { value: "Гуманітарна допомога", label: "📦 Гуманітарна допомога" },
];

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");

  // ФУНКЦІЯ ДЛЯ АВТОМАТИЧНОГО СТВОРЕННЯ ПОДІЙ
  const seedEvents = async () => {
    const dummyData = [
      {
        title: "Посадка дерев у парку",
        description: "Приєднуйтесь до нашої щорічної акції з озеленення міста. Садимо клени та липи.",
        category: "ecology",
        location: "Центральний парк, Київ",
        date: Timestamp.fromDate(new Date("2026-05-15")),
        capacity: 20,
        registeredCount: 15,
        avgRating: 4.8,
        ratingCount: 12
      },
      {
        title: "Допомога притулку 'Сірко'",
        description: "Потрібні волонтери для вигулу собак та прибирання вольєрів.",
        category: "animals",
        location: "Притулок Сірко, Ірпінь",
        date: Timestamp.fromDate(new Date("2026-05-20")),
        capacity: 10,
        registeredCount: 3,
        avgRating: 5.0,
        ratingCount: 8
      },
      {
        title: "Урок програмування для дітей",
        description: "Проводимо безкоштовний майстер-клас зі Scratch для дітей з багатодітних родин.",
        category: "education",
        location: "Hub Світло, Львів",
        date: Timestamp.fromDate(new Date("2026-06-01")),
        capacity: 15,
        registeredCount: 14, // Тут спрацює бадж "Майже заповнено"
        avgRating: 4.5,
        ratingCount: 5
      }
    ];

    try {
      for (const item of dummyData) {
        await addDoc(collection(db, "events"), item);
      }
      window.location.reload(); // Перезавантажуємо, щоб побачити результат
    } catch (e) {
      alert("Помилка при створенні: " + e.message);
    }
  };

  useEffect(() => {
    async function load() {
      try {
        const q = query(collection(db, "events"), orderBy("date", "asc"));
        const snap = await getDocs(q);
        setEvents(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    load();
  }, []);

  const filtered = events.filter((e) => {
    const catOk = category === "all" || e.category === category;
    const searchOk = e.title?.toLowerCase().includes(search.toLowerCase()) ||
      e.location?.toLowerCase().includes(search.toLowerCase());
    return catOk && searchOk;
  });

  return (
    <div>
      <div className="page-hero">
        <div className="page-hero-inner">
          <h1>🗓️ Всі події</h1>
          <p>Знайди ініціативу до душі та долучайся до зміни на краще</p>
          
          {/* КНОПКА З'ЯВИТЬСЯ ТІЛЬКИ ЯКЩО БАЗА ПОРОЖНЯ */}
          {!loading && events.length === 0 && (
            <button onClick={seedEvents} className="btn btn-primary" style={{marginTop: '20px'}}>
              ✨ Створити тестові події
            </button>
          )}
        </div>
      </div>

      <div className="section-inner" style={{ paddingTop: 40, paddingBottom: 80 }}>
        <div className="events-filters">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              className="form-input search-input"
              placeholder="Пошук за назвою або місцем..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="cat-tabs">
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                className={`cat-tab ${category === c.value ? "active" : ""}`}
                onClick={() => setCategory(c.value)}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <p className="events-count">{filtered.length} подій знайдено</p>

        {loading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : filtered.length ? (
          <div className="grid-2">
            {filtered.map((e) => <EventCard key={e.id} event={e} />)}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🔎</div>
            <h3>Нічого не знайдено</h3>
            <p>Спробуй змінити фільтри або пошуковий запит</p>
          </div>
        )}
      </div>
    </div>
  );
}