import axios from 'axios';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import styles from './DetailedSpendAnalysis.module.css';


interface SpendingCategoryData {
  category: string;
  amount: number;
}

interface BankAccount {
  itemId: string;
  institutionName: string;
  account_id: string;
  type: string;
  subtype: string;
}

const DetailedSpendAnalysis: React.FC = () => {
  const location = useLocation();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [period, setPeriod] = useState('1');
  const [selectedAccountType, setSelectedAccountType] = useState<string>('');
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<number>(0);
  const [selectedBank, setSelectedBank] = useState<string>('');




  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const category = queryParams.get('category');
    if (category) {
      fetchData(category, period, selectedBank);
    }
  }, [location.search, period, selectedBank]);

  const fetchData = async (category: string, period: string, selectedBank: string) => {
    try {
      const currentDate = new Date();
      const startDate = new Date();
      
  
      if (period === 'all') {
        startDate.setTime(0);
      } else {
        startDate.setMonth(currentDate.getMonth() - parseInt(period));
      }
  
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
  
      const response = await axios.post('/api/dbTransactionsFilteredDetailedSpendAnalysis', {
        bankName: selectedBank,
        accountType: selectedAccountType,
        category: category,
        startDate: startDate,
        endDate: endDate,
        pageNumber: 1,
        transactionsPerPage: 100, // Adjust this value to fetch more transactions if needed
      });
  
      const { transactions, bankAccounts } = response.data;
      console.log('Transactions state:', transactions);


      const uniqueBankAccounts = bankAccounts
      .flatMap((bankAccount: any) =>
        bankAccount.accounts.map((account: BankAccount) => ({
          ...account,
          institutionName: bankAccount.institutionName,
        })),
      )
      .filter(
        (bankAccount: BankAccount, index: number, self: BankAccount[]) =>
          index ===
          self.findIndex(
            (account: BankAccount) =>
              account.institutionName === bankAccount.institutionName,
          ),
      );

setBankAccounts(uniqueBankAccounts);
  
      setTransactions(transactions);
      const total = transactions.reduce(
        (acc: number, transaction: any) => acc + Math.abs(transaction.amount),
        0
      );
      setTotalAmount(total);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const handleBankChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBank(event.target.value);
    console.log('Selected bank:', event.target.value);

  };
  
  const handleAccountTypeChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setSelectedAccountType(event.target.value);
  };
  
  const handleTimePeriodChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setSelectedTimePeriod(Number(event.target.value));
  };
  

  return (
    <div
      style={{
        backgroundColor: '#f0f0f0', // Desired background color
        minHeight: '100vh', // Ensure it covers the full height of the viewport
      }}
    >
    <div
    style={{
      backgroundColor: '#f0f0f0' // Change the backgroundColor here to light gray
    }}
    >
    <div>
    <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#4e89ae' // Change the backgroundColor here to blue
        }}
      >
          <h1 style={{ color: 'white' }}>Detailed Spend Analysis</h1> 
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div>
          <label htmlFor="bank-selector" style={{ color: '#4e89ae' }}>Bank: </label>
          <select id="bank-selector" value={selectedBank} onChange={handleBankChange}>
            <option value="">All Banks</option>
            {bankAccounts.map((bankAccount, index) => (
              <option key={index} value={bankAccount.institutionName}>
                {bankAccount.institutionName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="period" style={{ color: '#4e89ae' }}>Period: </label>
          <select
            id="period"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="1">1 month</option>
            <option value="2">2 months</option>
            <option value="3">3 months</option>
            <option value="all">All Time</option>
          </select>
        </div>
        
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
          width: '30%',
          margin: '20px auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ color: '#4e89ae' }}>Date</th>
                <th style={{ color: '#4e89ae' }}>Name</th>
                <th style={{ color: '#4e89ae' }}>Category</th>
                <th style={{ color: '#4e89ae' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction: any, index: number) => (
                <tr key={index}>
                  <td style={{ color: 'black' }}>{transaction.date}</td>
                  <td style={{ color: 'black' }}>{transaction.name}</td>
                  <td style={{ color: 'black' }}>{transaction.category[0]}</td>
                  <td style={{ color: 'black' }}>${Math.abs(transaction.amount).toFixed(2)}</td>
                </tr>
              ))}
              <tr>
                <td colSpan={3} style={{ textAlign: 'right', fontWeight: 'bold', color: 'black'}}>Total</td>
                <td style={{ fontWeight: 'bold', color: 'black' }}>${totalAmount.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
      <Link to="/bank-overview">
          <button>Go to Bank Overview</button>
        </Link>
        <Link to="/spending-analysis">
          <button>Go to Spend Analysis</button>
        </Link>
        <Link to="/budget">
          <button>Go to Budget Creator</button>
        </Link>
      </div>
    </div>
    </div>
    </div>
  );
};

export default DetailedSpendAnalysis;
