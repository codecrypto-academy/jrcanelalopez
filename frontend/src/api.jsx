const API_URL = import.meta.env.VITE_API_URL;

export async function fetchBloque(bloque) {
  console.log(`${API_URL}/bloque/${bloque.queryKey[1]}`);
  return fetch(`${API_URL}/bloque/${bloque.queryKey[1]}`).then((response) => {
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.json();
  });
}

export async function fetchTransaction(tx) {
  return fetch(`${API_URL}/tx/${tx.queryKey[1]}`).then((response) => {
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.json();
  });
}

export async function fetchBalance(address) {
  return fetch(`${API_URL}/balance/${address.queryKey[1]}`).then((response) => {
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.text(); // Balance is returned as plain text
  });
}

export async function fetchCurrentBlockNumber() {
  return fetch(`${API_URL}/bloque`).then((response) => {
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.text(); // Block number is returned as plain text
  });
}
