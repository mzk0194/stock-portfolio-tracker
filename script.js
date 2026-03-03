let stocks = [];

let stockList = document.getElementById("stockList");
let addButton = document.getElementById("addButton");

function renderStocks() {
    stockList.innerHTML = "";

    let total = 0;

    stocks.forEach(function(stock, index) {

        total += stock.shares * stock.price;

        let listItem = document.createElement("li");
        listItem.innerText =
            stock.name + " - " +
            stock.shares + " shares - $" +
            stock.price + " ";

        let deleteButton = document.createElement("button");
        deleteButton.innerText = "Delete";

        deleteButton.onclick = function() {
            stocks.splice(index, 1);
            renderStocks();
        };

        listItem.appendChild(deleteButton);
        stockList.appendChild(listItem);
    });

    document.getElementById("totalValue").textContent =
        "Total Value: $" + total;

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
        price: price
    });

    renderStocks();

    document.getElementById("stockName").value = "";
    document.getElementById("shares").value = "";
    document.getElementById("price").value = "";

};

let savedStocks = localStorage.getItem("stocks");

if (savedStocks) {
    stocks = JSON.parse(savedStocks);
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
                stock.price = parseFloat(newPrice);

            } else {
                console.log("API limit reached or invalid symbol");
            }

        } catch (error) {
            console.error("Update error:", error);
        }

    }

    renderStocks();
}

//setInterval(updatePrices, 60000);