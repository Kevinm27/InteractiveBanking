from pymongo import MongoClient
def get_database():
 
   # Provide the mongodb atlas url to connect python to mongodb using pymongo
   CONNECTION_STRING = "mongodb+srv://root:bank123@bankcluster.kclb6xi.mongodb.net/test"
    #CONNECTION_STRING = "mongodb+srv://fmartinez8:eh5c789hhFPxcQDK@clustertest.jr4fxoq.mongodb.net/test"
   # Create a connection using MongoClient. You can import MongoClient or use pymongo.MongoClient
   client = MongoClient(CONNECTION_STRING)
 
   # Create the database for our example (we will use the same database throughout the tutorial
   return client['bank_data']
  
# This is added so that many files can reuse the function get_database()
if __name__ == "__main__":   
  
   # Get the database
   dbname = get_database()