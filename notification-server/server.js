const express = require("express");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://YOUR_PROJECT_ID.firebaseio.com"
});

const db = admin.firestore();
const app = express();
app.use(bodyParser.json());

// Send notification by userId
app.post("/send", async (req, res) => {
  const { userId, title, body } = req.body;

  if (!userId || !title || !body) {
    return res.status(400).send({ success: false, message: "Missing fields" });
  }

  try {
    const userDoc = await db.collection("users").doc(userId).get();
    const token = userDoc.data()?.fcmToken;

    if (!token) {
      return res.status(404).send({ success: false, message: "No token found" });
    }

    const message = {
      notification: { title, body },
      token
    };

    await admin.messaging().send(message);
    res.status(200).send({ success: true, message: "Notification sent" });
  } catch (error) {
    console.error("❌ Error sending:", error);
    res.status(500).send({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Notification server running on port ${PORT}`));
