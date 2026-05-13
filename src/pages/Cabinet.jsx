import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import EventCard from "../components/EventCard";
import "./Cabinet.css";

export default function Cabinet() {
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) { navigate("/register"); return; }
    async function load() {
      const ids = userProfile?.registeredEvents || [];
      const fetched = await Promise.all(
        ids.map(async (id) => {
          const snap = await getDoc(doc(db, "events", id));
          return snap.exists() ? { id: snap.id, ...snap.data() } : null;
        })
      );
      setMyEvents(fetched.filter(Boolean));
      setLoading(false);
    }
    load();
  }, [currentUser, userProfile]);

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  if (!currentUser) return null;

  const initials = (userProfile?.name || currentUser.email).slice(0, 2).toUpperCase();

  return (
    <div>
      <div className="page-hero">
        <div className="page-hero-inner cabinet-hero">
          <div className="cabinet-avatar">{initials}</div>
          <div>
            <h1>{userProfile?.name || "Волонтер"}</h1>
            <p>{currentUser.email}</p>
          </div>
        </div>
      </div>

      <div className="section-inner" style={{ paddingTop: 48, paddingBottom: 80 }}>
        <div className="cabinet-layout">
          {/* Sidebar info */}
          <div className="cabinet-sidebar">
            <div className="card profile-card">
              <div className="profile-avatar-lg">{initials}</div>
              <h3 className="profile-name">{userProfile?.name || "Волонтер"}</h3>
              <p className="profile-email">{currentUser.email}</p>
              <div className="profile-stats">
                <div className="ps-item">
                  <span className="ps-num">{myEvents.length}</span>
                  <span className="ps-label">Подій</span>
                </div>
              </div>
              <div className="profile-joined">
                📅 Долучився: {userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString("uk-UA", { day: "numeric", month: "long", year: "numeric" }) : "—"}
              </div>
              <button
                className="btn btn-ghost"
                style={{ width: "100%", justifyContent: "center", marginTop: 16 }}
                onClick={handleLogout}
              >
                Вийти з акаунту
              </button>
            </div>
          </div>

          {/* Main */}
          <div className="cabinet-main">
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem", marginBottom: 24 }}>
              🗓️ Мої зареєстровані події
            </h2>
            {loading ? (
              <div className="spinner-wrap"><div className="spinner" /></div>
            ) : myEvents.length ? (
              <div className="grid-2">
                {myEvents.map((e) => <EventCard key={e.id} event={e} />)}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">🌱</div>
                <h3>Ви ще не записані на жодну подію</h3>
                <p>Перегляньте список подій та знайдіть щось до душі</p>
                <br />
                <a href="/events" className="btn btn-primary">Переглянути події →</a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
