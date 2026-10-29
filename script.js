/* CareerConnect - UI layer. Pure logic lives in logic.js (tested in tests/). */
"use strict";

const {
  SAMPLE_JOBS, VALID_STATUSES, escapeHTML, filterJobs, sortJobs,
  validateJob, nextCustomId, sanitizeCustomJobs
} = CCLogic;

const KEYS = {
  saved: "ccSavedJobs",
  applications: "ccApplications",
  custom: "ccCustomJobs"
};

function readStoredArray(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error(`Unable to read ${key} from Local Storage.`, error);
    return [];
  }
}

/* ---------- State ---------- */
let customJobs = sanitizeCustomJobs(readStoredArray(KEYS.custom));
const getAllJobs = () => [...SAMPLE_JOBS, ...customJobs];
const jobExists = id => getAllJobs().some(job => job.id === id);

let savedJobs = [...new Set(
  readStoredArray(KEYS.saved).filter(id => Number.isInteger(id) && jobExists(id))
)];

let applications = readStoredArray(KEYS.applications)
  .filter(app =>
    app && Number.isInteger(app.id) && jobExists(app.id) &&
    VALID_STATUSES.includes(app.status) && typeof app.date === "string"
  )
  .filter((app, index, list) => list.findIndex(item => item.id === app.id) === index);

/* ---------- DOM references ---------- */
const jobList = document.getElementById("jobList");
const savedList = document.getElementById("savedList");
const applicationList = document.getElementById("applicationList");
const searchInput = document.getElementById("searchInput");
const typeFilter = document.getElementById("typeFilter");
const modeFilter = document.getElementById("modeFilter");
const sortSelect = document.getElementById("sortSelect");
const resultCount = document.getElementById("resultCount");
const emptyMessage = document.getElementById("emptyMessage");
const clearBtn = document.getElementById("clearFilters");
const addForm = document.getElementById("addJobForm");
const formStatus = document.getElementById("formStatus");

/* ---------- Storage ---------- */
function saveData() {
  try {
    localStorage.setItem(KEYS.saved, JSON.stringify(savedJobs));
    localStorage.setItem(KEYS.applications, JSON.stringify(applications));
    localStorage.setItem(KEYS.custom, JSON.stringify(customJobs));
    return true;
  } catch (error) {
    console.error("Unable to save CareerConnect data.", error);
    alert("Your changes could not be saved. Please check browser storage settings and try again.");
    return false;
  }
}

/* ---------- Rendering ---------- */
function displayJobs() {
  const filtered = sortJobs(
    filterJobs(getAllJobs(), {
      search: searchInput.value,
      type: typeFilter.value,
      mode: modeFilter.value
    }),
    sortSelect.value
  );

  emptyMessage.classList.toggle("hidden", filtered.length > 0);
  resultCount.textContent =
    `Showing ${filtered.length} of ${getAllJobs().length} opportunities`;

  jobList.innerHTML = filtered.map(job => {
    const title = escapeHTML(job.title);
    const isSaved = savedJobs.includes(job.id);
    const isTracked = applications.some(a => a.id === job.id);
    return `
    <article class="job-card">
      ${job.id >= CCLogic.CUSTOM_ID_START ? '<span class="badge">Added by you</span>' : ""}
      <h3>${title}</h3>
      <p class="company">${escapeHTML(job.company)}</p>
      <p class="job-details">
        ${escapeHTML(job.type)} · ${escapeHTML(job.mode)}<br>
        Location: ${escapeHTML(job.location)}
      </p>
      <p class="skills">${escapeHTML(job.skills)}</p>
      <button class="save-btn" data-save="${job.id}"
        aria-label="${isSaved ? "Unsave" : "Save"} ${title}">
        ${isSaved ? "♥ Saved" : "♡ Save"}
      </button>
      <button class="track-btn" data-track="${job.id}"
        aria-label="${isTracked ? "View tracker for" : "Track application for"} ${title}">
        ${isTracked ? "View Tracker" : "Track Application"}
      </button>
      ${job.id >= CCLogic.CUSTOM_ID_START ? `
      <button class="remove-btn" data-delete-job="${job.id}"
        aria-label="Delete ${title}">Delete</button>` : ""}
    </article>`;
  }).join("");
}

function displaySaved() {
  const list = getAllJobs().filter(job => savedJobs.includes(job.id));
  savedList.innerHTML = list.length
    ? list.map(job => `
      <article class="job-card">
        <h3>${escapeHTML(job.title)}</h3>
        <p class="company">${escapeHTML(job.company)}</p>
        <button class="remove-btn" data-remove-save="${job.id}"
          aria-label="Remove saved job ${escapeHTML(job.title)}">
          Remove Saved Job
        </button>
      </article>`).join("")
    : "<p>No saved jobs yet. Use the Save button above.</p>";
}

function displayApplications() {
  const items = applications.map(app => {
    const job = getAllJobs().find(item => item.id === app.id);
    if (!job) return "";
    const title = escapeHTML(job.title);
    return `
      <div class="application-item">
        <div>
          <strong>${title}</strong>
          <p class="company">${escapeHTML(job.company)} · Added ${escapeHTML(app.date)}</p>
        </div>
        <select data-status="${job.id}" aria-label="Application status for ${title}">
          ${VALID_STATUSES.map(status =>
            `<option ${app.status === status ? "selected" : ""}>${status}</option>`
          ).join("")}
        </select>
        <button class="remove-btn" data-remove-app="${job.id}"
          aria-label="Remove ${title} from tracker">Remove</button>
      </div>`;
  }).join("");
  applicationList.innerHTML = items || "<p>No applications tracked yet.</p>";
}

function renderAll() {
  displayJobs();
  displaySaved();
  displayApplications();
}

/* ---------- Events: listings ---------- */
jobList.addEventListener("click", event => {
  const button = event.target.closest("button");
  if (!button) return;

  if (button.dataset.save) {
    const id = Number(button.dataset.save);
    savedJobs = savedJobs.includes(id)
      ? savedJobs.filter(jobId => jobId !== id)
      : [...savedJobs, id];
    saveData();
    renderAll();
  } else if (button.dataset.track) {
    const id = Number(button.dataset.track);
    if (!applications.some(app => app.id === id)) {
      applications.push({
        id,
        status: "Interested",
        date: new Date().toLocaleDateString("en-IN")
      });
      saveData();
      renderAll();
    } else {
      document.getElementById("tracker").scrollIntoView({ behavior: "smooth" });
    }
  } else if (button.dataset.deleteJob) {
    const id = Number(button.dataset.deleteJob);
    if (!confirm("Delete this opportunity you added?")) return;
    customJobs = customJobs.filter(job => job.id !== id);
    savedJobs = savedJobs.filter(jobId => jobId !== id);
    applications = applications.filter(app => app.id !== id);
    saveData();
    renderAll();
  }
});

savedList.addEventListener("click", event => {
  const button = event.target.closest("button");
  const id = Number(button && button.dataset.removeSave);
  if (id) {
    savedJobs = savedJobs.filter(jobId => jobId !== id);
    saveData();
    renderAll();
  }
});

applicationList.addEventListener("change", event => {
  const id = Number(event.target.dataset.status);
  if (!id) return;
  const app = applications.find(item => item.id === id);
  if (!app) return;
  const newStatus = event.target.value;
  if (!VALID_STATUSES.includes(newStatus)) {
    console.error("Invalid application status was rejected.");
    renderAll();
    return;
  }
  app.status = newStatus;
  saveData();
  displayApplications();
});

applicationList.addEventListener("click", event => {
  const button = event.target.closest("button");
  const id = Number(button && button.dataset.removeApp);
  if (id) {
    applications = applications.filter(app => app.id !== id);
    saveData();
    renderAll();
  }
});

/* ---------- Events: search, filters, sort ---------- */
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

searchInput.addEventListener("input", debounce(displayJobs, 200));
typeFilter.addEventListener("change", displayJobs);
modeFilter.addEventListener("change", displayJobs);
sortSelect.addEventListener("change", displayJobs);

clearBtn.addEventListener("click", () => {
  searchInput.value = "";
  typeFilter.value = "All";
  modeFilter.value = "All";
  sortSelect.value = "default";
  displayJobs();
  searchInput.focus();
});

/* ---------- Events: add opportunity form ---------- */
const FIELDS = ["title", "company", "type", "mode", "location", "skills"];

addForm.addEventListener("submit", event => {
  event.preventDefault();
  formStatus.textContent = "";

  const values = {};
  FIELDS.forEach(name => { values[name] = addForm.elements[name].value; });

  const result = validateJob(values);

  FIELDS.forEach(name => {
    const message = result.errors[name] || "";
    document.getElementById(`err-${name}`).textContent = message;
    addForm.elements[name].setAttribute("aria-invalid", message ? "true" : "false");
  });

  if (!result.valid) {
    const firstBad = FIELDS.find(name => result.errors[name]);
    addForm.elements[firstBad].focus();
    return;
  }

  customJobs.push({ id: nextCustomId(customJobs), ...result.job });
  if (!saveData()) { customJobs.pop(); return; }

  addForm.reset();
  renderAll();
  formStatus.textContent = `"${result.job.title}" was added to the listings.`;
});

renderAll();
