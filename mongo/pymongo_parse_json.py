import json

json_path = '/Users/felipe/Documents/GitHub/senior-project-spring-2023-interactive-banking/mongo/data.json'

with open(json_path) as f:
    data = json.load(f)

for transaction in data['latest_transactions']:
    print(transaction['account_id'])