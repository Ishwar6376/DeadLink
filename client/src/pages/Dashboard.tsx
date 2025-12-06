import { useState } from "react";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import { useApi } from "../hooks/useApi";

const Dashboard = () => {
  const { callProtected } = useApi();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTest = async () => {
    try {
      setError(null);
      const res = await callProtected("/api/me");
      setData(res);
    } catch (err: any) {
      setError(err.message || "Error");
    }
  };

  return (
    <>
      <SignedIn>
        <div>
          <h2>Dashboard (Protected)</h2>
          <button onClick={handleTest}>Test /api/me</button>

          {data && (
            <pre>{JSON.stringify(data, null, 2)}</pre>
          )}
          {error && <p>{error}</p>}
        </div>
      </SignedIn>

      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
};

export default Dashboard;

