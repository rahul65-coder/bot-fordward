export default {
  async fetch(request, env, ctx) {
    if (request.method !== "POST") {
      return new Response("Forward Bot Running!");
    }

    const update = await request.json();
    const BOT_TOKEN = "8415169170:AAEAiOeu5vZj8tX9dfvWohZ-T20vyfnLNvE";
    const firebaseURL = "https://web-admin-e297c-default-rtdb.asia-southeast1.firebasedatabase.app";

    // ----------------- USER START -----------------
    if (update.message && update.message.text === "/start") {
      const userId = update.message.chat.id;

      // Get all movies
      const moviesRes = await fetch(`${firebaseURL}/Movies.json`);
      const movies = await moviesRes.json() || {};

      for (const title of Object.keys(movies)) {
        const qualities = movies[title];

        for (const quality of Object.keys(qualities)) {
          const movie = qualities[quality];

          if (movie.chat_id && movie.message_id) {
            // Forward movie
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/forwardMessage`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chat_id: userId,
                from_chat_id: movie.chat_id,
                message_id: movie.message_id
              })
            });

            // Delay to avoid flood limit
            await new Promise(r => setTimeout(r, 1000));
          }
        }
      }

      // Send confirmation
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: userId,
          text: "✅ Sab movies forward ho gayi!"
        })
      });

      return new Response("ok");
    }

    return new Response("ok");
  }
}
