async function getToken(): Promise<string> {
  const res = await fetch("/api/token", {
    method: "GET",
    credentials: "same-origin",
  });
  if (!res.ok) throw new Error("Gagal mendapatkan token keamanan.");
  const { token } = await res.json();
  return token;
}

export async function securePost(url: string, body: unknown): Promise<Response> {
  const token = await getToken();
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-request-token": token,
    },
    credentials: "same-origin",
    body: JSON.stringify(body),
  });
}

export async function securePatch(url: string, body: unknown): Promise<Response> {
  const token = await getToken();
  return fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "x-request-token": token,
    },
    credentials: "same-origin",
    body: JSON.stringify(body),
  });
}

export async function secureDelete(url: string, body: unknown): Promise<Response> {
  const token = await getToken();
  return fetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "x-request-token": token,
    },
    credentials: "same-origin",
    body: JSON.stringify(body),
  });
}
