// ==========================================
// Admin API service
// All admin endpoints go through /api/admin
// Just plug in your Node backend and these will work
// ==========================================

const BASE = "/api/v1/admin";

// helper to get auth token from localStorage
function getToken() {
  return localStorage.getItem("matat-admin-token");
}

// generic fetch wrapper with auth header
async function adminFetch(endpoint, options = {}) {
  try {
    const token = getToken();
    const res = await fetch(`${BASE}${endpoint}`, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    // if unauthorized, try refreshing the token first
    if (res.status === 401) {
      const refreshed = await refreshToken();
      if (refreshed) {
        // retry the original request with new token
        const retryRes = await fetch(`${BASE}${endpoint}`, {
          ...options,
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
            ...options.headers,
          },
        });
        if (retryRes.ok) return await retryRes.json();
      }
      // refresh failed — go to login
      localStorage.removeItem("matat-admin-token");
      window.location.href = "/matat-admin/login";
      return null;
    }

    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error(`Admin API [${endpoint}]:`, err.message);
    return null;
  }
}

// for file uploads (images etc) - uses FormData instead of JSON
async function adminUpload(endpoint, formData, method = "POST") {
  try {
    const token = getToken();
    const res = await fetch(`${BASE}${endpoint}`, {
      method,
      credentials: "include",
      headers: { Authorization: `Bearer ${token}` },
      body: formData, // browser sets content-type with boundary automatically
    });

    if (res.status === 401) {
      const refreshed = await refreshToken();
      if (refreshed) {
        const retryRes = await fetch(`${BASE}${endpoint}`, {
          method,
          credentials: "include",
          headers: { Authorization: `Bearer ${getToken()}` },
          body: formData,
        });
        if (retryRes.ok) return await retryRes.json();
      }
      localStorage.removeItem("matat-admin-token");
      window.location.href = "/matat-admin/login";
      return null;
    }

    if (!res.ok) throw new Error(`Upload error: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error(`Admin Upload [${endpoint}]:`, err.message);
    return null;
  }
}

// ---- Auth ----
export async function loginAdmin(email, password) {
  try {
    const res = await fetch(`${BASE}/login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    // store accessToken in localStorage for Authorization header
    if (data?.data?.accessToken) {
      localStorage.setItem("matat-admin-token", data.data.accessToken);
    }
    return data;
  } catch (err) {
    console.error("Login error:", err.message);
    return null;
  }
}

export async function logoutAdmin() {
  try {
    const token = getToken();
    const res = await fetch(`${BASE}/logout/`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    localStorage.removeItem("matat-admin-token");
    return res.ok;
  } catch (err) {
    console.error("Logout error:", err.message);
    localStorage.removeItem("matat-admin-token");
    return false;
  }
}

export async function refreshToken() {
  try {
    const res = await fetch(`${BASE}/refresh-token`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) return false;
    const data = await res.json();
    if (data?.data?.accessToken) {
      localStorage.setItem("matat-admin-token", data.data.accessToken);
    }
    return true;
  } catch (err) {
    console.error("Refresh token error:", err.message);
    return false;
  }
}

export async function verifyToken() {
  return await adminFetch("/verify");
}

// ---- Hero ----
export async function getHero() {
  return await adminFetch("/getActiveHero");
}
export async function getAllHeroes(page = 1, limit = 7) {
  return await adminFetch(`/getAllHero?page=${page}&limit=${limit}`);
}
export async function createHero(data) {
  return await adminUpload("/createHero", data, "POST");
}
export async function updateHero(id, data) {
  return await adminUpload(`/editHeroDetails/${id}`, data, "PATCH");
}
export async function toggleHero(id) {
  return await adminFetch(`/toggleHeroDetail/${id}`, { method: "PATCH" });
}
export async function deleteHero(id) {
  return await adminFetch(`/deleteHero/${id}`, { method: "DELETE" });
}

// ---- Projects ----
export async function getProjects(page = 1, limit = 6) {
  return await adminFetch(`/getAllProject?page=${page}&limit=${limit}`);
}
export async function createProject(data) {
  return await adminUpload("/createProject", data, "POST");
}
export async function updateProject(id, data) {
  return await adminUpload(`/projectEdit/${id}`, data, "PATCH");
}
export async function deleteProject(id) {
  return await adminFetch(`/deleteProject/${id}`, { method: "DELETE" });
}
// ---- Project Screenshots (separate endpoints) ----
export async function addProjectScreenshots(id, formData) {
  return await adminUpload(`/addProjectScreenshots/${id}`, formData, "PATCH");
}
export async function replaceProjectScreenshots(id, formData) {
  return await adminUpload(`/replaceProjectScreenshots/${id}`, formData, "PATCH");
}
export async function removeProjectScreenshot(id, publicId) {
  return await adminFetch(`/removeProjectScreenshot/${id}/${encodeURIComponent(publicId)}`, {
    method: "DELETE",
  });
}
export async function getProjectScreenshots(id) {
  return await adminFetch(`/getProjectScreenshots/${id}`);
}

// ---- Apps ----
export async function getApps(page = 1, limit = 7) {
  return await adminFetch(`/getAllApp?page=${page}&limit=${limit}`);
}
export async function createApp(data) {
  return await adminUpload("/createApp", data, "POST");
}
export async function updateApp(id, data) {
  return await adminUpload(`/editApp/${id}`, data, "PATCH");
}
export async function deleteApp(id) {
  return await adminFetch(`/deleteApp/${id}`, { method: "DELETE" });
}

// ---- Clients ----
export async function getClients(page = 1, limit = 7) {
  return await adminFetch(`/getAllClient?page=${page}&limit=${limit}`);
}
export async function createClient(data) {
  return await adminUpload("/createClient", data, "POST");
}
export async function updateClient(id, data) {
  return await adminUpload(`/editClientDetails/${id}`, data, "PATCH");
}
export async function deleteClient(id) {
  return await adminFetch(`/deleteClient/${id}`, { method: "DELETE" });
}

// ---- Team ----
export async function getTeamMembers(page = 1, limit = 7) {
  return await adminFetch(`/getAllteam?page=${page}&limit=${limit}`);
}
export async function createTeamMember(data) {
  return await adminUpload("/createTeam", data, "POST");
}
export async function updateTeamMember(id, data) {
  return await adminUpload(`/editTeamDetails/${id}`, data, "PATCH");
}
export async function deleteTeamMember(id) {
  return await adminFetch(`/deleteTeamDetails/${id}`, { method: "DELETE" });
}

// ---- Testimonials ----
export async function getTestimonials(page = 1, limit = 7) {
  return await adminFetch(`/getAlltestiomonail?page=${page}&limit=${limit}`);
}
export async function createTestimonial(data) {
  return await adminUpload("/createTestimonial", data, "POST");
}
export async function updateTestimonial(id, data) {
  return await adminUpload(`/editTestiominial/${id}`, data, "PATCH");
}
export async function deleteTestimonial(id) {
  return await adminFetch(`/deleteTestiomonial/${id}`, { method: "DELETE" });
}

// ---- Gallery ----
export async function getGalleryImages() {
  return await adminFetch("/gallery");
}
export async function uploadGalleryImage(data) {
  return await adminUpload("/gallery", data);
}
export async function updateGalleryImage(id, data) {
  return await adminUpload(`/gallery/${id}`, data, "PUT");
}
export async function deleteGalleryImage(id) {
  return await adminFetch(`/gallery/${id}`, { method: "DELETE" });
}

// ---- About ----
export async function getAbout() {
  return await adminFetch("/about");
}
export async function getAllAbout(page = 1, limit = 14) {
  return await adminFetch(`/getAllAbout?page=${page}&limit=${limit}`);
}
export async function createAbout(data) {
  return await adminFetch("/createAbout", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
export async function editAbout(id, data) {
  return await adminFetch(`/editAbout/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
export async function deleteAbout(id) {
  return await adminFetch(`/deleteAbout/${id}`, { method: "DELETE" });
}

// ---- Contact Messages (read only from admin) ----
export async function getMessages(page = 1, limit = 14) {
  return await adminFetch(`/getMessageDetails?page=${page}&limit=${limit}`);
}
export async function deleteMessage(id) {
  return await adminFetch(`/deleteMessageDetails/${id}`, { method: "DELETE" });
}

// ---- Dashboard stats ----
export async function getDashboardStats() {
  return await adminFetch("/dashboard");
}
