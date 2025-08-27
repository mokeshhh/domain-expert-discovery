import json
from pymongo import MongoClient

# Connect to MongoDB (edit the URI and DB/collection names as needed)
client = MongoClient('mongodb://localhost:27017/')
db = client['domain_expert_db']
collection = db['experts']

# Load data from JSON file (the one you created earlier)
with open('experts_data.json', 'r', encoding='utf-8') as file:
    experts = json.load(file)

# Insert the experts into the MongoDB collection
result = collection.insert_many(experts)
print(f"Inserted {len(result.inserted_ids)} expert profiles to MongoDB!")
