const API_BASE = "/api/flask-proxy";

export const flaskAPI = {
  uploadImage: async (formData: FormData) => {
    const res = await fetch(`${API_BASE}/predict`, { method: "POST", body: formData });
    console.log("Upload Response:", res);
    return res.json();
  },

  connectIoT: async (port?: string) => {
    const res = await fetch(`${API_BASE}/iot/connect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ port }),
    });
    // console.log("IoT Connect Response:", res);
    return res.json();
  },

  getDashboardSummary: async () => {
    const res = await fetch(`${API_BASE}/dashboard/summary`);
    return res.json();
  },
};
