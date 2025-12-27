import { Ai } from '@cloudflare/ai';

export interface Env {
  AI: any;
  DB: D1Database;
}

// --- 1. THE FRONTEND UI (HTML/CSS/JS) ---
const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>InsightFlow | AI Analytics</title>
  <style>
    :root { --primary: #F48120; --bg: #0d0d0d; --card: #1a1a1a; --text: #e0e0e0; }
    body { font-family: 'Inter', sans-serif; background: var(--bg); color: var(--text); margin: 0; display: flex; flex-direction: column; align-items: center; min-height: 100vh; }
    .container { width: 90%; max-width: 800px; margin-top: 50px; }
    h1 { font-size: 2.5rem; font-weight: 700; margin-bottom: 10px; text-align: center; }
    h1 span { color: var(--primary); }
    .search-box { display: flex; gap: 10px; margin-bottom: 30px; }
    input { flex: 1; padding: 15px; border-radius: 8px; border: 1px solid #333; background: var(--card); color: white; font-size: 1rem; outline: none; transition: 0.2s; }
    input:focus { border-color: var(--primary); }
    button { padding: 15px 30px; border-radius: 8px; border: none; background: var(--primary); color: white; font-weight: bold; cursor: pointer; transition: 0.2s; }
    button:hover { opacity: 0.9; transform: translateY(-1px); }
    
    /* Results Area */
    #result-area { display: none; background: var(--card); padding: 25px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.5); }
    .tag { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: bold; margin-bottom: 15px; }
    .tag.sql { background: #2d3748; color: #a0aec0; }
    .tag.pred { background: #2c0b0e; color: #f56565; }
    
    /* Table Styling */
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #333; }
    th { color: var(--primary); font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; }
    
    /* Forecast Styling */
    .metric { font-size: 3rem; font-weight: 800; margin: 10px 0; }
    .trend { font-size: 1.2rem; color: #48bb78; }
    
    .loading { text-align: center; color: #666; margin-top: 20px; display: none; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Insight<span>Flow</span></h1>
    <p style="text-align: center; color: #888; margin-bottom: 40px;">Serverless NL2SQL & Predictive Analytics Agent</p>
    
    <div class="search-box">
      <input type="text" id="query" placeholder="Ask about sales, revenue, or forecast..." value="What are the top 3 products by revenue?" onkeydown="if(event.key==='Enter') runQuery()">
      <button onclick="runQuery()">Analyze</button>
    </div>

    <div class="loading" id="loader">Processing w/ Llama 3 & D1...</div>

    <div id="result-area">
      <div id="content"></div>
    </div>
  </div>

  <script>
    async function runQuery() {
      const query = document.getElementById('query').value;
      const loader = document.getElementById('loader');
      const resultArea = document.getElementById('result-area');
      const content = document.getElementById('content');
      
      loader.style.display = 'block';
      resultArea.style.display = 'none';
      content.innerHTML = '';

      try {
        const res = await fetch('/?text=' + encodeURIComponent(query));
        const data = await res.json();
        
        loader.style.display = 'none';
        resultArea.style.display = 'block';

        if (data.error) {
          content.innerHTML = '<p style="color:red">Error: ' + data.error + '</p>';
          return;
        }

        if (data.type === 'PREDICTION_MODEL') {
          content.innerHTML = \`
            <span class="tag pred">PREDICTIVE ENGINE (LINEAR REGRESSION)</span>
            <div style="text-align: center;">
              <div style="font-size: 1rem; color: #888; margin-top: 10px;">Predicted Sales (Next 30 Days)</div>
              <div class="metric">\${data.forecast_next_30_days}</div>
              <div class="trend">Trend: \${data.growth_trend} (Slope: \${data.slope})</div>
            </div>
          \`;
        } else {
          // It's SQL
          let tableHtml = \`
            <span class="tag sql">GENERATED SQL</span>
            <div style="background:#111; padding:10px; font-family:monospace; color:#4fd1c5; margin-bottom:20px; border-radius:4px; font-size: 0.85rem;">\${data.generated_sql}</div>
            <table><thead><tr>\`;
          
          if (data.result.length > 0) {
            // Headers
            Object.keys(data.result[0]).forEach(k => {
              tableHtml += \`<th>\${k}</th>\`;
            });
            tableHtml += '</tr></thead><tbody>';
            
            // Rows
            data.result.forEach(row => {
              tableHtml += '<tr>';
              Object.values(row).forEach(val => {
                tableHtml += \`<td>\${val}</td>\`;
              });
              tableHtml += '</tr>';
            });
            tableHtml += '</tbody></table>';
          } else {
            tableHtml += '<p>No results found.</p>';
          }
          content.innerHTML = tableHtml;
        }

      } catch (e) {
        loader.style.display = 'none';
        alert('Request failed');
      }
    }
  </script>
</body>
</html>
`;

// --- 2. BACKEND LOGIC (Same as before) ---
function simpleLinearRegression(data: any[]) {
  const n = data.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  for (let i = 0; i < n; i++) {
    const x = i;
    const y = data[i].daily_total;
    sumX += x; sumY += y; sumXY += (x * y); sumXX += (x * x);
  }
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);
    const userQuestion = url.searchParams.get('text');

    // MODE 1: Serve HTML if no question provided (Home Page)
    if (!userQuestion) {
      return new Response(html, {
        headers: { 'Content-Type': 'text/html' },
      });
    }

    // MODE 2: API (The Logic)
    const isForecast = /forecast|predict|future|trend/i.test(userQuestion);

    if (isForecast) {
      const historySQL = `SELECT date, SUM(total_sales) as daily_total FROM sales GROUP BY date ORDER BY date ASC`;
      const history = await env.DB.prepare(historySQL).all();
      
      if (!history.results || history.results.length === 0) {
        return Response.json({ error: "Not enough data to forecast." });
      }

      const { slope, intercept } = simpleLinearRegression(history.results);
      const lastDayIndex = history.results.length;
      let predictedSum = 0;
      for (let i = 1; i <= 30; i++) {
        predictedSum += (slope * (lastDayIndex + i) + intercept);
      }

      return Response.json({
        type: "PREDICTION_MODEL",
        question: userQuestion,
        method: "Linear Regression",
        slope: slope.toFixed(2),
        growth_trend: slope > 0 ? "Positive" : "Negative",
        forecast_next_30_days: `$${predictedSum.toLocaleString(undefined, {maximumFractionDigits: 2})}`
      });
    }

    const ai = new Ai(env.AI);
    const schema = `Table: sales, Columns: date, category, product, region, quantity, unit_price, total_sales`;
    const systemPrompt = `You are a SQL expert. Schema: ${schema}. Return ONLY raw SQL. For revenue use SUM(total_sales).`;

    try {
      const aiResponse = await ai.run('@cf/meta/llama-3-8b-instruct', {
        messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userQuestion }],
      });
      const sql = (aiResponse as any).response.trim().replace(/```sql|```/g, '');
      const dbResult = await env.DB.prepare(sql).all();

      return Response.json({
        type: "SQL_QUERY",
        generated_sql: sql,
        result: dbResult.results
      });

    } catch (error) {
      return Response.json({ error: (error as any).message }, { status: 500 });
    }
  },
};