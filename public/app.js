async function fetchDataAndPopulateTable() {
  try {
    const response = await fetch('/get-data');
    const data = await response.json();

    console.log(data); // Check fetched data
    
    const tableBody = document.getElementById('ticker-table-body');
    tableBody.innerHTML = '';

    let bestPrice;
    let bestProfitPercentage;

    data.forEach((item, index) => {
      const rowWrapper = document.createElement('div');
      rowWrapper.classList.add('row-wrapper');
      const row = document.createElement('tr');
      row.style.backgroundColor = '#2E3241';
      row.style.alignItems = 'center';
      row.style.gap = '20px';
      row.style.height = '50px';
      row.style.borderRadius = '20px';

      const serialNumberCell = document.createElement('td');
      serialNumberCell.textContent = index + 1;

      const platformCell = document.createElement('td');
      platformCell.textContent = item.platform;

      const lastPriceCell = document.createElement('td');
      lastPriceCell.textContent =`₹ ${ parseFloat(item.last_price).toFixed(2)}`;

      const priceCell = document.createElement('td');
      priceCell.textContent = `₹ ${parseFloat(item.buy_price).toFixed(2)} / ${parseFloat(item.sell_price).toFixed(2)}`;

      const profit = parseFloat(item.sell_price) - parseFloat(item.buy_price);
      const profitPercentage = (profit / parseFloat(item.buy_price)) * 100;
      const volumeCell = document.createElement('td');
      volumeCell.textContent = `${parseFloat(profitPercentage).toFixed(2)}%`;
      volumeCell.style.color = profit >= 0 ? 'green' : 'red';

      const saving = parseFloat(item.sell_price) - parseFloat(item.buy_price);
      const savingCell = document.createElement('td');
      savingCell.textContent = parseFloat(saving).toFixed(2);
      savingCell.style.color = profit >= 0 ? 'green' : 'red';

      const buyPrice = parseFloat(item.buy_price);
      const sellPrice = parseFloat(item.sell_price);
      const currentPrice = parseFloat(item.last_price);

      if (!bestPrice || (currentPrice - buyPrice) / buyPrice > (bestPrice - buyPrice) / buyPrice) {
        bestPrice = currentPrice;
        bestProfitPercentage = profitPercentage;
        document.querySelector('.price-inr').textContent = `₹ ${bestPrice.toFixed(0)}`;
      }

      row.appendChild(serialNumberCell);
      row.appendChild(platformCell);
      row.appendChild(lastPriceCell);
      row.appendChild(priceCell);
      row.appendChild(volumeCell);
      row.appendChild(savingCell);

      tableBody.appendChild(row);
    });

    console.log('Best price:', bestPrice);
    console.log('Best profit percentage:', bestProfitPercentage);

    if (bestProfitPercentage !== undefined) {
      const bestProfitElement = document.querySelector('.5min');
      if (bestProfitElement) {
        bestProfitElement.textContent = `${bestProfitPercentage.toFixed(2)}%`;
      }
    }
  } catch (error) {
    console.error('Error fetching and populating data:', error);
  }
}

window.onload = fetchDataAndPopulateTable;
