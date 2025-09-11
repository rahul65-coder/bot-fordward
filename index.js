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

      // Save user
      await fetch(`${firebaseURL}/Users/${userId}.json`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(true)
      });

      // Get all movies
      const moviesRes = await fetch(`${firebaseURL}/Movies.json`);
      const movies = await moviesRes.json() || {};

      for (const title of Object.keys(movies)) {
        for (const quality of Object.keys(movies[title])) {
          const movie = movies[title][quality];
          const key = `${title}-${quality}`;

          // Check already sent
          const sentRes = await fetch(`${firebaseURL}/Sent/${userId}/${key}.json`);
          const alreadySent = await sentRes.json();

          if (!alreadySent) {
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

            // Mark as sent
            await fetch(`${firebaseURL}/Sent/${userId}/${key}.json`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(true)
            });
          }
        }
      }

      return new Response("ok");
    }

    return new Response("ok");
  }
}
