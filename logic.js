/* CareerConnect - pure logic (no DOM access), so it can be tested in the
   browser (tests.html) and in Node (node tests/tests.js). */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.CCLogic = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  const SAMPLE_JOBS = [
    { id: 1, title: "Frontend Developer Intern", company: "PixelCraft Studio", type: "Internship", mode: "Remote", location: "Remote", skills: "HTML, CSS, JavaScript" },
    { id: 2, title: "Java Developer Trainee", company: "CodeSpring Labs", type: "Full-time", mode: "Hybrid", location: "Noida", skills: "Java, OOP, SQL" },
    { id: 3, title: "Data Analyst Intern", company: "InsightWorks", type: "Internship", mode: "Hybrid", location: "Noida", skills: "Excel, SQL, Python" },
    { id: 4, title: "UI/UX Design Intern", company: "Northstar Digital", type: "Internship", mode: "Remote", location: "Remote", skills: "Figma, UI Design" },
    { id: 5, title: "QA Testing Associate", company: "BrightByte Systems", type: "Full-time", mode: "On-site", location: "Noida", skills: "Testing, SQL" },
    { id: 6, title: "Cloud Support Intern", company: "Nimbus Tech", type: "Internship", mode: "On-site", location: "Noida", skills: "Linux, Cloud, Networking" }
  ];

  const VALID_STATUSES = ["Interested", "Applied", "Interview", "Offer", "Rejected"];
  const VALID_TYPES = ["Internship", "Full-time"];
  const VALID_MODES = ["Remote", "Hybrid", "On-site"];
  const CUSTOM_ID_START = 1000;

  function escapeHTML(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function escapeRegExp(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  /* Whole-word matching: "java" must not match "javascript" (BUG-01 from Task 4).
     Every word typed by the user must be found somewhere in the listing. */
  function matchesSearch(job, query) {
    const q = String(query || "").toLowerCase().trim();
    if (q === "") return true;
    const text = `${job.title} ${job.company} ${job.skills} ${job.location}`.toLowerCase();
    return q.split(/\s+/).every(term =>
      new RegExp("(^|[^a-z0-9])" + escapeRegExp(term) + "(?![a-z0-9])").test(text)
    );
  }

  function filterJobs(jobs, { search = "", type = "All", mode = "All" } = {}) {
    return jobs.filter(job =>
      matchesSearch(job, search) &&
      (type === "All" || job.type === type) &&
      (mode === "All" || job.mode === mode)
    );
  }

  function sortJobs(jobs, key) {
    const list = [...jobs];
    if (key === "title") list.sort((a, b) => a.title.localeCompare(b.title));
    else if (key === "company") list.sort((a, b) => a.company.localeCompare(b.company));
    else if (key === "newest") list.sort((a, b) => b.id - a.id);
    return list; // "default" keeps the original order
  }

  function cleanText(value) {
    return String(value == null ? "" : value).replace(/\s+/g, " ").trim();
  }

  /* Validates the "Add Opportunity" form. Returns { valid, errors, job }. */
  function validateJob(input) {
    const data = {
      title: cleanText(input.title),
      company: cleanText(input.company),
      type: cleanText(input.type),
      mode: cleanText(input.mode),
      location: cleanText(input.location),
      skills: cleanText(input.skills)
    };
    const errors = {};

    if (data.title.length < 3 || data.title.length > 60)
      errors.title = "Job title must be 3 to 60 characters.";
    if (data.company.length < 2 || data.company.length > 60)
      errors.company = "Company name must be 2 to 60 characters.";
    if (!VALID_TYPES.includes(data.type))
      errors.type = "Please choose Internship or Full-time.";
    if (!VALID_MODES.includes(data.mode))
      errors.mode = "Please choose Remote, Hybrid or On-site.";
    if (data.location.length < 2 || data.location.length > 60)
      errors.location = "Location must be 2 to 60 characters.";
    if (data.skills.length < 2 || data.skills.length > 100)
      errors.skills = "Skills must be 2 to 100 characters.";

    return { valid: Object.keys(errors).length === 0, errors, job: data };
  }

  function nextCustomId(customJobs) {
    return customJobs.reduce((max, job) => Math.max(max, job.id), CUSTOM_ID_START - 1) + 1;
  }

  /* Drops anything unexpected that was read from Local Storage. */
  function sanitizeCustomJobs(list) {
    if (!Array.isArray(list)) return [];
    const seen = new Set();
    return list.filter(item => {
      if (!item || !Number.isInteger(item.id) || item.id < CUSTOM_ID_START || seen.has(item.id)) return false;
      if (!validateJob(item).valid) return false;
      seen.add(item.id);
      return true;
    });
  }

  return {
    SAMPLE_JOBS, VALID_STATUSES, VALID_TYPES, VALID_MODES, CUSTOM_ID_START,
    escapeHTML, matchesSearch, filterJobs, sortJobs, validateJob, nextCustomId, sanitizeCustomJobs
  };
});
