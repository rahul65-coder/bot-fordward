export default {
  async scheduled(event, env, ctx) {
    try {
      // 1️⃣ Fetch API with headers
      const apiUrl = "https://draw.ar-lottery01.com/WinGo/WinGo_1M/GetHistoryIssuePage.json";
      const res = await fetch(apiUrl, {
        headers: {
          "Accept": "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          "Referer": "https://draw.ar-lottery01.com/"
        }
      });

      if (!res.ok) throw new Error(`API fetch failed: ${res.status}`);

      const json = await res.json();
      if (!json?.data?.list) throw new Error("API returned no data.list");

      // 2️⃣ Get current Firebase data to prevent duplicates
      const firebaseUrl = "https://web-admin-e297c-default-rtdb.asia-southeast1.firebasedatabase.app/Lottery.json";
      const fbRes = await fetch(firebaseUrl);
      const existingData = fbRes.ok ? await fbRes.json() : {};

      const lotteryDataToSave = {};
      let newCount = 0;

      json.data.list.forEach(item => {
        const issueNumber = item.issueNumber;

        // Skip if already exists
        if (existingData && existingData[issueNumber]) return;

        lotteryDataToSave[issueNumber] = {
          type: Number(item.number) >= 5 ? "big" : "small",
          colour: item.color,
          number: Number(item.number)
        };
        newCount++;
      });

      if (newCount === 0) {
        console.log("No new lottery results to save ✅");
        return new Response("No new results", { status: 200 });
      }

      // 3️⃣ Save new results to Firebase
      const saveRes = await fetch(firebaseUrl, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lotteryDataToSave)
      });

      if (!saveRes.ok) throw new Error(`Failed saving to Firebase: ${saveRes.status}`);

      console.log(`✅ Successfully saved ${newCount} new lottery results`);

      return new Response(`Saved ${newCount} new results`, { status: 200 });

    } catch (err) {
      console.error("❌ Error in scheduled worker:", err);
      return new Response(`Error: ${err.message}`, { status: 500 });
    }
  }
};
