// src/services/SafetyCheckInService.ts
import { Timestamp, addDoc, collection, doc, getDoc, getDocs, limit, orderBy, query, updateDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";

export const SafetyCheckInService = {
  checkIn: async (question?: string, answer?: string) => {
    const user = auth.currentUser;
    if (!user) throw new Error("Not authenticated");

    await addDoc(collection(db, "users", user.uid, "safetyCheckIns"), {
      timestamp: Timestamp.now(),
      status: "ok",
      question: question || "",
      answer: answer || ""
    });
  },

  getHistory: async (limitCount = 10) => {
    const user = auth.currentUser;
    if (!user) return [];

    const q = query(
      collection(db, "users", user.uid, "safetyCheckIns"),
      orderBy("timestamp", "desc"),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  getSettings: async () => {
    const user = auth.currentUser;
    if (!user) return {};

    const docSnap = await getDoc(doc(db, "users", user.uid));
    return docSnap.data()?.safetySettings || {};
  },

  updateSettings: async (settings: any) => {
    const user = auth.currentUser;
    if (!user) throw new Error("Not authenticated");

    await updateDoc(doc(db, "users", user.uid), {
      safetySettings: settings
    });
  }
};
