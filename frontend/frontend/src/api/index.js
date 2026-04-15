// ==========================================
// Public API service
// These endpoints are used by the portfolio site (not admin)
// All requests go to /api which is proxied to localhost:5000
// If backend is not running, each function returns null
// and the components fall back to placeholder data
// ==========================================

const API_BASE = "/api/v1/admin";

// generic GET helper - fetches data from an endpoint
async function fetchData(endpoint) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`);
    if (!res.ok) throw new Error(`Failed to fetch ${endpoint}`);
    const json = await res.json();
    return json.data || json;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error.message);
    return null;
  }
}

// ---- individual section fetchers ----

export async function getHero() {
  return await fetchData("/getActiveHero");
}

export async function getProjects() {
  return await fetchData("/getAllProject?limit=999");
}

// get single project by id
export async function getProjectById(id) {
  return await fetchData(`/getAllProject?limit=999`);
}

export async function getApps() {
  return await fetchData("/getAllApp?limit=999");
}

// get single app by id (fetch all and find by id since no single-fetch endpoint)
export async function getAppById(id) {
  const res = await fetchData("/getAllApp?limit=999");
  const list = res?.apps || [];
  return list.find((a) => a._id === id) || null;
}

export async function getClients() {
  return await fetchData("/getAllClient?limit=999");
}

// get single client by id (fetch all and filter)
export async function getClientById(id) {
  const res = await fetchData("/getAllClient?limit=999");
  const list = res?.clients || [];
  return list.find((c) => c._id === id) || null;
}

export async function getTeamMembers() {
  return await fetchData("/getAllteam?limit=999");
}

export async function getTestimonials() {
  return await fetchData("/getAlltestiomonail?limit=999");
}

export async function getGallery() {
  // public list — backend returns the array directly under .data
  return await fetchData("/gallery");
}

export async function getGalleryHeading() {
  return await fetchData("/galleryHeading");
}

export async function getAbout() {
  return await fetchData("/about");
}

export async function getFooterSettings() {
  return await fetchData("/footer-settings");
}

// ---- contact form submission ----
// sends form data as JSON via POST to the new /createMessageDetails endpoint
export async function submitContact(formData) {
  try {
    const res = await fetch(`${API_BASE}/createMessageDetails`, {
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
