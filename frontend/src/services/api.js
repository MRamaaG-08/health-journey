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

export async function fetchExtraDashboardData() {
  try {
    const [timeline, calendar, documents, family, emergency] = await Promise.all([
      fetch(`${API_BASE_URL}/timeline`).then(res => res.json()),
      fetch(`${API_BASE_URL}/calendar`).then(res => res.json()),
      fetch(`${API_BASE_URL}/documents`).then(res => res.json()),
      fetch(`${API_BASE_URL}/family`).then(res => res.json()),
      fetch(`${API_BASE_URL}/emergency`).then(res => res.json())
    ]);
    return { timeline, calendar, documents, family, emergency };
  } catch (error) {
    console.error('Failed to fetch extra data:', error);
    return { timeline: [], calendar: [], documents: [], family: [], emergency: { contacts: [] } };
  }
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

export async function toggleMedicationAPI(id) {
  const response = await fetch(`${API_BASE_URL}/medication/toggle`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id })
  });
  return await response.json();
}

export async function toggleFocusTaskAPI(id) {
  const response = await fetch(`${API_BASE_URL}/focus/update`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id })
  });
  return await response.json();
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