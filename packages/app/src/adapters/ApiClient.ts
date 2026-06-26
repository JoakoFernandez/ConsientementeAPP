const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3001/api";

async function request(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || "API Error");
  }
  if (res.status === 204) return;
  return res.json();
}

export const api = {
  patients: {
    list: (search?: string) => request(`/patients${search ? `?search=${search}` : ""}`),
    get: (id: string) => request(`/patients/${id}`),
    create: (data: any) => request("/patients", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: any) => request(`/patients/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) => request(`/patients/${id}`, { method: "DELETE" }),
  },
  sessions: {
    list: (from?: string, to?: string) => request(`/sessions?from=${from || ""}&to=${to || ""}`),
    create: (data: any) => request("/sessions", { method: "POST", body: JSON.stringify(data) }),
    complete: (id: string) => request(`/sessions/${id}/complete`, { method: "PATCH" }),
    cancel: (id: string) => request(`/sessions/${id}/cancel`, { method: "PATCH" }),
  },
  payments: {
    list: (params?: { from?: string; to?: string; patientId?: string }) => {
      const q = new URLSearchParams(params as any).toString();
      return request(`/payments?${q}`);
    },
    create: (data: any) => request("/payments", { method: "POST", body: JSON.stringify(data) }),
    markPaid: (id: string) => request(`/payments/${id}/paid`, { method: "PATCH" }),
    exportCSV: (from?: string, to?: string) =>
      request(`/payments/export/csv?from=${from || ""}&to=${to || ""}`),
  },
  sync: {
    push: (operations: any[]) => request("/sync/push", { method: "POST", body: JSON.stringify({ operations }) }),
    pull: (since?: string) => request(`/sync/pull?since=${since || ""}`),
  },
};
