const BACKEND_URL = "https://cybermarket.onrender.com/api/all-data";
const CACHE_KEY = "coinMarketCapData";
const CACHE_DURATION = 10 * 60 * 1000;
let currentPage = 1;
const itemsPerPage = 10;
let allCoins = [];

function isCacheValid() {
  const cached = localStorage.getItem(CACHE_KEY);
  if (!cached) return false;
  const { timestamp } = JSON.parse(cached);
  return Date.now() - timestamp < CACHE_DURATION;
}

function getCachedData() {
  const cached = localStorage.getItem(CACHE_KEY);
  return cached ? JSON.parse(cached).data : null;
}

async function fetchDashboardData() {
  try {
    const response = await fetch(BACKEND_URL);
    const data = await response.json();
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }));
    renderDashboard(data);
  } catch (e) {
    console.error("데이터 불러오기 실패:", e);
  }
}

function renderDashboard(data) {
  const global = data.globalMetrics.data;
  document.getElementById("market-cap").textContent = `$${formatNumber(global.quote.USD.total_market_cap)}`;
  const change = global.quote.USD.total_market_cap_yesterday_percentage_change;
  const changeEl = document.getElementById("market-cap-change");
  changeEl.textContent = `${change.toFixed(2)}%`;
  changeEl.className = `change ${change >= 0 ? 'positive' : 'negative'}`;
  document.getElementById("btc-dominance").textContent = `${global.btc_dominance.toFixed(1)}%`;
  document.getElementById("eth-dominance").textContent = `${global.eth_dominance.toFixed(1)}%`;
  document.getElementById("fear-greed").textContent = `${Math.floor(Math.random()*100)}/100`;
  drawGauge("btc-gauge", global.btc_dominance);
  drawGauge("eth-gauge", global.eth_dominance);

  if (data.cryptoLatest && data.cryptoLatest.data) {
    allCoins = data.cryptoLatest.data;
    renderTable();
    renderPagination();
  }
}

function renderTable() {
  const tbody = document.getElementById("crypto-table");
  tbody.innerHTML = "";
  const start = (currentPage - 1) * itemsPerPage;
  const coins = allCoins.slice(start, start + itemsPerPage);

  coins.forEach((coin, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${start + index + 1}</td>
      <td>
        <a href="./coin.html?symbol=${coin.symbol}" 
          style="color:#00ffea;text-decoration:underline;"
          onclick='localStorage.setItem("selectedCoin", JSON.stringify(${JSON.stringify(coin)}))'>
          ${coin.name} (${coin.symbol})
        </a>
      </td>
      <td>$${formatNumber(coin.quote.USD.price)}</td>
      <td class="change ${coin.quote.USD.percent_change_1h >= 0 ? 'positive' : 'negative'}">${coin.quote.USD.percent_change_1h.toFixed(2)}%</td>
      <td class="change ${coin.quote.USD.percent_change_24h >= 0 ? 'positive' : 'negative'}">${coin.quote.USD.percent_change_24h.toFixed(2)}%</td>
      <td class="change ${coin.quote.USD.percent_change_7d >= 0 ? 'positive' : 'negative'}">${coin.quote.USD.percent_change_7d.toFixed(2)}%</td>
      <td>$${formatNumber(coin.quote.USD.market_cap)}</td>
      <td>$${formatNumber(coin.quote.USD.volume_24h)}</td>
      <td>${formatNumber(coin.circulating_supply)} ${coin.symbol}</td>
    `;
    tbody.appendChild(row);
  });
}

function renderPagination() {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";
  const totalPages = Math.ceil(allCoins.length / itemsPerPage);
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    if (i === currentPage) btn.classList.add("active");
    btn.onclick = () => {
      currentPage = i;
      renderTable();
      renderPagination();
    };
    pagination.appendChild(btn);
  }
}

function drawGauge(canvasId, percent) {
  const ctx = document.getElementById(canvasId).getContext("2d");
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ["Used", "Remaining"],
      datasets: [{
        data: [percent, 100 - percent],
        backgroundColor: ["#00ffea", "#111"],
        borderWidth: 0
      }]
    },
    options: {
      cutout: '80%',
      plugins: { legend: { display: false } },
      animation: false
    }
  });
}

function formatNumber(num) {
  return Number(num).toLocaleString("en-US", { maximumFractionDigits: 2 });
}

window.onload = () => {
  if (isCacheValid()) {
    renderDashboard(getCachedData());
  } else {
    fetchDashboardData();
  }
};

window.onbeforeunload = () => {
  localStorage.removeItem(CACHE_KEY);
};