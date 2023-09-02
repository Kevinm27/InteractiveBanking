import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './BankOverview.scss';

interface Transaction {
  account_id: string;
  date: string;
  transaction_id: number;
  name: string;
  amount: number;
}

interface BankAccount {
  itemId: string;
  institutionName: string;
  account_id: string;
  type: string;
  subtype: string;
}


const BankOverview: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dbTransactions, setDbTransactions] = useState<Transaction[]>([]);
  const [selectedBank, setSelectedBank] = useState<string>('ALL');
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [selectedAccountType, setSelectedAccountType] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 20;
  const [balances, setBalances] = useState<any[]>([]);
  const [totalTransactions, setTotalTransactions] = useState(0);

  const navigate = useNavigate();

  const fetchBalances = async () => {
    try {
      const response = await fetch('/api/balance');
      if (response.ok) {
        const data = await response.json();
        setBalances(data);
        console.log("Balances state:", data);
      } else {
        console.error(`Error: ${response.status} - ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error fetching balances:', error);
    }
  };
  
  

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/transactions');
      if (response.ok) {
        const data = await response.json();
        console.log('Latest transactions:', data.latest_transactions);
      } else {
        console.error(`Error: ${response.status} - ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchDbTransactions = async () => {
  try {
    const response = await fetch('/api/dbTransactionsFiltered', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bankName: selectedBank,
        accountType: selectedAccountType,
        pageNumber: currentPage,
        transactionsPerPage,
      }),
    });
    const data = await response.json();
    console.log(data);
    if (data.transactions) {
      setDbTransactions(data.transactions);
    } else {
      console.error('DB Transactions not found in the fetched data');
    }

    if (data.totalTransactions) {
      setTotalTransactions(data.totalTransactions);
    } else {
      console.error('Total transactions not found in the fetched data');
    }

    if (data.bankAccounts) {
      const fetchedBankAccounts = data.bankAccounts.flatMap(
        (bankAccount: any) => bankAccount.accounts.map((account: BankAccount) => ({
          ...account,
          institutionName: bankAccount.institutionName,
        })),
    );

  setBankAccounts(fetchedBankAccounts);
  console.log("Fetched bankAccounts:", fetchedBankAccounts);
} else {
  console.error('Bank accounts not found in the fetched data');
}

    
  } catch (error) {
    console.error('Error fetching DB transactions:', error);
  }
};

const getTotalBalance = () => {
  let totalBalance = 0;

  for (const balanceData of balances) {
    const bankAccount = bankAccounts.find(
      (account) => account.account_id === balanceData.account_id
    );

    if (!bankAccount) {
      continue;
    }

    const bankNameMatches =
      selectedBank === "ALL" || bankAccount.institutionName === selectedBank;
    const accountTypeMatches =
      selectedAccountType === "ALL" || bankAccount.subtype === selectedAccountType;

    if (bankNameMatches && accountTypeMatches) {
      console.log("sdf" + selectedBank + balanceData.balances.current);
      totalBalance += balanceData.balances.current;
    }
  }

  return totalBalance;
};

  const getBalance = (accountId: string) => {
    const balanceData = balances.find((balance) => balance.account_id === accountId);
    return balanceData ? balanceData.balances.current : 0;
  };

  useEffect(() => {
    fetchBalances();
  }, []);
  

  useEffect(() => {
    fetchDbTransactions();
    console.log("fetchDbTransactions called with selectedBank:", selectedBank, "selectedAccountType:", selectedAccountType, "currentPage:", currentPage);
  }, [selectedBank, selectedAccountType, currentPage]);


  const handleBankChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBank(event.target.value);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };
  

  const handleAccountTypeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedAccountType(event.target.value);
  };

  const getBankName = (accountId: string) => {
    const bankAccount = bankAccounts.find(
      (account) => account.account_id === accountId,
    );
    return bankAccount ? bankAccount.institutionName : '';
  };

  const loadTransactions = () => {
    fetchTransactions();
  };

  const getUniqueBankNames = (): string[] => {
    const bankNames = bankAccounts.map(
      (bankAccount) => bankAccount.institutionName,
    );
    return Array.from(new Set(bankNames));
  };
  const numberOfPages = Math.ceil(totalTransactions / transactionsPerPage);


  return (
    <div
      style={{
        backgroundColor: '#f0f0f0', // Desired background color
        minHeight: '135vh', // Ensure it covers the full height of the viewport
      }}
    >
      <div
    style={{
      backgroundColor: '#f0f0f0' // Change the backgroundColor here to light gray
    }}
    >
    <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#4e89ae' // Change the backgroundColor here to blue
        }}
      >
          <h1 style={{ color: 'white' }}>Bank Overview</h1> 
      </div>
    <div className="bank-overview">
        <div className="filters">
        <div className="filter">
          <label style={{ color: '#4e89ae' }}>
            Bank:
            <select value={selectedBank} onChange={handleBankChange}>
              <option value="ALL">All</option>
              {getUniqueBankNames().map((bankName, index) => (
                <option key={index} value={bankName}>
                  {bankName}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="filter">
          <label style={{ color: '#4e89ae' }}>
            Account Type:
            <select value={selectedAccountType} onChange={handleAccountTypeChange}>
              <option value="ALL">All</option>
              <option value="checking">Checking</option>
              <option value="savings">Savings</option>
            </select>
          </label>
        </div>
      </div>
      
    <h2 style={{ color: '#4e89ae' }}>
    <div className="balance-text">
      Total balance: $ <span>{getTotalBalance()}</span>
    </div>
    <h2 style={{ color: '#4e89ae' }}>Bank Transactions</h2>
    </h2>
      <div className="pagination">
        <label style={{ color: '#4e89ae', marginRight: '10px' }}>Page:</label>
        {Array.from({ length: numberOfPages }, (_, i) => (
          <button
            key={i}
            onClick={() => handlePageChange(i + 1)}
            disabled={i + 1 === currentPage}
          >
            {i + 1}
          </button>
        ))}
      </div>
      <div
        style={{
          border: '1px solid #4e89ae',
          borderRadius: '25px',
          padding: '20px',
          display: 'flex',
          justifyContent: 'center',
          flexDirection: 'column',
          alignItems: 'center',
          width: '70%',
          margin: '20px auto',
        }}
      >
      <table
      >
        <thead>
          <tr>
            <th style={{ color: '#4e89ae' }}>Date</th>
            <th style={{ color: '#4e89ae' }}>Name</th>
            <th style={{ color: '#4e89ae' }}>Bank</th>
            <th style={{ color: '#4e89ae' }}>Type</th>
            <th style={{ color: '#4e89ae' }}>Amount</th>
          </tr>
        </thead>
        <tbody>

          {dbTransactions.map((transaction, index) => {
            const bankAccount = bankAccounts.find(
              (account) => account.account_id === transaction.account_id);
            const accountType = bankAccount ? bankAccount.subtype : '';
            console.log('Account ID:', transaction.account_id, 'Bank Account:', bankAccount, 'Account Type:', accountType);
            const bankName = getBankName(transaction.account_id);
            return (
              <tr key={index}>
                <td style={{ color: 'black' }}>{transaction.date}</td>
                <td style={{ color: 'black' }}>{transaction.name}</td>
                <td style={{ color: 'black' }}>{bankName}</td>
                <td style={{ color: 'black' }}>{accountType}</td>
                <td style={{ color: 'black' }}>{transaction.amount}</td>
              </tr> 
            );
          })}
        </tbody>
      </table>
      </div>
      <div className="navigation-buttons">
        <Link to="/headers">
          <button>Add a Bank Account</button>
        </Link>
        <Link to="/spending-analysis">
          <button>Go to Spend Analysis</button>
        </Link>
        <Link to="/budget">
            <button>Go to Budget Planner</button>
          </Link> 
      </div>
      <button onClick={loadTransactions}>Save Transactions Into Database</button>
    </div>
    </div>
    </div>
  );
};
export default BankOverview;