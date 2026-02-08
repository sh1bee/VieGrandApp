const express = require("express");
const admin = require("firebase-admin");
const cron = require("node-cron");
const bodyParser = require("body-parser");

// 1. Kết nối Firebase bằng chìa khóa bạn vừa tải
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const app = express();
app.use(bodyParser.json());

// --- API: NHẬN YÊU CẦU GỬI THÔNG BÁO TỪ APP ---
// App người thân sẽ gọi vào đây khi gửi tin nhắn
app.post("/send-notification", async (req, res) => {
  try {
    const { userId, title, body, data } = req.body;

    // Lấy token của người nhận từ Firestore
    const userDoc = await db.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      return res.status(404).send("User not found");
    }

    const userData = userDoc.data();
    // Giả sử bạn lưu token trong trường 'pushToken' (hoặc fcmTokens)
    const pushToken = userData.pushToken;

    if (!pushToken) {
      return res.status(200).send("User has no push token");
    }

    // Gửi thông báo qua FCM
    await admin.messaging().send({
      token: pushToken,
      notification: {
        title: title,
        body: body,
      },
      data: data || {}, // Dữ liệu kèm theo (ví dụ để nhảy trang)
    });

    console.log(`>>> Đã gửi thông báo tới ${userId}`);
    res.status(200).send({ success: true });
  } catch (error) {
    console.error("Lỗi gửi thông báo:", error);
    res.status(500).send({ error: error.message });
  }
});

// --- CRON JOB: TỰ ĐỘNG QUÉT NGƯỜI GIÀ KHÔNG ONLINE ---
// Chạy mỗi 8h sáng hàng ngày (0 8 * * *)
cron.schedule("0 8 * * *", async () => {
  console.log("--- BẮT ĐẦU QUÉT NGƯỜI DÙNG INACTIVE ---");
  const now = new Date();
  const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

  const snapshot = await db
    .collection("users")
    .where("role", "==", "elder")
    .get();

  if (snapshot.empty) {
    console.log("Không có người già nào trong hệ thống.");
    return;
  }

  for (const doc of snapshot.docs) {
    const elderData = doc.data();
    const lastLogin = elderData.lastLoginAt?.toDate();

    if (!lastLogin || lastLogin < twoDaysAgo) {
      console.log(`⚠️ Cảnh báo: ${elderData.name} (${doc.id}) không online 2 ngày.`);

      // Lấy danh sách người thân
      const familyMembers = elderData.familyMembers || [];

      if (familyMembers.length === 0) {
        console.log(`   → Không có người thân nào để thông báo.`);
        continue;
      }

      // Gửi thông báo cho từng người thân
      for (const relativeId of familyMembers) {
        try {
          const relativeDoc = await db.collection("users").doc(relativeId).get();
          if (!relativeDoc.exists) continue;

          const relativeData = relativeDoc.data();
          const tokens = relativeData.fcmTokens || [];

          if (tokens.length === 0) {
            console.log(`   → Người thân ${relativeData.name} không có token.`);
            continue;
          }

          // Gửi thông báo qua FCM
          for (const token of tokens) {
            try {
              await admin.messaging().send({
                token: token,
                notification: {
                  title: "⚠️ Cảnh báo người thân",
                  body: `${elderData.name} đã không hoạt động trên 2 ngày. Vui lòng kiểm tra!`,
                },
                data: {
                  type: "elderly_inactive",
                  elderId: doc.id,
                  elderName: elderData.name,
                },
              });
              console.log(`   ✅ Đã gửi thông báo cho ${relativeData.name}`);
            } catch (err) {
              console.log(`   ❌ Lỗi gửi token: ${err.message}`);
            }
          }

          // Lưu vào notifications collection
          await db.collection("users").doc(relativeId).collection("notifications").add({
            title: "⚠️ Cảnh báo người thân",
            body: `${elderData.name} đã không hoạt động trên 2 ngày. Vui lòng kiểm tra!`,
            type: "elderly_inactive",
            elderId: doc.id,
            isRead: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        } catch (error) {
          console.error(`   ❌ Lỗi xử lý người thân:`, error.message);
        }
      }
    }
  }
  console.log("--- KẾT THÚC QUÉT ---");
});

// Mở cổng 3000 để App kết nối
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`SERVER ĐANG CHẠY TẠI PORT ${PORT}`);
});
