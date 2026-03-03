let stocks = [];

let stockList = document.getElementById("stockList");
let addButton = document.getElementById("addButton");

function renderStocks() {
    stockList.innerHTML = "";

    let totalInvested = 0;
    let totalCurrent = 0;

    stocks.forEach(function(stock, index) {

        let invested = stock.shares * stock.buyPrice;
        let currentValue = stock.shares * stock.currentPrice;
        let profit = currentValue - invested;

        totalInvested += invested;
        totalCurrent += currentValue;

        let listItem = document.createElement("li");

        listItem.innerHTML =
        `<strong>${stock.name}</strong> - 
        ${stock.shares} shares<br>
        Buy: $${stock.buyPrice} | 
        Current: $${stock.currentPrice}<br>
        Profit: <span class="profit">${profit.toFixed(2)}</span>
        `;

        let profitSpan = listItem.querySelector(".profit");

        if (profit > 0) {
            profitSpan.style.color = "green";
        } else if (profit < 0) {
            profitSpan.style.color = "red";
        }

        let deleteButton = document.createElement("button");
        deleteButton.innerText = "Delete";

        deleteButton.onclick = function() {
            stocks.splice(index, 1);
            renderStocks();
        };

        listItem.appendChild(deleteButton);
        stockList.appendChild(listItem);
    });

    // 🔥 전체 계산
    let totalProfit = totalCurrent - totalInvested;
    let totalProfitRate = totalInvested !== 0 
        ? (totalProfit / totalInvested) * 100 
        : 0;

    let totalElement = document.getElementById("totalValue");

    totalElement.innerHTML =
        `Total Invested: $${totalInvested.toFixed(2)} <br>
         Total Value: $${totalCurrent.toFixed(2)} <br>
         Total Profit: <span id="totalProfit">${totalProfit.toFixed(2)} 
         (${totalProfitRate.toFixed(2)}%)</span>`;

    let totalProfitSpan = document.getElementById("totalProfit");

    if (totalProfit > 0) {
        totalProfitSpan.style.color = "green";
    } else if (totalProfit < 0) {
        totalProfitSpan.style.color = "red";
    }

    localStorage.setItem("stocks", JSON.stringify(stocks));
}

addButton.onclick = function() {

    let stockName = document.getElementById("stockName").value;
    let shares = parseFloat(document.getElementById("shares").value);
    let price = parseFloat(document.getElementById("price").value);

    if (!stockName || isNaN(shares) || isNaN(price)) {
        alert("Please enter valid stock name and numbers");
        return;
    }

    stocks.push({
        name: stockName,
        shares: shares,
        buyPrice: price,
        currentPrice: price
    });

    renderStocks();

    document.getElementById("stockName").value = "";
    document.getElementById("shares").value = "";
    document.getElementById("price").value = "";
};

// 🔥 localStorage 불러오기 + 구조 변환 먼저
let savedStocks = localStorage.getItem("stocks");

if (savedStocks) {
    stocks = JSON.parse(savedStocks);

    stocks = stocks.map(stock => {
        if (stock.buyPrice === undefined) {
            stock.buyPrice = stock.price;
            stock.currentPrice = stock.price;
            delete stock.price;
        }
        return stock;
    });

    renderStocks();
}

let getPriceButton = document.getElementById("getPriceButton");

getPriceButton.onclick = async function () {

    let stockName = document.getElementById("stockName").value;

    if (!stockName) {
        alert("Please enter stock symbol (e.g., AAPL)");
        return;
    }

    try {

        let response = await fetch(
            `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${stockName}&apikey=2HXV9OJ3RF4F34VV`
        );

        let data = await response.json();

        if (data["Global Quote"] && data["Global Quote"]["05. price"]) {

            let price = data["Global Quote"]["05. price"];
            document.getElementById("price").value =
                parseFloat(price).toFixed(2);

        } else {
            console.log(data); 
            alert("API limit reached or invalid symbol.");
        }

    } catch (error) {

        console.error("Error:", error);
        alert("Failed to fetch stock price.");

    }

};

async function updatePrices() {

    console.log("업데이트 실행됨");

    for (let stock of stocks) {

        try {

            let response = await fetch(
                `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${stock.name}&apikey=2HXV9OJ3RF4F34VV`
            );

            let data = await response.json();

            if (data["Global Quote"] && data["Global Quote"]["05. price"]) {

                let newPrice = data["Global Quote"]["05. price"];
                stock.currentPrice = parseFloat(newPrice);

            } else {
                console.log("API limit reached or invalid symbol");
            }

        } catch (error) {
            console.error("Update error:", error);
        }

    }

    renderStocks();
}

// API 제한 주의 (무료는 금방 걸림)
//setInterval(updatePrices, 100000);