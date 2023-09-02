import { Link } from 'react-router-dom';
import styles from './SpendingAnalysis.module.css';
import React, { useEffect, useState } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import axios from 'axios';
import { Chart } from 'chart.js';
import { ArcElement, PieController } from 'chart.js';

Chart.register(ArcElement, PieController);

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

const SpendAnalysis: React.FC = () => {
  const [spendingData, setSpendingData] = useState<SpendingCategoryData[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [selectedBank, setSelectedBank] = useState<string>('ALL');
  const [selectedAccountType, setSelectedAccountType] = useState<string>('ALL');
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<number>(0);
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');
  const [barChartData, setBarChartData] = useState<SpendingCategoryData[]>([]);


  useEffect(() => {
    const fetchData = async () => {
      const startDate = selectedTimePeriod === 0
      ? null
      : new Date(
          new Date().setMonth(new Date().getMonth() - selectedTimePeriod),
        );
      
      startDate && startDate.setHours(0, 0, 0, 0); // Add this line

      //const endDate = new Date().toISOString();
      const endDate = new Date();
      endDate.setHours(23, 59, 59, 999); // Modify this line

  
      const response = await axios.post('/api/dbTransactionsFilteredSpendAnalysis', {
        bankName: selectedBank,
        accountType: selectedAccountType,
        startDate,
        endDate, // Include the endDate in the request body
        pageNumber: 1,
        transactionsPerPage: 20,
      });

      const { transactions, bankAccounts } = response.data;

      setBankAccounts(
        bankAccounts.flatMap((bankAccount: any) =>
          bankAccount.accounts.map((account: BankAccount) => ({
            ...account,
            institutionName: bankAccount.institutionName,
          })),
        ),
      );

      const spendingCategories: Record<string, number> = {};

      let tempTotal = 0;
      transactions.forEach((transaction: any) => {
        if (transaction.amount >= 0) { // Add this condition to only include transactions with a negative amount
          const category = transaction.category[0];
          const amount = transaction.amount;
      
          if (spendingCategories[category]) {
            spendingCategories[category] += amount;
          } else {
            spendingCategories[category] = amount;
          }
          tempTotal += Math.abs(amount)
        }
      });

      console.log(tempTotal + "irrrr")
      

      const spendingDataArray = Object.entries(spendingCategories)
      .map(([category, amount]) => ({ category, amount: +amount }))
      .sort((a, b) => b.amount - a.amount); 

      
      setSpendingData(spendingDataArray);
      
    };

    fetchData();
  }, [selectedBank, selectedAccountType, selectedTimePeriod]);

  const handleBankChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBank(event.target.value);
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

  const handleChartTypeChange = (type: 'pie' | 'bar') => {
    setChartType(type);
  };

  const getUniqueBankNames = (): string[] => {
    const bankNames = bankAccounts.map(
      (bankAccount) => bankAccount.institutionName,
    );
    return Array.from(new Set(bankNames));
  };

  const getColorByIndex = (index: number): string => {
    const colors = [
      '#FF6384',
      '#36A2EB',
      '#FFCE56',
      '#4BC0C0',
      '#9966FF',
      '#FF9F40',
    ];
    return colors[index % colors.length];
  };
  

  const chartData = {
    labels: spendingData.map((data) => data.category),
    datasets: [
      {
        label: 'Spend by Category',
        data: spendingData.map((data) => data.amount),
        backgroundColor: [ // Modify this array to update the colors for the chart
          '#4e89ae', // Blue
          '#c56183', // Pink
          '#ed6663', // Red
          '#ffa372', // Orange
          '#7dce94', // Green
          '#957fef', // Purple
        ],
      },
    ],
  };
  
  const chartOptions = {
    plugins: {
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const total = context.dataset.data.reduce(
              (accumulator: number, currentValue: number) =>
                accumulator + currentValue,
            );
            const value = context.parsed;
            const percentage = ((value / total) * 100).toFixed(2);
            return `${context.label}: $${value.toFixed(2)} (${percentage}%)`;
          },
        },
      },
      
    },
  };

  const CategoryProgressBar: React.FC = () => {
    const totalAmount = spendingData.reduce((acc, curr) => acc + curr.amount, 0);
  
    return (
      <div className={styles.categoryProgressBar}>
        {spendingData.map((data, index) => {
          const percentage = (data.amount / totalAmount) * 100;
          return (
            <div
              key={data.category}
              className={styles.categoryBar}
              style={{
                width: `${percentage}%`,
                backgroundColor: getColorByIndex(index),
              }}
            >
            </div>
          );
        })}
      </div>
    );
  };
  
  
  const SpendingTable = () => {
    const totalAmount = spendingData.reduce((acc, curr) => acc + curr.amount, 0);

    return (
      <table>
        <thead>
          <tr>
            <th style={{ color: '#4e89ae' }}>Category</th> 
            <th style={{ color: '#4e89ae' }}>Amount</th> 
            <th style={{ color: '#4e89ae' }}>Percentage</th> 
          </tr>
        </thead>
        <tbody>
          {spendingData.map((data, index) => (
            <tr key={data.category}>
              <td>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div
                    style={{
                      backgroundColor: getColorByIndex(index),
                      width: '20px',
                      height: '20px',
                      marginRight: '5px',
                    }}
                  ></div>
                  <Link to={`/detailedspendanalysis?category=${encodeURIComponent(data.category)}`}
                    style={{ color: getColorByIndex(index) }} // Change link color to white
                  >{data.category}</Link>
                </div>
              </td>
              <td style={{ color: 'black' }}>${data.amount.toFixed(2)}</td>
              <td style={{ color: 'black' }}>{((data.amount / totalAmount) * 100).toFixed(2)}%</td>
            </tr>
          ))}
          <tr>
            <td style={{ color: 'black' }}><strong>Total</strong></td>
            <td style={{ color: 'black' }}><strong>${totalAmount.toFixed(2)}</strong></td>

            <td></td>
          </tr>
        </tbody>
      </table>
    );
  };

  return (
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
          <h1 style={{ color: 'white' }}>Spend Analysis</h1> 
      </div>
      
      <div className="filters" style={{ display: 'flex', justifyContent: 'center' }}>
      <div>
        <label htmlFor="bank-selector" style={{ color: '#4e89ae' }}>Bank: </label>
        <select id="bank-selector" style={{ width: '150px' }} value={selectedBank} onChange={handleBankChange}>
          <option value="ALL">All</option>
          {getUniqueBankNames().map((bankName, index) => (
            <option key={index} value={bankName}>
              {bankName}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="account-type-selector" style={{ color: '#4e89ae' }}>Account: </label> 
        <select id="account-type-selector" style={{ width: '150px' }} value={selectedAccountType} onChange={handleAccountTypeChange}>
          <option value="ALL">All</option>
          <option value="checking">Checking</option>
          <option value="savings">Savings</option>
        </select>
      </div>
      <div>
        <label htmlFor="period-selector" style={{ color: '#4e89ae' }}>Period: </label> 
        <select id="period-selector" style={{ width: '150px' }}  value={selectedTimePeriod} onChange={handleTimePeriodChange}>
          <option value={0}>All Time</option>
          <option value={1}>1 Month</option>
          <option value={2}>2 Months</option>
          <option value={3}>3 Months</option>
        </select>
      </div>
    </div>

      <div className="chartbuttons" style={{marginTop: '10px', display: 'flex', justifyContent: 'center' }}>
        <button onClick={() => handleChartTypeChange('pie')}>Show Pie Chart</button>
        <button onClick={() => handleChartTypeChange('bar')}>Show Bar Chart</button>
      </div>
      <div
  style={{
    borderRadius: '5px',
    padding: '10px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '50vw', // Modify the width here
    height: '50vh', // Modify the height here
    margin: '10px auto',
  }}
>
  {chartType === 'pie' ? (
    <Pie data={chartData} options={chartOptions} height={200} width={200} />
  ) : (
    <Bar data={chartData} options={chartOptions} height={200} width={200} />
  )}
</div>

<div
      style={{
        borderRadius: '10px',
        padding: '20px',
        width: '80%', // Modify the width here
        margin: '20px auto',
        border: '1px solid #4e89ae', // Add this line to set the border color
        backgroundColor: '#ffffff' // Add this line to set the background color to white


      }}
    >
      <CategoryProgressBar />

      <SpendingTable />
    </div>

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <Link to="/bank-overview">
          <button>Go to Bank Overview</button>
        </Link>
        <Link to="/budget">
          <button>Go to Budget Planner</button>
        </Link>
      </div>
    </div>
  );
  
  
  
  
};

export default SpendAnalysis;

