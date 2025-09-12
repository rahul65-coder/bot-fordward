export default {
  async fetch(request, env) {
    const BOT_TOKEN = "8415169170:AAEAiOeu5vZj8tX9dfvWohZ-T20vyfnLNvE";
    const API_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;
    const FIREBASE_URL = "https://web-admin-e297c-default-rtdb.asia-southeast1.firebasedatabase.app";

    if (request.method === "POST") {
      const update = await request.json();

      if (update.message) {
        const chatId = update.message.chat.id;
        const text = update.message.text?.toLowerCase();

        if (text === "/start") {
          // Firebase se Movies laao
          const res = await fetch(`${FIREBASE_URL}/Movies.json`);
          const movies = await res.json();

          if (movies) {
            let sentSet = new Set();

            for (const title in movies) {
              for (const quality in movies[title]) {
                const movie = movies[title][quality];

                const uniqueKey = movie.chat_id + "_" + movie.message_id;
                if (sentSet.has(uniqueKey)) continue;

                // Forward karo
                await fetch(`${API_URL}/forwardMessage`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    chat_id: chatId,
                    from_chat_id: movie.chat_id,
                    message_id: movie.message_id
                  })
                });

                sentSet.add(uniqueKey);
              }
            }

            // Done message
            await fetch(`${API_URL}/sendMessage`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chat_id: chatId,
                text: "✅ Sab movies forward ho gayi!"
              })
            });
          } else {
            await fetch(`${API_URL}/sendMessage`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chat_id: chatId,
                text: "⚠️ Database khali hai."
              })
            });
          }
        }
      }
      return new Response("ok");
    }

    return new Response("Forward Bot Running ✅");
  }
}
