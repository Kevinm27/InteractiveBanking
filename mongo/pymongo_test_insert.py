from pymongo_get_database import get_database
import json

dbname = get_database()
filepath = '/Users/felipe/Documents/GitHub/senior-project-spring-2023-interactive-banking/mongo/data.json'

collection_name = dbname["JSON_DATA"]

with open(filepath) as f:
    data = json.load(f)

collection_name.insert_one(data)