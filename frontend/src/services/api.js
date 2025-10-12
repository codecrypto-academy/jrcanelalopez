import axios from "axios";

const API_BASE = process.env.REACT_APP_BACKEND_URL || "http://localhost:3001";

export async function getWalletData(address, chainId) {
  // chainId comes like 0x1; backend expects maybe hex or decimal; we pass as-is
  const params = new URLSearchParams({ address, chain: chainId });
  const { data } = await axios.get(
    `${API_BASE}/getTokens?${params.toString()}`
  );
  return data;
}
