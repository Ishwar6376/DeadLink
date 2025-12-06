import { useAuth } from "@clerk/clerk-react";

export const useApi = () => {
  const { getToken } = useAuth();
  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const callProtected = async (path: string) => {
    const token = await getToken(); // Clerk session token

    const res = await fetch(`${baseUrl}${path}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });

    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  };

  return { callProtected };
};
