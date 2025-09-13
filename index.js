export default {
  async fetch(request) {
    try {
      // 1️⃣ Fetch API
      const apiUrl = "https://draw.ar-lottery01.com/WinGo/WinGo_1M.json";
      const res = await fetch(apiUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Accept": "application/json"
        }
      });

      if (!res.ok) throw `API request failed with status ${res.status}`;
      const data = await res.json();

      // ✅ Always use data.list
      const list = data?.data?.list;
      if (!Array.isArray(list) || list.length === 0) {
        throw "No results in API (data.list empty)";
      }

      // 2️⃣ Get existing data from Firebase
      const firebaseBase = `https://web-admin-e297c-default-rtdb.asia-southeast1.firebasedatabase.app/Api.json`;
      const fbGet = await fetch(firebaseBase);
      const existing = fbGet.ok ? await fbGet.json() : {};

      let logs = [];
      let savedCount = 0;
      let skippedCount = 0;
      let errorCount = 0;

      // 3️⃣ Process latest 10 results
      for (let item of list.slice(0, 10)) {
        const issueNumber = item.issueNumber;
        if (!issueNumber) continue;

        try {
          if (existing && existing[issueNumber]) {
            skippedCount++;
            logs.push({ issueNumber, status: "skipped", reason: "Already exists in Firebase" });
            continue;
          }

          const number = parseInt(item.number, 10);
          const type = number <= 4 ? "small" : "big";

          const result = {
            issueNumber,
            number,
            color: item.color,
            type,
            premium: item.premium,
            sum: item.sum
          };

          // Save in Firebase
          const fbUrl = `https://web-admin-e297c-default-rtdb.asia-southeast1.firebasedatabase.app/Api/${issueNumber}.json`;
          const fbRes = await fetch(fbUrl, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(result)
          });

          if (!fbRes.ok) {
            errorCount++;
            logs.push({ issueNumber, status: "error", reason: `Firebase save failed (${fbRes.status})` });
          } else {
            savedCount++;
            logs.push({ issueNumber, status: "saved" });
          }
        } catch (err) {
          errorCount++;
          logs.push({ issueNumber, status: "error", reason: err.toString() });
        }
      }

      // 4️⃣ Response with detailed log
      return new Response(
        JSON.stringify({
          success: true,
          message: "Data sync completed",
          summary: { saved: savedCount, skipped: skippedCount, errors: errorCount },
          logCenter: logs
        }, null, 2),
        { headers: { "Content-Type": "application/json" } }
      );

    } catch (err) {
      return new Response(
        JSON.stringify({
          success: false,
          error: err.toString(),
          logCenter: [{ status: "fatal", reason: err.toString() }]
        }, null, 2),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }
};
