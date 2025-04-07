require("dotenv").config();
const express = require("express");
const axios = require("axios");
const app = express();

const API_KEY = process.env.API_KEY;
const BASE_URL = process.env.BASE_URL || "https://pro-api.coinmarketcap.com/";
const PORT = process.env.PORT || 3000;

if (!API_KEY) {
  console.error("❌ API_KEY is missing in .env file");
  process.exit(1);
}

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.get("/api/all-data", async (req, res) => {
  try {
    const headers = {
      "X-CMC_PRO_API_KEY": API_KEY,
      "User-Agent": "CoinDashboard/1.0"
    };

    // 1. dexListingsQuotes 데이터를 먼저 가져옴
    const dexListingsQuotesResponse = await axios.get(`${BASE_URL}v4/dex/listings/quotes`, { headers });
    const dexListingsQuotesData = dexListingsQuotesResponse.data.data || [];

    // 2. dexListingsQuotes에서 id 추출 (최대 20개로 제한)
    const dexIds = dexListingsQuotesData
      .slice(0, 20) // 처음 20개만 사용
      .map(dex => dex.id)
      .filter(id => id)
      .join(',');

    // 3. 추출한 id를 기반으로 dexListingsInfo 요청
    const endpoints = [
      // 기본 v1 요청
      { name: "cryptoMap", url: `${BASE_URL}v1/cryptocurrency/map` },
      { name: "cryptoLatest", url: `${BASE_URL}v1/cryptocurrency/listings/latest?limit=100` },
      { name: "cryptoQuotes", url: `${BASE_URL}v1/cryptocurrency/quotes/latest?symbol=BTC,ETH` },
      { name: "globalMetrics", url: `${BASE_URL}v1/global-metrics/quotes/latest` },
      { name: "priceConversion", url: `${BASE_URL}v1/tools/price-conversion?amount=1&symbol=BTC&convert=KRW` },

      // DEX 관련 v4 요청
      { name: "dexListingsQuotes", url: `${BASE_URL}v4/dex/listings/quotes` },
      { name: "dexListingsInfo", url: dexIds ? `${BASE_URL}v4/dex/listings/info?id=${dexIds}` : null },
      { name: "dexNetworks", url: `${BASE_URL}v4/dex/networks/list` }
    ].filter(endpoint => endpoint.url);

    const fetchPromises = endpoints.map(async (endpoint) => {
      try {
        const response = await axios.get(endpoint.url, { headers });
        return { [endpoint.name]: response.data };
      } catch (error) {
        console.error(`❌ Error in ${endpoint.name}:`, error.response?.data?.status?.error_message || error.message);
        return { [endpoint.name]: { error: error.message } };
      }
    });

    const results = await Promise.all(fetchPromises);
    const data = results.reduce((acc, curr) => ({ ...acc, ...curr }), {});
    res.json(data);
  } catch (error) {
    console.error("❌ 전체 API 실패:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});