let totalValue = 0;

let stockList = document.getElementById("stockList")

let addButton = document.getElementById("addButton");

addButton.onclick = function() {

    let stockName = document.getElementById("stockName").value;
    let shares = document.getElementById("shares").value;
    let price = document.getElementById("price").value;

    let value = shares * price;

    totalValue = totalValue + value;

    let listItem = document.createElement("li");

    listItem.innerText = stockName + " - " + shares + " shares - $" + price;

    stockList.appendChild(listItem);

    document.getElementById("totalValue").innerText =
        "Total Value: $" + totalValue;
}