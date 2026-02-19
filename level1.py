# Stock portfolio Tracker Level 1 

stock_name = input("Enter stock name: ")
price = float(input("Enter price per share: "))
shares = int(input("Enter number of shares: "))

total_value = price * shares

print("\n--- Stock Summary ---")
print("Stock:", stock_name)
print("Price per share: $", price)
print("Number of shares:", shares)
print("Total value: $", total_value)