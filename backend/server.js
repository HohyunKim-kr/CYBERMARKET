require("dotenv").config(); // 🔐 .env 환경변수 불러오기

const express = require("express");
const axios = require("axios");
const app = express();

const API_KEY = process.env.API_KEY;
const BASE_URL = process.env.BASE_URL;
const PORT = process.env.PORT || 3000;

// CORS 허용 설정
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// API 요청 경로들
app.get("/api/all-data", async (req, res) => {
  try {
    const endpoints = [
      { name: "cryptoMap", url: `${BASE_URL}v1/cryptocurrency/map` },
      { name: "cryptoLatest", url: `${BASE_URL}v1/cryptocurrency/listings/latest?limit=100` },
      { name: "cryptoQuotes", url: `${BASE_URL}v1/cryptocurrency/quotes/latest?symbol=BTC,ETH` },
      { name: "exchangeMap", url: `${BASE_URL}v1/exchange/map` },
      { name: "exchangeLatest", url: `${BASE_URL}v1/exchange/listings/latest?limit=5` },
      { name: "globalMetrics", url: `${BASE_URL}v1/global-metrics/quotes/latest` },
      { name: "priceConversion", url: `${BASE_URL}v1/tools/price-conversion?amount=1&symbol=BTC&convert=KRW` },
      { name: "trendingLatest", url: `${BASE_URL}v1/cryptocurrency/trending/latest?limit=5` },
    ];

    const fetchPromises = endpoints.map(async (endpoint) => {
      try {
        const response = await axios.get(endpoint.url, {
          headers: { "X-CMC_PRO_API_KEY": API_KEY }
        });
        return { [endpoint.name]: response.data };
      } catch (error) {
        console.error(`❌ Error in ${endpoint.name}:`, error.message);
        return { [endpoint.name]: { error: error.message } };
      }
    });

    const results = await Promise.all(fetchPromises);
    const data = results.reduce((acc, curr) => ({ ...acc, ...curr }), {});
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
