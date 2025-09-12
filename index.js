export default {
  async fetch(request, env, ctx) {
    if (request.method !== "POST") {
      return new Response("Forward Bot Running!");
    }

    const update = await request.json();
    const BOT_TOKEN = "8415169170:AAEAiOeu5vZj8tX9dfvWohZ-T20vyfnLNvE";

    if (update.message && update.message.text === "/start") {
      const userId = update.message.chat.id;

      // Debug ek movie
      const movie = {
        chat_id: "-10030400062103", // Group ka chat_id
        message_id: 44              // Test message id
      };

      const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/forwardMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: userId,
          from_chat_id: movie.chat_id,
          message_id: movie.message_id
        })
      });

      // Telegram ka actual reply
      const text = await res.text();
      return new Response(text, { status: 200 });
    }

    return new Response("ok");
  }
}
