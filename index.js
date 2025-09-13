export default {
  async fetch(request) {
    try {
      const apiUrl = "https://draw.ar-lottery01.com/WinGo/WinGo_1M/GetHistoryIssuePage.json";
      const res = await fetch(apiUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          "Accept": "application/json, text/plain, */*",
          "Referer": "https://draw.ar-lottery01.com/",
          "Origin": "https://draw.ar-lottery01.com"
        }
      });

      if (!res.ok) throw `API request failed with status ${res.status}`;
      const data = await res.json();

      const list = data?.data?.list;
      if (!Array.isArray(list) || list.length === 0) {
        throw "API returned no results (data.list empty)";
      }

      // 🔥 Firebase Realtime DB base
      const firebaseBase = `https://web-admin-e297c-default-rtdb.asia-southeast1.firebasedatabase.app/satta.json`;
      const fbGet = await fetch(firebaseBase);
      const existing = fbGet.ok ? await fbGet.json() : {};

      let logs = [];
      let savedCount = 0, skippedCount = 0;

      for (let item of list.slice(0, 10)) {
        const issue = String(item.issueNumber);
        const number = parseInt(item.number, 10);
        const type = number <= 4 ? "SMALL" : "BIG";
        const timestamp = new Date().toISOString();

        if (existing && existing[issue]) {
          skippedCount++;
          logs.push({ issue, status: "skipped" });
          continue;
        }

        const fbUrl = `https://web-admin-e297c-default-rtdb.asia-southeast1.firebasedatabase.app/satta/${issue}.json`;
        const fbRes = await fetch(fbUrl, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            result_number: number,
            type,
            timestamp
          })
        });

        if (fbRes.ok) {
          savedCount++;
          logs.push({ issue, status: "saved" });
        } else {
          logs.push({ issue, status: "error", reason: fbRes.status });
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: "Sync done",
          summary: { saved: savedCount, skipped: skippedCount },
          logs
        }, null, 2),
        { headers: { "Content-Type": "application/json" } }
      );

    } catch (err) {
      return new Response(
        JSON.stringify({ success: false, error: err.toString() }, null, 2),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }
};
