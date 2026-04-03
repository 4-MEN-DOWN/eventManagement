import axios from "axios";

export const generateBanner = async (prompt) => {
  const response = await axios.post(
    "http://localhost:5000/api/v1/banner/generate",
    { prompt }
  );
  return response.data;
};
