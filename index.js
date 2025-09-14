// Saare bot tokens (jitne bhi ho daal lo)
const BOT_TOKENS = [
  "7359050310:AAFzewWEBpS5XUyF2x5RYcovgNNSYSfAMKA",
  "7954292419:AAH7XtlSRtNIFMVQoS6PJ9ST2QqSC17x_j4",
  "8458550542:AAFXEaZ_PbgR6D3zi3eBWoZPME4YAJ6FWPY",
  "8224562338:AAFPur0Wgg5RJcNKupfyhN01sNX0rDt8Lbs",
  "7562635485:AAFHoQq51MzIvRyL4PGPq6r8EHibmrpJHzw",
  "8057181584:AAEKvtV85uZwUmY3BX0gHlOJsr9uC7nU410",
  "7681907786:AAE67X6xIZHobYcKrkkk7zvF45peaRyOAnk"
];

// ✅ Sirf ye hi emojis allowed
const EMOJIS = ["❤️", "👍", "🔥", "😍", "🥰", "👏", "💋", "🏆", "🤑"];

// Random emoji picker
function getRandomEmoji() {
  return EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
}

export default {
  async fetch(request, env, ctx) {
    if (request.method === "POST") {
      try {
        const update = await request.json();

        // Group / Channel / DM detect
        const msg = update.message || update.channel_post || null;

        if (msg) {
          const chatId = msg.chat.id;
          const msgId = msg.message_id;

          // Har bot ke liye random emoji select karo
          await Promise.all(
            BOT_TOKENS.map(async (token, i) => {
              const emoji = getRandomEmoji();
              try {
                const res = await fetch(
                  `https://api.telegram.org/bot${token}/setMessageReaction`,
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      chat_id: chatId,
                      message_id: msgId,
                      reaction: [{ type: "emoji", emoji }]
                    })
                  }
                );
                if (!res.ok) {
                  console.error(`❌ Bot ${i + 1} failed:`, await res.text());
                }
              } catch (err) {
                console.error(`⚠️ Bot ${i + 1} error:`, err);
              }
            })
          );

          return new Response("✅ Random reactions sent!");
        }

        return new Response("ℹ️ No valid message found.");
      } catch (err) {
        return new Response("❌ Error parsing update: " + err.message, { status: 400 });
      }
    }

    return new Response("⚡ Worker active!");
  }
};
