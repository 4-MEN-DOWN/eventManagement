// controllers/bannerController.js
export const generateBanner = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || prompt.trim() === "") {
      return res.status(400).json({ error: "Prompt is required" });
    }

    // Replace spaces with + for URL encoding
    const encodedPrompt = encodeURIComponent(prompt);

    // Pollinations API URL
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}`;

    res.json({ imageUrl });
  } catch (err) {
    console.error("❌ Banner generation failed:", err.message);
    res.status(500).json({ error: "Failed to generate banner" });
  }
};
