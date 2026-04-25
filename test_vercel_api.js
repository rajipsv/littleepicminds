async function runTest() {
  console.log("1. Testing Registration...");
  const regRes = await fetch("https://littleepicminds.vercel.app/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "testuser_" + Date.now(),
      email: "test_" + Date.now() + "@example.com",
      password: "Password123!",
      age: 10,
      grade: "5"
    })
  });
  
  const regText = await regRes.text();
  console.log("Reg status:", regRes.status);
  console.log("Reg response:", regText);
  
  if (!regRes.ok) return;
  const token = JSON.parse(regText).token;
  
  console.log("\n2. Testing Journal Save...");
  const jRes = await fetch("https://littleepicminds.vercel.app/api/journal", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({
      scripture: "gita",
      chapter_number: 1,
      verse_id: "1.1",
      question: "What did you learn?",
      response: "Test response from antigravity!"
    })
  });
  
  const jText = await jRes.text();
  console.log("Journal status:", jRes.status);
  console.log("Journal response:", jText);
}

runTest();
