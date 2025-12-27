import csv
import random
from datetime import datetime, timedelta

# Configuration
NUM_ROWS = 1000
FILENAME = "sales_data.csv"

# Mock Data
products = {
    "Electronics": [("Laptop", 1200), ("Headphones", 150), ("Smartphone", 800), ("Monitor", 300)],
    "Furniture": [("Chair", 120), ("Desk", 250), ("Bookshelf", 90)],
    "Office Supplies": [("Binder", 5), ("Pen Set", 15), ("Paper Ream", 8)]
}
regions = ["North", "South", "East", "West"]

def generate_date():
    start_date = datetime(2025, 1, 1)
    end_date = datetime(2025, 12, 31)
    delta = end_date - start_date
    random_days = random.randrange(delta.days)
    return (start_date + timedelta(days=random_days)).strftime("%Y-%m-%d")

print(f"Generating {NUM_ROWS} rows of sales data...")

with open(FILENAME, mode='w', newline='') as file:
    writer = csv.writer(file)
    # Header
    writer.writerow(["date", "category", "product", "region", "quantity", "unit_price", "total_sales"])

    for _ in range(NUM_ROWS):
        category = random.choice(list(products.keys()))
        product_name, base_price = random.choice(products[category])
        
        # Add some price variance (e.g. discounts)
        unit_price = round(base_price * random.uniform(0.9, 1.1), 2)
        quantity = random.randint(1, 10)
        total_sales = round(unit_price * quantity, 2)
        region = random.choice(regions)
        date = generate_date()

        writer.writerow([date, category, product_name, region, quantity, unit_price, total_sales])

print(f"Success! Data saved to {FILENAME}")