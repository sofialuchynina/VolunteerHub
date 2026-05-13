import { Link } from "react-router-dom";
import "./EventCard.css";

const categoryLabels = {
  ecology: { label: "Екологія", emoji: "🌱" },
  social: { label: "Соціальне", emoji: "🤝" },
  animals: { label: "Тварини", emoji: "🐾" },
  education: { label: "Освіта", emoji: "📚" },
  culture: { label: "Культура", emoji: "🎨" },
};

export default function EventCard({ event }) {
  const cat = categoryLabels[event.category] || { label: event.category, emoji: "📌" };
  const dateObj = event.date?.toDate ? event.date.toDate() : new Date(event.date);
  const dateStr = dateObj.toLocaleDateString("uk-UA", { day: "numeric", month: "long", year: "numeric" });
  const filled = event.registeredCount || 0;
  const total = event.capacity || 15;
  const pct = Math.min(100, Math.round((filled / total) * 100));

  return (
    <div className="event-card">
      <div className="event-card-top">
        <span className="badge badge-green">{cat.emoji} {cat.label}</span>
        {pct >= 90 && <span className="badge badge-orange">Майже заповнено</span>}
      </div>
      <h3 className="event-card-title">{event.title}</h3>
      <p className="event-card-desc">{event.description?.slice(0, 100)}…</p>

      <div className="event-card-meta">
        <div className="meta-row"><span className="meta-icon">📅</span>{dateStr}</div>
        <div className="meta-row"><span className="meta-icon">📍</span>{event.location}</div>
      </div>

      <div className="event-card-rating">
        <span className="stars">{"★".repeat(Math.round(event.avgRating || 0))}{"☆".repeat(5 - Math.round(event.avgRating || 0))}</span>
        <span className="rating-num">{event.avgRating ? event.avgRating.toFixed(1) : "—"}</span>
        <span className="rating-count">({event.ratingCount || 0} оцінок)</span>
      </div>

      <div className="event-capacity">
        <div className="capacity-bar">
          <div className="capacity-fill" style={{ width: `${pct}%` }} />
        </div>
        <span className="capacity-text">{filled} / {total} учасників</span>
      </div>

      <Link to={`/events/${event.id}`} className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }}>
        Детальніше →
      </Link>
    </div>
  );
}
