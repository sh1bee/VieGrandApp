// src/services/MedicineService.ts
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";

export const MedicineService = {
  // 1. Thêm thuốc mới cho một người già cụ thể
  addMedicine: async (elderlyUid: string, data: any) => {
    try {
      const colRef = collection(db, "users", elderlyUid, "medications");
      await addDoc(colRef, {
        ...data,
        status: "active", // Mặc định là đang dùng
        compliance: 100, // Tuân thủ ban đầu 100%
        createdAt: serverTimestamp(),
      });
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  },

  // 2. Lấy danh sách thuốc (Real-time)
  subscribeMedicines: (elderlyUid: string, callback: (data: any[]) => void) => {
    const colRef = collection(db, "users", elderlyUid, "medications");
    const q = query(colRef, orderBy("createdAt", "desc"));

    return onSnapshot(q, (snapshot) => {
      const meds = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      callback(meds);
    });
  },
  deleteMedicine: async (elderlyUid: string, medicineId: string) => {
    try {
      // Trỏ đúng tới document của thuốc đó và xóa
      await deleteDoc(doc(db, "users", elderlyUid, "medications", medicineId));
      return true;
    } catch (e) {
      console.error("Lỗi xóa thuốc:", e);
      return false;
    }
  },
};
