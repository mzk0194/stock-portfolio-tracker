let editIndex = null;
let stocks = [];

let stockList = document.getElementById("stockList");
let addButton = document.getElementById("addButton");
let cancelEditButton = document.getElementById("cancelEditButton");
let sortHigh = document.getElementById("sortHigh");
let sortLow = document.getElementById("sortLow");
let getPriceButton = document.getElementById("getPriceButton");

// =====================
// Render Function
// =====================
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

        // Delete Button
        let deleteButton = document.createElement("button");
        deleteButton.innerText = "Delete";

        deleteButton.onclick = function() {
            stocks.splice(index, 1);
            renderStocks();
        };

        // Edit Button
        let editButton = document.createElement("button");
        editButton.innerText = "Edit";

        editButton.onclick = function(){

            document.getElementById("stockName").value = stock.name;
            document.getElementById("shares").value = stock.shares;
            document.getElementById("price").value = stock.buyPrice;

            editIndex = index;
            addButton.innerText = "Update Stock";
            cancelEditButton.style.display = "inline";
        };

        listItem.appendChild(deleteButton);
        listItem.appendChild(editButton);
        stockList.appendChild(listItem);
    });

    // =====================
    // Total Calculation
    // =====================

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

// =====================
// Add / Update Stock
// =====================

addButton.onclick = function() {

    let stockName = document.getElementById("stockName").value.toUpperCase();
    let shares = parseFloat(document.getElementById("shares").value);
    let price = parseFloat(document.getElementById("price").value);

    if (!stockName || isNaN(shares) || isNaN(price)) {
        alert("Please enter valid stock name and numbers");
        return;
    }

    if (editIndex === null){

        stocks.push({
            name: stockName,
            shares: shares,
            buyPrice: price,
            currentPrice: price
        });

    } else {

        stocks[editIndex].name = stockName;
        stocks[editIndex].shares = shares;
        stocks[editIndex].buyPrice = price;
        stocks[editIndex].currentPrice = price;

        editIndex = null;
        addButton.innerText = "Add Stock";
        cancelEditButton.style.display = "none";
    }

    renderStocks();

    document.getElementById("stockName").value = "";
    document.getElementById("shares").value = "";
    document.getElementById("price").value = "";
};

// =====================
// Cancel Edit
// =====================

cancelEditButton.onclick = function(){

    editIndex = null;

    document.getElementById("stockName").value = "";
    document.getElementById("shares").value = "";
    document.getElementById("price").value = "";

    addButton.innerText = "Add Stock";
    cancelEditButton.style.display = "none";
}

// =====================
// Get Current Price (API)
// =====================

getPriceButton.onclick = async function () {

    let stockName = document.getElementById("stockName").value;

    if (!stockName) {
        alert("Enter stock symbol (ex: AAPL)");
        return;
    }

    try {

        let response = await fetch(
            `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${stockName}&apikey=demo`
        );

        let data = await response.json();

        if (data["Global Quote"] && data["Global Quote"]["05. price"]) {

            let price = parseFloat(data["Global Quote"]["05. price"]);
            document.getElementById("price").value = price.toFixed(2);

        } else {

            console.log(data);
            alert("API limit reached or invalid symbol");

        }

    } catch (error) {

        console.error(error);
        alert("Failed to fetch price");

    }

};

// =====================
// Auto Update Prices
// =====================

async function updatePrices() {

    for (let stock of stocks) {

        try {

            let response = await fetch(
                'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${stock.name}&apikey=KKLH053PKHQ6Q3P6');

            let data = await response.json();

            if (data["Global Quote"] && data["Global Quote"]["05. price"]) {

                stock.currentPrice = parseFloat(data["Global Quote"]["05. price"]);

            }

        } catch (error) {

            console.log("Update error", error);

        }

    }

    renderStocks();
}

// =====================
// Load LocalStorage
// =====================

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

// =====================
// Sort Functions
// =====================

sortHigh.onclick = function() {

    stocks.sort(function(a, b) {

        let profitA = (a.currentPrice - a.buyPrice) * a.shares;
        let profitB = (b.currentPrice - b.buyPrice) * b.shares;

        return profitB - profitA;

    });

    renderStocks();
};

sortLow.onclick = function() {

    stocks.sort(function(a, b) {

        let profitA = (a.currentPrice - a.buyPrice) * a.shares;
        let profitB = (b.currentPrice - b.buyPrice) * b.shares;

        return profitA - profitB;

    });

    renderStocks();
};

// 100초마다 가격 업데이트
// (무료 API는 제한 있음)
setInterval(updatePrices, 100000);