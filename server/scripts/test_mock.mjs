// quick test of /api/analyze mock
const body = JSON.stringify({ text: "Your account will be blocked today. Complete KYC now.", language: "en" });
const res = await fetch("http://localhost:8787/api/analyze", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body,
});
const json = await res.json();
console.log(JSON.stringify(json, null, 2));
