const puppeteer = require("/app/node_modules/puppeteer-core");

(async () => {
  const browser = await puppeteer.connect({ browserURL: "http://host.docker.internal:9222" });
  const pages = await browser.pages();
  const page = pages[0];
  await page.bringToFront();

  const errors = [];
  page.on("pageerror", (e) => errors.push("PAGEERROR: " + e.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push("CONSOLE_ERR: " + msg.text());
  });

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // Navigate fresh
  await page.goto("http://localhost:8081/", { waitUntil: "networkidle2", timeout: 30000 });
  await sleep(4000);

  const bodyText = () => page.evaluate(() => document.body.innerText.slice(0, 500));

  // Check what's on screen
  const text = await bodyText();
  console.log("=== PAGE 1 ===");
  console.log(text);

  // Pre-seed localStorage with clinic setup + a patient to skip setup
  await page.evaluate(() => {
    const clinic = [{
      id: "c1", name: "Clinica Test", professionalName: "Dr Test",
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    }];
    localStorage.setItem("consientemente_clinicProfiles", JSON.stringify(clinic));

    const patients = [{
      id: "p1", dni: "1234567", name: "Juan Perez",
      bankAccounts: [], ageCategory: "ADULT", age: 30,
      parentsNames: "", regularSchedules: [],
      paymentFrequency: "PER_SESSION", paymentAmount: 100000,
      notes: "", isActive: true,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    }];
    localStorage.setItem("consientemente_patients", JSON.stringify(patients));
  });

  // Reload to pick up seeded data
  await page.goto("http://localhost:8081/", { waitUntil: "networkidle2", timeout: 30000 });
  await sleep(4000);

  const text2 = await bodyText();
  console.log("=== PAGE 2 (after seed) ===");
  console.log(text2);

  // Try to navigate to calendar via drawer
  await page.evaluate(() => {
    // Look for the hamburger menu or calendar link
    const all = [...document.querySelectorAll("div[role='button'], div[tabindex], a, span")];
    const cal = all.find(e => /calendario|calendar|agenda/i.test(e.textContent) && e.textContent.length < 30);
    if (cal) { cal.click(); return "clicked calendar"; }
    return "no calendar link found, elements: " + all.slice(0, 10).map(e => e.textContent.trim().slice(0, 20)).join(" | ");
  });
  await sleep(3000);

  const text3 = await bodyText();
  console.log("=== PAGE 3 (after nav) ===");
  console.log(text3);

  // Now try to click "+ session.new" button
  const clickResult = await page.evaluate(() => {
    const all = [...document.querySelectorAll("div,span,text")];
    const btn = all.find(e =>
      e.children.length <= 2 &&
      /session\.new|programar|nueva/i.test(e.textContent) &&
      e.textContent.length < 30
    );
    if (btn) { btn.click(); return "clicked: " + btn.textContent.trim(); }
    return "no session button found";
  });
  console.log("CLICK RESULT:", clickResult);
  await sleep(2000);

  const text4 = await bodyText();
  console.log("=== PAGE 4 (after session click) ===");
  console.log(text4);

  // Report errors
  if (errors.length > 0) {
    console.log("=== ERRORS ===");
    errors.forEach(e => console.log(e));
  } else {
    console.log("=== NO ERRORS ===");
  }

  // Check localStorage
  const lsCheck = await page.evaluate(() => {
    const sessions = localStorage.getItem("consientemente_sessions");
    return { sessions: sessions ? JSON.parse(sessions).length : 0 };
  });
  console.log("=== LS CHECK ===", JSON.stringify(lsCheck));

  process.exit(0);
})().catch((e) => { console.error("FATAL:", e.message); process.exit(1); });
