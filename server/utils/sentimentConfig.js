import Sentiment from "sentiment";
import { Filter } from "bad-words"; // ✅ Named import

const sentiment = new Sentiment();
const filter = new Filter(); // ✅ Now this works

// Custom dictionary for sentiment
export const customWords = {
  fantastic: 5,
  fine: 0,
  best: 4,
  great: 3,
  good: 2,
  terrible: -5,
  awesome: 4,
  boring: -3,
  amazing: 5,
  worst: -5,
  average: 0,
};

// Analyze text for sentiment and toxicity
export const analyzeText = (text) => {
  const sentimentResult = sentiment.analyze(text, { extras: customWords });

  // Check for toxicity
  const isToxic = filter.isProfane(text);

  return {
    score: sentimentResult.score,
    isToxic,
  };
};
