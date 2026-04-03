import React, { useState } from "react";
import { generateBanner } from "../services/bannerService";

const BannerGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  console.log(imageUrl);
  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    setImageUrl("");

    try {
      const { imageUrl } = await generateBanner(prompt);
      setImageUrl(imageUrl);
    } catch (err) {
      console.error("Banner generation error:", err.message);
      setError("Failed to generate banner. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto text-center">
      <h2 className="text-xl font-bold mb-4">Generate Event Banner</h2>

      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter banner description..."
        className="w-full border rounded p-2 mb-3"
      />

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? "Generating..." : "Generate Banner"}
      </button>

      {error && <p className="text-red-500 mt-3">{error}</p>}

      {imageUrl && (
        <div className="mt-4">
          <img
            src={imageUrl}
            alt="Generated Banner"
            className="rounded shadow-lg w-full"
          />
        </div>
      )}
    </div>
  );
};

export default BannerGenerator;
