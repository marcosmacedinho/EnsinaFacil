const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

const db = admin.firestore();

// Função agendada para rodar todos os dias à meia-noite (horário de São Paulo)
exports.deleteOldAccessLogs = functions.pubsub.schedule("every day 00:00")
    .timeZone("America/Sao_Paulo")
    .onRun(async (context) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Início do dia atual
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1); // Início do dia anterior

      const yesterdayTimestamp = admin.firestore.Timestamp.fromDate(yesterday);

      const accessLogsRef = db.collection("access_logs");
      const query = accessLogsRef.where("accessedAt", "<", yesterdayTimestamp);

      try {
        const snapshot = await query.get();
        const batch = db.batch();

        snapshot.forEach((doc) => {
          batch.delete(doc.ref);
        });

        await batch.commit();
        console.log(`Deleted ${snapshot.size} access log(s).`);
      } catch (error) {
        console.error("Error deleting old access logs:", error);
      }

      return null;
    });
