import { useState } from "react";

export function Home() {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [error, setError] = useState("");

  // Simulate shortening URL
  const handleShorten = () => {
    if (!url) {
      setError("Please enter a valid URL");
      setShortUrl("");
      return;
    }
    setError("");
    // Mock shortened URL
    const randomCode = Math.random().toString(36).substring(2, 8);
    setShortUrl(`https://short.ly/${randomCode}`);
  };

  return (
    <div className="min-h-screen flex flex-col justify-start items-center bg-bg text-text p-4 md:p-6 overflow-hidden transition-colors duration-500">
      <p className="mb-4 text-text-light text-center">Paste your long URL below:</p>
      <div className="flex flex-col md:flex-row gap-4 w-full max-w-lg">
        <input
          type="text"
          placeholder="Enter your URL..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1 px-4 py-2 border border-border rounded-md bg-bg text-text focus:outline-none focus:ring-2 focus:ring-primary transition-colors duration-200 truncate"
        />
        <button
          onClick={handleShorten}
          className="px-6 py-2 rounded-md bg-primary text-white hover:bg-secondary transition-colors duration-200"
        >
          Shorten
        </button>
      </div>

      {error && <p className="mt-4 text-red-500">{error}</p>}

      {shortUrl && (
        <div className="mt-6 p-4 border border-border rounded-md bg-bg flex flex-col md:flex-row items-center justify-between gap-2 w-full max-w-lg ">
          <span className="break-all">{shortUrl}</span>
          <button
            className="px-4 py-1 rounded-md bg-secondary text-white hover:bg-primary transition-colors duration-200"
            onClick={() => navigator.clipboard.writeText(shortUrl)}
          >
            Copy
          </button>
        </div>
      )}
    </div>
  );
}
