# Get the database using the method we defined in pymongo_test_insert file
from pymongo_get_database import get_database
from pandas import DataFrame

dbname = get_database()

def printBalance(amountList):
    balanceAmount = 0
    totalSpent = printTotalSpent(amountList)*-1
    totalReceived = printTotalReceived(amountList)
    balanceAmount = totalReceived-totalSpent
    print("Total Balance: ", balanceAmount)

def printTotalSpent(amountList):
    #print("Total Amount Spent")
    #print(amountList)
    tempAmount = 0
    for amount in amountList:
        if amount < 0:
            tempAmount += amount
    
    totalSpent = round(tempAmount, 2)
    print("Total amount spent: ", totalSpent*-1)
    return totalSpent

def printTotalReceived(amountList):
    #print("Total Amount Received:")
    #print(amountList)
    tempAmount = 0
    for amount in amountList:
        if amount > 0:
            tempAmount += amount
    print("Total amount received: ", tempAmount)
    return tempAmount

def printLatestTransactions(latest_transactions):
    print("Total number of transactions: ", len(latest_transactions))

    for transaction in latest_transactions:
        print("Account ID: " + transaction['account_id'])
        print("Transaction ID: " + transaction['transaction_id'])
        print("Amount: ", transaction['amount'])
        for category in transaction['category']:
            print(category)
        print('\n')

def appendAmountList(latest_transactions):
    amountList = []

    for transaction in latest_transactions:
        amountList.append(transaction['amount'] * -1)
    
    return amountList

def countCategories(latest_transactions):
    countOccurences = {'Shopping': 0, 'Bills & Utilities': 0, 'Gas': 0, 'Food and Drink': 0, 'Travel': 0, 'Other': 0}
    
    for transaction in latest_transactions:
        has_category = False
        for category in transaction['category']:
            if category in countOccurences:
                countOccurences[category] += 1
                has_category = True
                break
        if not has_category:
            countOccurences['Other'] += 1
            #print(category)
    return countOccurences

def printCategoryOccurences(countOccurences):
    for category, value in countOccurences.items():
        print("Number of " + category + " transactions: " + str(value))

def printTravel(latest_transactions):
    tempAmount = 0
    for transaction in latest_transactions:
        has_category = False
        for category in transaction['category']:
            #print(category)
            if category in "Payment":
                #print(transaction['amount'])
                tempAmount += transaction['amount']
                #has_category = True
        #print('*'*30)
        tempAmount = tempAmount*-1
    print("Travel Amount: " + str(tempAmount))

def printCategoryBalances(latest_transactions):
    categories = {'Travel': 0, 'Food and Drink': 0, 'Payment': 0, 'Transfer': 0}
    for transaction in latest_transactions:
        has_category = False
        for category in transaction['category']:
            if category in categories and not has_category:
                categories[category] += (transaction['amount'])
    print(categories)
def main():
    # Create a new collection
    collection_name = dbname["transactions"]


    #latest_transactions = collection_name.find_one()["latest_transactions"]
    latest_transactions = list(collection_name.find())

    print('-'*30 + "Starting Code" + '-'*30 + '\n\n')


    printLatestTransactions(latest_transactions)
    amountList = appendAmountList(latest_transactions)
    categoryOccurences = countCategories(latest_transactions)
    
    #printTotalSpent(amountList)
    #printTotalReceived(amountList) 
    printCategoryOccurences(categoryOccurences)
    printBalance(amountList)
    #printTravel(latest_transactions)
    printCategoryBalances(latest_transactions)
    #print(categoryOccurences)
    print('-'*30 + "Ending Code" + '-'*30)

    #print('\n')
   
if __name__ == "__main__":   
    main()