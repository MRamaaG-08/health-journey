const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export async function fetchHealthDashboardData() {
  try {
    const response = await fetch(`${API_BASE_URL}/dashboard`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
    return null;
  }
}

// React review R-06: Promise.all rejects as soon as any one request fails, so a
// single failing endpoint blanked the timeline, calendar, documents, family and
// emergency cards all at once. allSettled keeps every section that did load.
async function getJSON(path) {
  const response = await fetch(`${API_BASE_URL}${path}`);
  if (!response.ok) throw new Error(`HTTP ${response.status} on ${path}`);
  return response.json();
}

export async function fetchExtraDashboardData() {
  const paths = ['/timeline', '/calendar', '/documents', '/family', '/emergency'];
  const results = await Promise.allSettled(paths.map(getJSON));

  const fallbacks = [[], [], [], [], { contacts: [] }];
  const [timeline, calendar, documents, family, emergency] = results.map((result, i) => {
    if (result.status === 'fulfilled') return result.value;
    console.error(`Failed to load ${paths[i]}:`, result.reason);
    return fallbacks[i];
  });

  return { timeline, calendar, documents, family, emergency };
}

export async function uploadMedicalDocument(file) {
  const formData = new FormData();
  formData.append('file', file);
  try {
    const response = await fetch(`${API_BASE_URL}/documents/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) throw new Error('Failed to upload document');
    return await response.json();
  } catch (error) {
    console.error('Document upload error:', error);
    throw error;
  }
}

// Absolute URL of a document's file, served through the controlled backend
// route rather than a predictable path inside the uploads folder.
export function getDocumentContentUrl(id) {
  return `${API_BASE_URL}/documents/${id}/content`;
}

export async function deleteMedicalDocument(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/documents/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete document');
    return await response.json();
  } catch (error) {
    console.error('Document delete error:', error);
    throw error;
  }
}

// React review R-03: neither helper checked response.ok, so a 400, 404 or 500
// resolved normally and the caller treated a failure as a success. The UI then
// showed a state the server had not accepted.
async function postJSON(path, body) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }
  return data;
}

export async function toggleMedicationAPI(id) {
  return postJSON('/medication/toggle', { id });
}

export async function toggleFocusTaskAPI(id) {
  return postJSON('/focus/update', { id });
}

export async function sendAIBobQuery(promptText) {
  try {
    const response = await fetch(`${API_BASE_URL}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: promptText }),
    });
    if (!response.ok) throw new Error('Failed to fetch AI response');
    const data = await response.json();
    return data.reply;
  } catch (error) {
    console.error('AI backend unreachable:', error);
    return "I can't reach the Health Journey backend right now, so I can't read your record. Please check the server is running and try again.";
  }
}