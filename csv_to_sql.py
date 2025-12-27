import csv

input_file = 'sales_data.csv'
output_file = 'seed_data.sql'

print("Converting CSV to SQL inserts...")

with open(input_file, 'r') as csvfile, open(output_file, 'w') as sqlfile:
    reader = csv.DictReader(csvfile)
    
    # NOTE: We removed "BEGIN TRANSACTION" here for Remote D1 compatibility
    
    for row in reader:
        sql = f"INSERT INTO sales (date, category, product, region, quantity, unit_price, total_sales) VALUES ('{row['date']}', '{row['category']}', '{row['product']}', '{row['region']}', {row['quantity']}, {row['unit_price']}, {row['total_sales']});\n"
        sqlfile.write(sql)
        
    # NOTE: We removed "COMMIT" here
    
print(f"Done! Created {output_file}.")