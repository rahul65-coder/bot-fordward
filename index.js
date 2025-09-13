export default {
  async fetch(request) {
    try {
      // 1️⃣ Fetch the API
      const apiUrl = "https://draw.ar-lottery01.com/WinGo/WinGo_1M.json";
      const res = await fetch(apiUrl, {
        headers: { "User-Agent": "Mozilla/5.0" }
      });

      if (!res.ok) throw `API request failed with status ${res.status}`;

      const data = await res.json();
      const issueNumber = data?.current?.issueNumber;
      if (!issueNumber) throw "Issue number not found in API response";

      // 2️⃣ Map numbers 0–9 with type, colour, period, number
      const numbers = {};
      const colourPattern = ["red", "green"];
      for (let i = 0; i <= 9; i++) {
        const type = i <= 4 ? "small" : "big";
        const colourIndex = i % 2;
        numbers[i] = {
          period: i,
          type: type,
          number: i,
          colour: colourPattern[colourIndex]
        };
      }

      // 3️⃣ Save to Firebase Realtime Database via REST API
      const firebaseUrl = `https://web-admin-e297c-default-rtdb.asia-southeast1.firebasedatabase.app/Api/${issueNumber}.json`;
      const fbRes = await fetch(firebaseUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(numbers)
      });

      if (!fbRes.ok) throw `Firebase save failed with status ${fbRes.status}`;

      // ✅ Success response
      return new Response(JSON.stringify({ success: true, issueNumber }), {
        headers: { "Content-Type": "application/json" }
      });

    } catch (err) {
      // ⚠️ Log full error
      console.error("Worker error:", err);

      // Return error in response for visibility
      return new Response(JSON.stringify({
        success: false,
        error: err.toString(),
        stack: err.stack || null
      }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
};
