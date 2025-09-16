const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.sendPushNotification = functions.firestore
    .document("messages/{messageId}") // Firestore collection where messages are stored
    .onCreate(async (snapshot) => {
      const messageData = snapshot.data();
      const recipientToken = messageData.recipientToken; // FCM token of recipient
      const senderName = messageData.senderName;
      const messageText = messageData.text;

      const payload = {
        notification: {
          title: `${senderName} sent you a message`,
          body: messageText,
        },
      };

      try {
        await admin.messaging().sendToDevice(recipientToken, payload);
        console.log("Notification sent successfully!");
      } catch (error) {
        console.error("Error sending notification:", error);
      }
    });
