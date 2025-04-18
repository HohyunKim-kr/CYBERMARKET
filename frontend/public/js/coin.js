function formatNumber(num) {
    return Number(num).toLocaleString("en-US", { maximumFractionDigits: 2 });
  }
  
  const container = document.getElementById('coin-detail');
  const coinJSON = localStorage.getItem("selectedCoin");
  
  if (coinJSON) {
    try {
      const coin = JSON.parse(coinJSON);
      const usd = coin.quote?.USD;
  
      container.innerHTML = `
        <h1>
          <img src="https://s2.coinmarketcap.com/static/img/coins/64x64/${coin.id}.png"
               width="32" height="32" style="vertical-align:middle;margin-right:10px;">
          ${coin.name} (${coin.symbol})
        </h1>
        <div class="detail-row"><span class="label">Price:</span> $${formatNumber(usd.price)}</div>
        <div class="detail-row"><span class="label">Market Cap:</span> $${formatNumber(usd.market_cap)}</div>
        <div class="detail-row"><span class="label">Market Cap Dominance:</span> ${usd.market_cap_dominance?.toFixed(2)}%</div>
        <div class="detail-row"><span class="label">Volume (24h):</span> $${formatNumber(usd.volume_24h)}</div>
        <div class="detail-row"><span class="label">Change 1h:</span> ${usd.percent_change_1h.toFixed(2)}%</div>
        <div class="detail-row"><span class="label">Change 24h:</span> ${usd.percent_change_24h.toFixed(2)}%</div>
        <div class="detail-row"><span class="label">Change 7d:</span> ${usd.percent_change_7d.toFixed(2)}%</div>
        <div class="detail-row"><span class="label">Change 30d:</span> ${usd.percent_change_30d?.toFixed(2)}%</div>
        <div class="detail-row"><span class="label">Change 60d:</span> ${usd.percent_change_60d?.toFixed(2)}%</div>
        <div class="detail-row"><span class="label">Change 90d:</span> ${usd.percent_change_90d?.toFixed(2)}%</div>
        <div class="detail-row"><span class="label">Circulating Supply:</span> ${formatNumber(coin.circulating_supply)} ${coin.symbol}</div>
        <div class="detail-row"><span class="label">Total Supply:</span> ${formatNumber(coin.total_supply)}</div>
        <div class="detail-row"><span class="label">Max Supply:</span> ${formatNumber(coin.max_supply)}</div>
        <div class="detail-row"><span class="label">Last Updated:</span> ${coin.last_updated}</div>
        <div class="detail-row"><span class="label">Tags:</span><br>
          ${coin.tags?.map(tag => `<span class="tag">${tag}</span>`).join(" ")}
        </div>
      `;
  
      // 실 데이터 기반 가격 차트 생성 (7d 퍼센트 변동을 사용)
      const percent7d = usd.percent_change_7d / 100;
      const base = usd.price;
      const prices = [];
      for (let i = 6; i >= 0; i--) {
        const factor = 1 + (percent7d / 6) * i; // 선형 감소/증가
        prices.push(base / factor);
      }
  
      const ctx = document.getElementById("price-chart").getContext("2d");
      document.getElementById("chart-container").style.display = "block";
  
      new Chart(ctx, {
        type: "line",
        data: {
          labels: ["6d ago", "5d", "4d", "3d", "2d", "1d", "Today"],
          datasets: [{
            label: `${coin.name} Price`,
            data: prices.reverse(),
            borderColor: "#00ffea",
            backgroundColor: "transparent",
            tension: 0.2
          }]
        },
        options: {
          plugins: {
            legend: { labels: { color: '#00ffea' } }
          },
          scales: {
            x: { ticks: { color: '#00ffea' } },
            y: { ticks: { color: '#00ffea' } }
          }
        }
      });
  
    } catch (e) {
      container.innerHTML = `<h1>❌ 코인 데이터를 로드하지 못했습니다.</h1>`;
      console.error(e);
    }
  } else {
    container.innerHTML = `<h1>❌ 선택한 코인 정보가 없습니다.<br><a href="/index.html" style="color:#ff00c8">메인 페이지로</a></h1>`;
  }