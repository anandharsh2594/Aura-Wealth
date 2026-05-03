const fetch = require('node-fetch');
async function test() {
  const res = await fetch('https://project-ngq47.vercel.app/api/ai-advisor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        role: "user",
        parts: [{ text: "SYSTEM INSTRUCTIONS: you are an expert\n\nUser Question: I spend 8000/month on dining out" }]
      }]
    })
  });
  console.log("Status:", res.status);
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}
test();
