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