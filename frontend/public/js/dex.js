let dexListingsInfoData = [];

async function fetchDexData() {
  try {
    const res = await fetch("hhttps://cybermarket.onrender.com/api/all-data"); 
    if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
    const data = await res.json();

    dexListingsInfoData = data.dexListingsInfo?.data || [];
    renderQuotes(data.dexListingsQuotes?.data || []);
    renderNetworks(data.dexNetworks?.data || []);

  } catch (err) {
    console.error("❌ 데이터 로딩 실패:", err);
    document.body.innerHTML += `<p class="error">❌ 데이터를 불러오는 중 오류 발생: ${err.message}</p>`;
  }
}

function renderQuotes(quotes) {
  const section = document.getElementById("dex-quotes");
  let html = `<h2>📈 DEX Listings Quotes</h2>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>DEX</th>
          <th>거래쌍 수</th>
          <th>24h 거래량 (USD)</th>
          <th>24h 트랜잭션 수</th>
        </tr>
      </thead>
      <tbody>`;

  quotes.slice(0, 20).forEach((dex, idx) => {
    const q = dex.quote?.[0] || {};
    html += `
      <tr data-id="${dex.id}">
        <td>${idx + 1}</td>
        <td>${dex.name || 'N/A'}</td>
        <td>${dex.num_market_pairs || 'N/A'}</td>
        <td>$${Number(q.volume_24h || 0).toLocaleString()}</td>
        <td>${Number(q.num_transactions_24h || 0).toLocaleString()}</td>
      </tr>`;
  });

  html += "</tbody></table>";
  section.innerHTML = html;

  document.querySelectorAll('#dex-quotes tr').forEach(row => {
    row.addEventListener('click', () => {
      const dexId = row.getAttribute('data-id');
      const dexInfo = dexListingsInfoData.find(info => info.id == dexId);
      if (dexInfo) {
        showModal(dexInfo);
      } else {
        showModal({ name: row.querySelector('td:nth-child(2)').textContent, slug: 'N/A', status: 'N/A', date_launched: 'N/A', notice: '정보 없음' });
      }
    });
  });
}

function renderNetworks(networks) {
  const section = document.getElementById("dex-networks");
  if (!Array.isArray(networks) || networks.length === 0) {
    section.innerHTML = `<h2>🛰️ DEX Networks</h2><p class="error">❌ 네트워크 정보 없음</p>`;
    return;
  }

  let html = `<h2>🛰️ DEX Networks</h2>
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>이름</th>
          <th>슬러그</th>
        </tr>
      </thead>
      <tbody>`;

  networks.slice(0, 20).forEach(net => {
    html += `
      <tr>
        <td>${net.id || 'N/A'}</td>
        <td>${net.name || 'N/A'}</td>
        <td>${net.network_slug || 'N/A'}</td>
      </tr>`;
  });

  html += "</tbody></table>";
  section.innerHTML = html;
}

function showModal(data) {
  const modal = document.getElementById("modal");
  const body = document.getElementById("modal-body");
  body.innerHTML = `
    <h3>${data.name || 'N/A'}</h3>
    <p><strong>Slug:</strong> ${data.slug || 'N/A'}</p>
    <p><strong>Status:</strong> ${data.status || 'N/A'}</p>
    <p><strong>Launched:</strong> ${data.date_launched?.split("T")[0] || "N/A"}</p>
    <p><strong>Notice:</strong> ${data.notice || "없음"}</p>
    <p><strong>웹사이트:</strong> ${
      data.urls?.website?.[0]
        ? `<a href="${data.urls.website[0]}" target="_blank">${data.urls.website[0]}</a>`
        : "없음"
    }</p>`;
  modal.style.display = "flex";
}

function closeModal() {
  document.getElementById("modal").style.display = "none";
}

window.onload = fetchDexData;