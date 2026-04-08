// ==========================================
// Public API service
// These endpoints are used by the portfolio site (not admin)
// All requests go to /api which is proxied to localhost:5000
// If backend is not running, each function returns null
// and the components fall back to placeholder data
// ==========================================

const API_BASE = "/api";

// generic GET helper - fetches data from an endpoint
async function fetchData(endpoint) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`);
    if (!res.ok) throw new Error(`Failed to fetch ${endpoint}`);
    const data = await res.json();
    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error.message);
    return null;
  }
}

// ---- individual section fetchers ----

export async function getHero() {
  return await fetchData("/hero");
}

export async function getProjects() {
  return await fetchData("/projects");
}

// get single project by id
export async function getProjectById(id) {
  return await fetchData(`/projects/${id}`);
}

export async function getApps() {
  return await fetchData("/apps");
}

// get single app by id
export async function getAppById(id) {
  return await fetchData(`/apps/${id}`);
}

export async function getClients() {
  return await fetchData("/clients");
}

// get single client by id
export async function getClientById(id) {
  return await fetchData(`/clients/${id}`);
}

export async function getTeamMembers() {
  return await fetchData("/team");
}

export async function getTestimonials() {
  return await fetchData("/testimonials");
}

export async function getGallery() {
  return await fetchData("/gallery");
}

export async function getAbout() {
  return await fetchData("/about");
}

// ---- contact form submission ----
// sends form data as JSON via POST
export async function submitContact(formData) {
  try {
    const res = await fetch(`${API_BASE}/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    if (!res.ok) throw new Error("Failed to submit");
    return await res.json();
  } catch (error) {
    console.error("Contact submit error:", error.message);
    return null;
  }
}
