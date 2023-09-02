import React, { useState, useEffect } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { Link } from 'react-router-dom';

Chart.register(...registerables);

const ColorBox: React.FC<{ color: string }> = ({ color }) => {
  return (
    <div
      style={{
        backgroundColor: color,
        width: '20px',
        height: '20px',
        marginRight: '5px',
      }}
    />
  );
};

const CategoryBar: React.FC<{ data: any }> = ({ data }) => {
  const total = data.datasets[0].data.reduce((accumulator: number, currentValue: number) => accumulator + currentValue);
  const categoryWidths = data.datasets[0].data.map((amount: number) => (amount / total) * 100);

  return (
    <div style={{ display: 'flex', width: '90%', margin: '20px auto' }}>
      {data.labels.map((label: string, index: number) => (
        <div
          key={label}
          style={{
            backgroundColor: data.datasets[0].backgroundColor[index],
            width: `${categoryWidths[index]}%`,
            height: '20px',
            display: 'inline-block',
          }}
        />
      ))}
    </div>
  );
};

const CategoryTable: React.FC<{ data: any; }> = ({ data }) => {
  const total = data.datasets[0].data.reduce((accumulator: number, currentValue: number) => accumulator + currentValue);
  
  return (
    <table>
      <thead>
        <tr>
          <th>Category</th>
          <th>Amount</th>
          <th>Percentage</th>
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
                  <ColorBox color={data.datasets[0].backgroundColor[index]} />
                  <Link to={`/detailedspendanalysis?category=${encodeURIComponent(label)}`}
                  style={{ color: "white" }} // Change link color to white
                  >{label}</Link>
                </div>
              </td>
              <td>${amount.toFixed(2)}</td>
              <td>{percentage}%</td>
            </tr>
          );
        })}
        <tr>
          <td><strong>Total</strong></td>
          <td><strong>${total.toFixed(2)}</strong></td>
          <td></td>
        </tr>
      </tbody>
    </table>
  );
};

const SpendAnalysis: React.FC = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [chartData, setChartData] = useState<any>(null);
  const [period, setPeriod] = useState('1');

  useEffect(() => {
    const currentDate = new Date();
    const startDate = new Date();
  
    if (period === 'all') {
      startDate.setTime(0); // Set the start date to the UNIX epoch (January 1, 1970)
    } else {
      startDate.setMonth(currentDate.getMonth() - parseInt(period));
    }
  
    setStartDate(startDate.toISOString().slice(0, 10));
    setEndDate(currentDate.toISOString().slice(0, 10));
  }, [period]);

  useEffect(() => {
    if (startDate && endDate) {
      fetchData();
    }
  }, [startDate, endDate]); // Add period to the dependency array

  useEffect(() => {
    const currentDate = new Date();
    const startDate = new Date();
  
    if (period === 'all') {
      startDate.setTime(0); // Set the start date to the UNIX epoch (January 1, 1970)
    } else {
      startDate.setMonth(currentDate.getMonth() - parseInt(period));
    }
  
    setStartDate(startDate.toISOString().slice(0, 10));
    setEndDate(currentDate.toISOString().slice(0, 10));
  }, [period]);
  

  const fetchData = async () => {
  try {
    const response = await fetch(`/api/dbTransactions?start_date=${startDate}&end_date=${endDate}`);
    const data = await response.json();
    const categories = new Map<string, number>();
    let totalAmount = 0; // Initialize a variable to store the total amount of transactions

    data.transactions.forEach((transaction: any) => {
      const categoryName = transaction.category[0];
      const amount = transaction.amount;

      // Only consider transactions with a negative amount (spending)
      if (amount > 0) {
        if (categories.has(categoryName)) {
          categories.set(categoryName, categories.get(categoryName)! + Math.abs(amount));
        } else {
          categories.set(categoryName, Math.abs(amount));
        }
        totalAmount += Math.abs(amount); // Update the total amount with the current transaction amount
      }
    });

    console.log('Total amount of transactions:', totalAmount); // Log the total amount of transactions

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
  } catch (error) {
    console.error('Error fetching transactions:', error);
  }
};

  
  const options = {
    plugins: {
      legend: {
        display: true,
        position: 'top' as 'top' | 'bottom' | 'left' | 'right',
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const total = context.dataset.data.reduce((accumulator: number, currentValue: number) => accumulator + currentValue);
            const value = context.parsed;
            const percentage = ((value / total) * 100).toFixed(2);
            return `${context.label}: $${value.toFixed(2)} (${percentage}%)`;
          },
        },
      },
    },
  };
  

  const handleChartTypeChange = (type: 'pie' | 'bar') => {
    setChartType(type);
  };

  const chartStyle = {
    width: '25%', // Set the desired width
    height: '25%', // Set the desired height
    margin: '25px auto 0', // Center the chart and add space between the buttons
  };

  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');

  return (
    <div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <h1>Spend Analysis</h1>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <label htmlFor="period" style={{ marginRight: '5px' }}>Period:</label>
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
        <div style={{ marginTop: '20px' }}>
          <button onClick={() => handleChartTypeChange('pie')}>
            Show Pie Chart
          </button>
          <button onClick={() => handleChartTypeChange('bar')}>
            Show Bar Chart
          </button>
        </div>
      </div>
      {chartData && (
        <div style={chartStyle}>
          {chartType === 'pie' && <Pie data={chartData} options={options} />}
          {chartType === 'bar' && <Bar data={chartData} options={options} />}
        </div>
      )}
      {chartData && (
        <div
          style={{
            border: '1px solid #ccc',
            borderRadius: '25px',
            padding: '20px',
            display: 'flex',
            justifyContent: 'center',
            flexDirection: 'column',
            alignItems: 'center',
            width: '50%',
            margin: '20px auto',
          }}
        >
          <CategoryBar data={chartData} />
          <CategoryTable data={chartData} />
        </div>
      )}
    <div style={{ textAlign: 'center', marginTop: '20px' }}>
      <Link to="/bank-overview">
            <button>Go to Bank Overview</button>
          </Link>
      <Link to="/budget">
            <button>Go to Budget Creator</button>
          </Link>        
      </div>
    </div>
  );
};

export default SpendAnalysis;