// const functions = require("firebase-functions");
// const admin = require("firebase-admin");

// admin.initializeApp();

// exports.sendPushNotification = functions.firestore
//     .document("messages/{messageId}") // Firestore collection where messages are stored
//     .onCreate(async (snapshot) => {
//       const messageData = snapshot.data();
//       const recipientToken = messageData.recipientToken; // FCM token of recipient
//       const senderName = messageData.senderName;
//       const messageText = messageData.text;

//       const payload = {
//         notification: {
//           title: `${senderName} sent you a message`,
//           body: messageText,
//         },
//       };

//       try {
//         await admin.messaging().sendToDevice(recipientToken, payload);
//         console.log("Notification sent successfully!");
//       } catch (error) {
//         console.error("Error sending notification:", error);
//       }
//     });



const express = require("express");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");

// initialize Firebase Admin SDK
const serviceAccount = require("./serviceAccountKey.json"); // download from Firebase Console
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const app = express();
app.use(bodyParser.json());

// send notification endpoint
app.post("/send", async (req, res) => {
  const { token, title, body } = req.body;

  const message = {
    notification: { title, body },
    token: token
  };

  try {
    await admin.messaging().send(message);
    res.status(200).send({ success: true, message: "Notification sent" });
  } catch (error) {
    res.status(500).send({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
