import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // 1. Додали імпорт
import { initialEvents } from "../data/events.js";

const firebaseConfig = {
  apiKey: "AIzaSyAB-kBSfVaeJVqQIb46SHuFdIEyyvHw4Y4",
  authDomain: "volunteerhub-67d5d.firebaseapp.com",
  projectId: "volunteerhub-67d5d",
  storageBucket: "volunteerhub-67d5d.firebasestorage.app",
  messagingSenderId: "650989766516",
  appId: "1:650989766516:web:9263fc8bac10006b0f4e21",
  measurementId: "G-9L7E8FF1VW"
};

// Ініціалізація
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app); // 2. СТВОРИЛИ ЗМІННУ (цього бракувало)

// Функція заповнення бази
async function seedDatabase() {
  try {
    const eventsCol = collection(db, 'events');
    const snapshot = await getDocs(eventsCol);

    if (snapshot.empty) {
      console.log("Починаю завантаження 10 подій...");
      
      // Використовуємо звичайний цикл для надійності
      for (const event of initialEvents) {
        const docRef = await addDoc(eventsCol, event);
        console.log(`Додано подію з ID: ${docRef.id}`);
      }
      
      console.log("Всі дані успішно завантажено!");
    } else {
      console.log("База не порожня, пропускаю завантаження.");
    }
  } catch (error) {
    console.error("Помилка під час завантаження:", error);
  }
}

seedDatabase();

// 3. ЕКСПОРТУЄМО ОБИДВІ ЗМІННІ
export { db, auth };