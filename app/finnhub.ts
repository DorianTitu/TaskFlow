import axios from "axios";

const API_KEY = "ct1g1apr01qkcukbqva0ct1g1apr01qkcukbqvag";

const finnhubClient = axios.create({
  baseURL: "https://finnhub.io/api/v1",
  params: { token: API_KEY },
});

export const getQuote = async (symbol: string) => {
  const response = await finnhubClient.get("/quote", {
    params: { symbol },
  });
  return response.data;
};

export const getCompanyInfo = async (symbol: string) => {
  const response = await finnhubClient.get("/stock/profile2", {
    params: { symbol },
  });
  return response.data;
};
