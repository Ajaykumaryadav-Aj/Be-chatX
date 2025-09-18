// const express = require("express");
// const bodyParser = require("body-parser");
// const admin = require("firebase-admin");

// const serviceAccount = require("./serviceAccountKey.json");

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: "https://YOUR_PROJECT_ID.firebaseio.com"
// });

// const db = admin.firestore();
// const app = express();   // declare app here

// app.use(bodyParser.json());

// // Send notification by userId or token
// app.post("/send", async (req, res) => {
//   console.log("📩 Incoming body:", req.body);

//   const { userId, token, title, body } = req.body;

//   if ((!userId && !token) || !title || !body) {
//     return res.status(400).send({ success: false, message: "Missing fields" });
//   }

//   try {
//     let targetToken = token;

//     if (userId && !token) {
//       const userDoc = await db.collection("users").doc(userId).get();
//       targetToken = userDoc.data()?.fcmToken;
//     }

//     if (!targetToken) {
//       return res.status(404).send({ success: false, message: "No token found" });
//     }

//     const message = {
//       notification: { title, body },
//       token: targetToken,
//     };

//     await admin.messaging().send(message);
//     res.status(200).send({ success: true, message: "Notification sent" });
//   } catch (error) {
//     console.error("❌ Error sending:", error);
//     res.status(500).send({ success: false, error: error.message });
//   }
// });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => console.log(`🚀 Notification server running on port ${PORT}`));



import express from "express";
import bodyParser from "body-parser";
import admin from "firebase-admin";
import fs from "fs";

let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    console.log("✅ Loaded Firebase service account from ENV");
  } catch (err) {
    console.error("❌ Failed to parse FIREBASE_SERVICE_ACCOUNT env", err);
    process.exit(1);
  }
} else {
  try {
    serviceAccount = JSON.parse(
      fs.readFileSync("./firebase-service-account.json", "utf8")
    );
    console.log("✅ Loaded Firebase service account from file");
  } catch (err) {
    console.error("❌ Missing firebase-service-account.json locally", err);
    process.exit(1);
  }
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send({ success: true, message: "Notification server running 🚀" });
});

// Send notification with raw token
app.post("/send", async (req, res) => {
  const { token, title, body } = req.body;

  if (!token || !title || !body) {
    return res.status(400).send({ success: false, message: "Missing fields" });
  }

  const message = {
    notification: { title, body },
    token,
  };

  try {
    await admin.messaging().send(message);
    res.status(200).send({ success: true, message: "Notification sent" });
  } catch (error) {
    console.error("❌ Error sending notification:", error);
    res.status(500).send({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`🚀 Notification server running on port ${PORT}`)
);
