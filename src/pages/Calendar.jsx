import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase/config";
import { Link } from "react-router-dom";
import "./Calendar.css";

const MONTHS = ["Січень","Лютий","Березень","Квітень","Травень","Червень","Липень","Серпень","Вересень","Жовтень","Листопад","Грудень"];
const DAYS = ["Пн","Вт","Ср","Чт","Пт","Сб","Нд"];

export default function Calendar() {
  const [events, setEvents] = useState([]);
  const [today] = useState(new Date());
  const [current, setCurrent] = useState({ year: new Date().getFullYear(), month: new Date().getMonth() });
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    async function load() {
      const snap = await getDocs(query(collection(db, "events"), orderBy("date", "asc")));
      setEvents(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    }
    load();
  }, []);

  const { year, month } = current;

  function daysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }
  function firstDay(y, m) {
    let d = new Date(y, m, 1).getDay();
    return d === 0 ? 6 : d - 1; // Monday first
  }

  const totalDays = daysInMonth(year, month);
  const startOffset = firstDay(year, month);

  const eventsByDay = {};
  events.forEach((e) => {
    const d = e.date?.toDate ? e.date.toDate() : new Date(e.date);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      if (!eventsByDay[day]) eventsByDay[day] = [];
      eventsByDay[day].push(e);
    }
  });

  const selectedEvents = selected ? (eventsByDay[selected] || []) : [];

  function prev() {
    setCurrent(({ year, month }) => month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 });
    setSelected(null);
  }
  function next() {
    setCurrent(({ year, month }) => month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 });
    setSelected(null);
  }

  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);

  return (
    <div>
      <div className="page-hero">
        <div className="page-hero-inner">
          <h1>📅 Календар подій</h1>
          <p>Плануй участь заздалегідь — переглядай події по місяцях</p>
        </div>
      </div>

      <div className="section-inner" style={{ paddingTop: 48, paddingBottom: 80 }}>
        <div className="cal-layout">
          <div className="cal-wrap card">
            <div className="cal-header">
              <button className="cal-nav" onClick={prev}>←</button>
              <h2 className="cal-title">{MONTHS[month]} {year}</h2>
              <button className="cal-nav" onClick={next}>→</button>
            </div>

            <div className="cal-days-header">
              {DAYS.map((d) => <div key={d} className="cal-day-name">{d}</div>)}
            </div>

            <div className="cal-grid">
              {cells.map((d, i) => {
                if (d === null) return <div key={`e-${i}`} className="cal-cell empty" />;
                const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                const hasEvents = !!eventsByDay[d];
                const isSelected = d === selected;
                return (
                  <div
                    key={d}
                    className={`cal-cell ${isToday ? "today" : ""} ${hasEvents ? "has-events" : ""} ${isSelected ? "selected" : ""}`}
                    onClick={() => setSelected(d === selected ? null : d)}
                  >
                    <span>{d}</span>
                    {hasEvents && (
                      <div className="cal-dots">
                        {eventsByDay[d].slice(0, 3).map((_, j) => <span key={j} className="cal-dot" />)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="cal-sidebar">
            {selected ? (
              <div>
                <h3 className="cal-sidebar-title">
                  {selected} {MONTHS[month]}
                </h3>
                {selectedEvents.length ? (
                  <div className="cal-events-list">
                    {selectedEvents.map((e) => {
                      const d = e.date?.toDate ? e.date.toDate() : new Date(e.date);
                      return (
                        <Link to={`/events/${e.id}`} key={e.id} className="cal-event-item card">
                          <div className="cal-event-time">
                            {d.toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" })}
                          </div>
                          <div className="cal-event-info">
                            <strong>{e.title}</strong>
                            <p>📍 {e.location}</p>
                            <div className="stars" style={{ fontSize: "0.85rem" }}>
                              {"★".repeat(Math.round(e.avgRating || 0))}{"☆".repeat(5 - Math.round(e.avgRating || 0))}
                              <span style={{ color: "var(--text-muted)", marginLeft: 4, fontFamily: "var(--font-body)" }}>
                                {e.avgRating?.toFixed(1) || "—"}
                              </span>
                            </div>
                          </div>
                          <span className="cal-event-arrow">→</span>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="empty-state" style={{ padding: "40px 0" }}>
                    <div className="empty-icon">📭</div>
                    <h3>Подій немає</h3>
                    <p>Цього дня не заплановано жодної події</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="cal-hint">
                <div className="empty-icon">👆</div>
                <h3>Оберіть день</h3>
                <p>Натисни на будь-який день з позначками, щоб побачити події</p>
                <div className="cal-legend">
                  <div className="legend-item"><span className="cal-dot" />є події</div>
                  <div className="legend-item"><span className="today-dot" />сьогодні</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
