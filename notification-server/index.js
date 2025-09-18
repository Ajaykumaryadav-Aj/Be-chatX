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
import cors from "cors";

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Load Firebase credentials from environment variable
let serviceAccount;
try {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  console.log("✅ Loaded Firebase service account from env");
} catch (err) {
  console.error("❌ Missing or invalid Firebase service account:", err);
  process.exit(1);
}

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Root route for health check
app.get("/", (req, res) => {
  res.send("Notification server running!");
});

// POST /send route to send FCM notifications
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
    return res.status(200).send({ success: true, message: "Notification sent" });
  } catch (error) {
    console.error("❌ Error sending notification:", error);
    return res.status(500).send({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
