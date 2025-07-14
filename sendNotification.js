const admin = require('./firebase');

async function sendSlotAlertNotification(text) {
    const message = {
        token: process.env.FCM_TOKEN,
        data: {
            title: 'Visa Slot Found!',
            body: text,
            type: 'slot_alert'
        },
        android: { priority: "high" },
        apns: {
            payload: {
                aps: {
                    contentAvailable: true
                }
            }
        }
    };

    try {
        const response = await admin.messaging().send(message);
        console.log("✅ FCM Notification sent:", response);
    } catch (error) {
        console.error("❌ Error sending FCM:", error);
    }
}

module.exports = { sendSlotAlertNotification };
