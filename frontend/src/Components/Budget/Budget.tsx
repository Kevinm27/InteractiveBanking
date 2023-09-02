import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';


const categoryColors = [
  '#FF6384',
  '#36A2EB',
  '#FFCE56',
  '#82E0AA',
  '#F1948A',
  '#BB8FCE',
  '#85C1E9',
  '#F7DC6F',
  '#AED6F1',
  '#E59866',
];

const CategoryTable: React.FC<{ data: any; }> = ({ data }) => {
  const total = data.datasets[0].data.reduce((accumulator: number, currentValue: number) => accumulator + currentValue);
  
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
      {data.labels.map((label: string, index: number) => {
          const amount = data.datasets[0].data[index];
          const percentage = ((amount / total) * 100).toFixed(2);
          return (
            <tr key={label}>
              <td>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Link to={`/detailedspendanalysis?category=${encodeURIComponent(label)}`}
                  style={{ color: categoryColors[index % categoryColors.length] }}
                  >{label}</Link>
                </div>
              </td>
              <td style={{ color: 'black' }}>${amount.toFixed(2)}</td>
              <td style={{ color: 'black' }}>{percentage}%</td>
            </tr>
          );
        })}
        <tr>
          <td style={{ color: 'black' }}><strong>Total</strong></td>
          <td style={{ color: 'black' }}><strong>${total.toFixed(2)}</strong></td>
          <td></td>
        </tr>
      </tbody>
    </table>
  );
};

const BudgetTotal: React.FC = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);
  const [budget, setBudget] = useState(0);
  const percentageSpent = budget ? (totalAmount / budget) * 100 : 0;
  const currentDate = new Date();
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const [chartData, setChartData] = useState<any>(null);

  const isWithinPastMonth = (transactionDate: string) => {
    const transactionDateTime = new Date(transactionDate).getTime();
    const pastMonthStart = new Date(currentDate);
    pastMonthStart.setMonth(pastMonthStart.getMonth() - 1);
    const pastMonthStartTime = pastMonthStart.getTime();

    return transactionDateTime >= pastMonthStartTime;
  };



  useEffect(() => {
    const currentDate = new Date();
    const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, currentDate.getDate());

    setStartDate(startDate.toISOString().slice(0, 10));
    setEndDate(currentDate.toISOString().slice(0, 10));
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      fetchData();
    }
  }, [startDate, endDate]);

  const fetchData = async () => {
  try {
    const response = await fetch('/api/dbTransactions');
    const data = await response.json();
    const categories = new Map<string, number>();

    data.transactions.forEach((transaction: any) => {
      const categoryName = transaction.category[0];
      const amount = transaction.amount;

      if (amount > 0) {
        if (isWithinPastMonth(transaction.date)) { // Add this line
          if (categories.has(categoryName)) {
            categories.set(categoryName, categories.get(categoryName)! + Math.abs(amount));
          } else {
            categories.set(categoryName, Math.abs(amount));
          }
        } // Add this line
      }
    });

  const sortedCategories = Array.from(categories.entries()).sort((a, b) => b[1] - a[1]);
  setChartData({
      labels: sortedCategories.map(([label]) => label),
      datasets: [
        {
          label: 'Spend by Category',
          data: sortedCategories.map(([, amount]) => amount),
          backgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#82E0AA',
            '#F1948A',
            '#BB8FCE',
            '#85C1E9',
            '#F7DC6F',
            '#AED6F1',
            '#E59866',
          ],
        },
      ],
    });
    setTotalAmount(Array.from(categories.values()).reduce((a, b) => a + b, 0));
  } catch (error) {
    console.error('Error fetching transactions:', error);
  }
  };
  

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBudget(Number(e.target.value));
  };
  const remainingBudget = budget - totalAmount;


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
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#4e89ae' // Change the backgroundColor here to blue

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
            <h1 style={{ color: 'white' }}>Monthly Budget Planner</h1> 
        </div>
        
      </div>
      
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <label htmlFor="budget" style={{ color: '#4e89ae' }}>Enter your budget:</label>
        <input
          type="text"
          id="budget"
          pattern="[0-9]*"
          value={budget}
          onChange={handleBudgetChange}
          style={{ width: '100px', height: '20px', marginLeft: '5px', background:'lightgray', color:'black' }}
          />
      </div>
      
      {/* Dial and categories container */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginTop: '20px',
        backgroundColor: 'transparent',
        border: '0px solid white',
        borderRadius: '15px',
        padding: '20px'
      }}>

      {/* Dial Component Container */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '10px',
        padding: '20px',
        boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.2)',
        width: '300px',
        marginRight: '10px',
        border: '1px solid #4e89ae', // Add this line to set the border color

      }}>

      {/* Dial Component */}
      <div>
        <CircularProgressbar
          value={percentageSpent}
          maxValue={100}
          text={`${percentageSpent.toFixed(2)}% Spent`}
          styles={buildStyles({
            textSize: '10px',
            strokeLinecap: 'round',
            pathColor: `rgba(62, 152, 199, 1)`,
            textColor: '#4e89ae',
            trailColor: 'gray',
          })}
        />
        <p style={{ textAlign: 'center', color: '#4e89ae' }}>
          Day {currentDate.getDate()} / {lastDayOfMonth}
        </p>
        <p style={{ textAlign: 'center', margin: '10px 0', color:'black' }}>Spent So Far: ${totalAmount.toFixed(2)}</p>
        <p style={{ textAlign: 'center', margin: '10px 0', color: 'black' }}>Remaining Budget: ${remainingBudget.toFixed(2)}</p>


      </div>
    </div>

      {/* Category breakdown */}
      <div style={{
        backgroundColor: '#ffffff', // Add this line to set the background color to white
        borderRadius: '10px',
        padding: '20px',
        boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.2)',
        marginLeft: '10px',
        border: '1px solid #4e89ae', // Add this line to set the border color


      }}>
        <h2 style={{ color: '#4e89ae' }}>Spending by Category</h2>
        {chartData && <CategoryTable data={chartData} />}
      </div>
    </div>

      {/* Links */}
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <Link to="/bank-overview">
          <button>Go to Bank Overview</button>
        </Link>
        <Link to="/spending-analysis">
          <button>Go to Spend Analysis</button>
        </Link>
      </div>
    </div>
    </div>
  );
};

export default BudgetTotal;
