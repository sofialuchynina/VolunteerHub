import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  doc, getDoc, updateDoc, arrayUnion, arrayRemove,
  collection, addDoc, getDocs, query, orderBy, serverTimestamp
} from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import "./EventDetail.css";

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, userProfile, fetchUserProfile } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ratings, setRatings] = useState([]);
  const [myRating, setMyRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const isRegistered = userProfile?.registeredEvents?.includes(id);

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDoc(doc(db, "events", id));
        if (!snap.exists()) { navigate("/events"); return; }
        setEvent({ id: snap.id, ...snap.data() });

        const rSnap = await getDocs(query(collection(db, "events", id, "ratings"), orderBy("createdAt", "desc")));
        const rList = rSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setRatings(rList);

        if (currentUser) {
          const mine = rList.find((r) => r.userId === currentUser.uid);
          if (mine) setMyRating(mine.value);
        }
      } catch (e) { console.error(e); }
      setLoading(false);
    }
    load();
  }, [id, currentUser]);

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleRegister() {
    if (!currentUser) { navigate("/register"); return; }
    if (submitting) return;
    setSubmitting(true);
    try {
      const userRef = doc(db, "users", currentUser.uid);
      const eventRef = doc(db, "events", id);
      if (isRegistered) {
        await updateDoc(userRef, { registeredEvents: arrayRemove(id) });
        await updateDoc(eventRef, { registeredCount: (event.registeredCount || 1) - 1 });
        showToast("Ви скасували реєстрацію");
      } else {
        if ((event.registeredCount || 0) >= event.capacity) { showToast("Місць немає", "error"); setSubmitting(false); return; }
        await updateDoc(userRef, { registeredEvents: arrayUnion(id) });
        await updateDoc(eventRef, { registeredCount: (event.registeredCount || 0) + 1 });
        showToast("Ви зареєстровані на подію! 🎉");
      }
      await fetchUserProfile(currentUser.uid);
      const snap = await getDoc(doc(db, "events", id));
      setEvent({ id: snap.id, ...snap.data() });
    } catch (e) { showToast("Помилка", "error"); }
    setSubmitting(false);
  }

  async function submitRating(value) {
    if (!currentUser) { navigate("/login"); return; }
    setSubmitting(true);
    try {
      // check existing
      const existing = ratings.find((r) => r.userId === currentUser.uid);
      if (existing) {
        showToast("Ви вже оцінили цю подію", "error");
        setSubmitting(false);
        return;
      }
      await addDoc(collection(db, "events", id, "ratings"), {
        userId: currentUser.uid,
        userName: userProfile?.name || "Анонім",
        value,
        createdAt: serverTimestamp(),
      });
      // recalculate avg
      const allRatings = [...ratings, { value }];
      const avg = allRatings.reduce((a, b) => a + b.value, 0) / allRatings.length;
      await updateDoc(doc(db, "events", id), {
        avgRating: parseFloat(avg.toFixed(2)),
        ratingCount: allRatings.length,
      });
      setMyRating(value);
      setRatings([{ userId: currentUser.uid, userName: userProfile?.name, value }, ...ratings]);
      setEvent((prev) => ({ ...prev, avgRating: parseFloat(avg.toFixed(2)), ratingCount: allRatings.length }));
      showToast("Оцінку збережено! ⭐");
    } catch (e) { showToast("Помилка", "error"); }
    setSubmitting(false);
  }

  if (loading) return <div className="spinner-wrap" style={{ marginTop: 120 }}><div className="spinner" /></div>;
  if (!event) return null;

  const dateObj = event.date?.toDate ? event.date.toDate() : new Date(event.date);
  const dateStr = dateObj.toLocaleDateString("uk-UA", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const timeStr = dateObj.toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" });
  const filled = event.registeredCount || 0;
  const pct = Math.min(100, Math.round((filled / (event.capacity || 1)) * 100));

  return (
    <div>
      <div className="page-hero">
        <div className="page-hero-inner">
          <Link to="/events" className="back-link">← Всі події</Link>
          <h1>{event.title}</h1>
          <p>{event.location}</p>
        </div>
      </div>

      <div className="section-inner" style={{ paddingTop: 48, paddingBottom: 80 }}>
        <div className="detail-layout">
          {/* Main content */}
          <div className="detail-main">
            <div className="card">
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", marginBottom: 16 }}>Про подію</h2>
              <p style={{ color: "var(--text-muted)", lineHeight: 1.8 }}>{event.description}</p>
            </div>

            {/* Rating section */}
            <div className="card">
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", marginBottom: 8 }}>
                Рейтинг ініціативи
              </h2>
              <div className="rating-summary">
                <span className="rating-big">{event.avgRating?.toFixed(1) || "—"}</span>
                <div>
                  <div className="stars" style={{ fontSize: "1.4rem" }}>
                    {"★".repeat(Math.round(event.avgRating || 0))}
                    {"☆".repeat(5 - Math.round(event.avgRating || 0))}
                  </div>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                    На основі {event.ratingCount || 0} оцінок
                  </p>
                </div>
              </div>

              {currentUser && !myRating && (
                <div className="rate-widget">
                  <p style={{ fontWeight: 600, marginBottom: 12 }}>Оцініть цю ініціативу:</p>
                  <div className="star-picker">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        className={`star-btn ${s <= (hoverRating || myRating) ? "active" : ""}`}
                        onMouseEnter={() => setHoverRating(s)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => submitRating(s)}
                        disabled={submitting}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {myRating > 0 && (
                <div className="my-rating-badge">
                  ✅ Ваша оцінка: {"★".repeat(myRating)} ({myRating}/5)
                </div>
              )}
              {!currentUser && (
                <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginTop: 12 }}>
                  <Link to="/login" style={{ color: "var(--green)", fontWeight: 600 }}>Увійдіть</Link>, щоб залишити оцінку
                </p>
              )}

              {ratings.length > 0 && (
                <div className="ratings-list">
                  {ratings.slice(0, 5).map((r, i) => (
                    <div key={i} className="rating-item">
                      <div className="rating-user-avatar">{(r.userName || "А")[0]}</div>
                      <div>
                        <strong>{r.userName}</strong>
                        <div className="stars">{"★".repeat(r.value)}{"☆".repeat(5 - r.value)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="detail-sidebar">
            <div className="card register-card">
              <h3 style={{ fontFamily: "var(--font-display)", marginBottom: 20 }}>Реєстрація</h3>
              <div className="sidebar-info">
                <div className="si-row"><span>📅</span><span>{dateStr}</span></div>
                <div className="si-row"><span>⏰</span><span>{timeStr}</span></div>
                <div className="si-row"><span>📍</span><span>{event.location}</span></div>
              </div>

              <div style={{ margin: "20px 0 8px" }}>
                <div className="capacity-bar">
                  <div className="capacity-fill" style={{ width: `${pct}%` }} />
                </div>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: 6 }}>
                  {filled} / {event.capacity} місць заповнено ({pct}%)
                </p>
              </div>

              {!currentUser ? (
                <div>
                  <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: 14 }}>
                    Щоб записатись на подію, необхідно зареєструватись або увійти в акаунт.
                  </p>
                  <Link to="/register" className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginBottom: 10 }}>
                    Зареєструватись →
                  </Link>
                  <Link to="/login" className="btn btn-ghost" style={{ width: "100%", justifyContent: "center" }}>
                    Вже є акаунт? Увійти
                  </Link>
                </div>
              ) : isRegistered ? (
                <div>
                  <div className="registered-badge">✅ Ви записані на цю подію</div>
                  <button
                    className="btn btn-ghost"
                    style={{ width: "100%", justifyContent: "center", marginTop: 12 }}
                    onClick={handleRegister}
                    disabled={submitting}
                  >
                    Скасувати запис
                  </button>
                </div>
              ) : (
                <button
                  className="btn btn-primary"
                  style={{ width: "100%", justifyContent: "center" }}
                  onClick={handleRegister}
                  disabled={submitting || filled >= event.capacity}
                >
                  {filled >= event.capacity ? "Місць немає" : submitting ? "Зачекайте..." : "Записатись на подію →"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}
