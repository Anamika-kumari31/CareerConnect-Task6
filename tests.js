/* CareerConnect automated tests (no framework needed).
   Run in Node:    node tests/tests.js
   Run in browser: open tests.html                                   */
(function () {
  "use strict";
  const L = (typeof module === "object" && typeof require === "function")
    ? require("../logic.js") : window.CCLogic;

  const results = [];
  function test(name, fn) {
    try { fn(); results.push({ name, ok: true }); }
    catch (e) { results.push({ name, ok: false, error: e.message }); }
  }
  function eq(actual, expected, label) {
    const a = JSON.stringify(actual), b = JSON.stringify(expected);
    if (a !== b) throw new Error(`${label || "Mismatch"}: expected ${b} but got ${a}`);
  }
  const titles = list => list.map(j => j.title);
  const J = L.SAMPLE_JOBS;

  /* ---- Search ---- */
  test("S-01 Java returns only Java Developer Trainee (BUG-01 regression)", () =>
    eq(titles(L.filterJobs(J, { search: "Java" })), ["Java Developer Trainee"]));
  test("S-02 JavaScript returns only Frontend Developer Intern", () =>
    eq(titles(L.filterJobs(J, { search: "JavaScript" })), ["Frontend Developer Intern"]));
  test("S-03 Python returns only Data Analyst Intern", () =>
    eq(titles(L.filterJobs(J, { search: "Python" })), ["Data Analyst Intern"]));
  test("S-04 Unknown term returns no listings", () =>
    eq(L.filterJobs(J, { search: "DoctorXYZ999" }).length, 0));
  test("S-05 Search is case-insensitive and trims spaces", () =>
    eq(titles(L.filterJobs(J, { search: "  pYtHoN  " })), ["Data Analyst Intern"]));
  test("S-06 Multi-word search needs every word (sql intern)", () =>
    eq(titles(L.filterJobs(J, { search: "sql intern" })), ["Data Analyst Intern"]));
  test("S-07 Search by company name works", () =>
    eq(titles(L.filterJobs(J, { search: "nimbus" })), ["Cloud Support Intern"]));
  test("S-08 Empty search returns all listings", () =>
    eq(L.filterJobs(J, { search: "" }).length, 6));
  test("S-09 Special regex characters do not crash search", () => {
    eq(L.filterJobs(J, { search: "(" }).length, 0);
    eq(L.filterJobs(J, { search: "c++" }).length, 0);
    eq(titles(L.filterJobs(J, { search: "ui/ux" })), ["UI/UX Design Intern"]);
  });

  /* ---- Filters ---- */
  test("F-01 Internship filter returns 4 listings", () =>
    eq(L.filterJobs(J, { type: "Internship" }).length, 4));
  test("F-02 Full-time filter returns 2 listings", () =>
    eq(L.filterJobs(J, { type: "Full-time" }).length, 2));
  test("F-03 Remote filter returns Frontend and UI/UX interns", () =>
    eq(titles(L.filterJobs(J, { mode: "Remote" })), ["Frontend Developer Intern", "UI/UX Design Intern"]));
  test("F-04 Internship + Remote returns 2 listings", () =>
    eq(L.filterJobs(J, { type: "Internship", mode: "Remote" }).length, 2));
  test("F-05 Search + filter combine (sql + Full-time)", () =>
    eq(titles(L.filterJobs(J, { search: "sql", type: "Full-time" })),
      ["Java Developer Trainee", "QA Testing Associate"]));

  /* ---- Sorting ---- */
  test("O-01 Sort by title is A-Z", () =>
    eq(titles(L.sortJobs(J, "title"))[0], "Cloud Support Intern"));
  test("O-02 Sort by company is A-Z", () =>
    eq(L.sortJobs(J, "company")[0].company, "BrightByte Systems"));
  test("O-03 Default sort keeps order and does not mutate input", () => {
    const copy = [...J];
    L.sortJobs(J, "title");
    eq(J, copy);
    eq(L.sortJobs(J, "default"), copy);
  });
  test("O-04 Newest first puts highest id first", () =>
    eq(L.sortJobs(J, "newest")[0].id, 6));

  /* ---- Form validation ---- */
  const good = { title: "Backend Intern", company: "Acme Corp", type: "Internship",
    mode: "Remote", location: "Delhi", skills: "Node.js, SQL" };
  test("V-01 Valid job passes", () => eq(L.validateJob(good).valid, true));
  test("V-02 Empty form fails on all 6 fields", () =>
    eq(Object.keys(L.validateJob({}).errors).length, 6));
  test("V-03 Too short title is rejected", () =>
    eq(!!L.validateJob({ ...good, title: "ab" }).errors.title, true));
  test("V-04 Invalid type and mode are rejected", () => {
    const r = L.validateJob({ ...good, type: "Hacker", mode: "Moon" });
    eq(!!r.errors.type && !!r.errors.mode, true);
  });
  test("V-05 Whitespace is trimmed and collapsed", () =>
    eq(L.validateJob({ ...good, title: "  Backend    Intern " }).job.title, "Backend Intern"));
  test("V-06 Title longer than 60 chars is rejected", () =>
    eq(!!L.validateJob({ ...good, title: "x".repeat(61) }).errors.title, true));

  /* ---- Security / data safety ---- */
  test("X-01 escapeHTML neutralises script tags", () =>
    eq(L.escapeHTML('<img src=x onerror="alert(1)">'),
      "&lt;img src=x onerror=&quot;alert(1)&quot;&gt;"));
  test("X-02 sanitizeCustomJobs drops bad records", () => {
    const list = [
      { id: 1000, ...good },          // valid
      { id: 1000, ...good },          // duplicate id
      { id: 5, ...good },             // id too low
      { id: 1001, title: "x" },       // invalid fields
      null, "junk", 42
    ];
    eq(L.sanitizeCustomJobs(list).length, 1);
    eq(L.sanitizeCustomJobs("not-an-array"), []);
  });
  test("X-03 nextCustomId starts at 1000 and increments", () => {
    eq(L.nextCustomId([]), 1000);
    eq(L.nextCustomId([{ id: 1000 }, { id: 1004 }]), 1005);
  });

  /* ---- Report ---- */
  const passed = results.filter(r => r.ok).length;
  if (typeof document !== "undefined") {
    const box = document.getElementById("results");
    box.innerHTML = `<h2 id="summary">${passed}/${results.length} tests passed</h2>` +
      results.map(r => `<p class="${r.ok ? "pass" : "fail"}">${r.ok ? "PASS" : "FAIL"} - ${L.escapeHTML(r.name)}${r.ok ? "" : " (" + L.escapeHTML(r.error) + ")"}</p>`).join("");
  } else {
    results.forEach(r => console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}${r.ok ? "" : "  -> " + r.error}`));
    console.log(`\n${passed}/${results.length} tests passed`);
    if (passed !== results.length) process.exitCode = 1;
  }
})();
