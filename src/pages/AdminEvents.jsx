import { useState, useEffect } from "react";
import { db } from "../firebase/config";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp } from "firebase/firestore";
import "./Events.css"; 

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [formData, setFormData] = useState({ title: "", description: "", category: "Екологія", location: "", date: "" });
  const [editingId, setEditingId] = useState(null);

  const eventsCol = collection(db, "events");

  // Завантаження подій
  const loadEvents = async () => {
    const snap = await getDocs(eventsCol);
    setEvents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => { loadEvents(); }, []);

  // Додавання або Оновлення
  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { ...formData, date: Timestamp.fromDate(new Date(formData.date)), registeredUsers: formData.registeredUsers || [] };

    if (editingId) {
      await updateDoc(doc(db, "events", editingId), data);
      setEditingId(null);
    } else {
      await addDoc(eventsCol, data);
    }
    setFormData({ title: "", description: "", category: "Екологія", location: "", date: "" });
    loadEvents();
  };

  // Видалення
  const handleDelete = async (id) => {
    if (window.confirm("Видалити цю подію?")) {
      await deleteDoc(doc(db, "events", id));
      loadEvents();
    }
  };

  // Підготовка до редагування
  const startEdit = (event) => {
    setEditingId(event.id);
    setFormData({
      title: event.title,
      description: event.description,
      category: event.category,
      location: event.location,
      date: event.date?.toDate ? event.date.toDate().toISOString().slice(0, 16) : ""
    });
  };

  return (
    <div className="section-inner" style={{paddingTop: '100px'}}>
      <h2>{editingId ? "📝 Редагувати подію" : "➕ Створити нову подію"}</h2>
      
      <form onSubmit={handleSubmit} className="admin-form" style={{display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '500px', marginBottom: '40px'}}>
        <input type="text" placeholder="Назва" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required className="form-input"/>
        <textarea placeholder="Опис" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required className="form-input"/>
        <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="form-input">
          <option>Екологія</option>
          <option>Тварини</option>
          <option>Соціальне</option>
          <option>Освіта</option>
        </select>
        <input type="text" placeholder="Локація" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="form-input"/>
        <input type="datetime-local" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required className="form-input"/>
        <button type="submit" className="btn btn-primary">{editingId ? "Зберегти зміни" : "Опублікувати"}</button>
        {editingId && <button onClick={() => setEditingId(null)} className="btn">Скасувати</button>}
      </form>

      <hr />

      <h3>Управління існуючими подіями</h3>
      <div className="admin-events-list">
        {events.map(event => (
          <div key={event.id} style={{display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #ddd'}}>
            <span>{event.title}</span>
            <div>
              <button onClick={() => startEdit(event)} className="btn btn-small">✏️</button>
              <button onClick={() => handleDelete(event.id)} className="btn btn-small" style={{color: 'red'}}>🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}