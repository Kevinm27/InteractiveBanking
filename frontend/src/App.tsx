import React, { useCallback, useContext, useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import "./App.module.scss";
import Login from "./Components/Login/Login";
import Setup from "./Components/Setup/Setup";
import Header from "./Components/Headers/index";
import Context from "./Context";
import Products from "./Components/ProductTypes/Products"; 
import Items from "./Components/ProductTypes/Items"
import BankOverview from './Components/BankOverview/BankOverview';
import SpendingAnalysis from './Components/SpendingAnalysis/SpendingAnalysis';
import SpendAnalysis from './Components/SpendAnalysis/SpendAnalysis';
import DetailedSpendAnalysis from './Components/DetailedSpendAnalysis/DetailedSpendAnalysis';

import Endpoint from "./Components/Endpoint";
import Budget from "./Components/Budget/Budget";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const { linkSuccess, isItemAccess, isPaymentInitiation, dispatch } = useContext(Context);
  
  const handleLogin = async (identifier: string, password: string) => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emailOrUsername: identifier, password }),
      });
  
      console.log('Response:', response);
  
      const data = await response.json();
      console.log('Data:', data);
  
      if (response.ok && data.success) {
        console.log('Logged in successfully');
        setIsLoggedIn(true);
        return { success: true, message: data.message };
      } else {
        console.error('Login failed:', data.message);
        return { success: false, message: data.message, bankName: data.bankName };
      }
    } catch (error) {
      console.error('Error:', error);
      return { success: false, message: 'Error occurred during login' };
    }
  };

  const handleSignup = async (username: string, password: string, email: string) => {
    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, email }),
      });

      const data = await response.json();
      if (data.success) {
        console.log('User created successfully');
        setIsSignedIn(true);
        return true;
        // Redirect to a protected route or update the app state
      } else {
        console.error('Signup failed:', data.message);
        return false;
      }
    } catch (error) {
      console.error('Error:', error);
      return false;
    }

  };

  const getInfo = useCallback(async () => {
    const response = await fetch("/api/info", { method: "POST" });
    if (!response.ok) {
      dispatch({ type: "SET_STATE", state: { backend: false } });
      return { paymentInitiation: false };
    }
    const data = await response.json();
    const paymentInitiation: boolean = data.products.includes(
      "payment_initiation"
    );
    dispatch({
      type: "SET_STATE",
      state: {
        products: data.products,
        isPaymentInitiation: paymentInitiation,
      },
    });
    return { paymentInitiation };
  }, [dispatch]);

  const generateToken = useCallback(
    async (isPaymentInitiation) => {
      // Link tokens for 'payment_initiation' use a different creation flow in your backend.
      const path = isPaymentInitiation
        ? "/api/create_link_token_for_payment"
        : "/api/create_link_token";
      const response = await fetch(path, {
        method: "POST",
      });
      if (!response.ok) {
        dispatch({ type: "SET_STATE", state: { linkToken: null } });
        return;
      }
      const data = await response.json();
      if (data) {
        if (data.error != null) {
          dispatch({
            type: "SET_STATE",
            state: {
              linkToken: null,
              linkTokenError: data.error,
            },
          });
          return;
        }
        dispatch({ type: "SET_STATE", state: { linkToken: data.link_token } });
      }
      // Save the link_token to be used later in the Oauth flow.
      localStorage.setItem("link_token", data.link_token);
    },
    [dispatch]
  );

  useEffect(() => {
    const init = async () => {
      const { paymentInitiation } = await getInfo(); // used to determine which path to take when generating token
      // do not generate a new token for OAuth redirect; instead
      // setLinkToken from localStorage
      if (window.location.href.includes("?oauth_state_id=")) {
        dispatch({
          type: "SET_STATE",
          state: {
            linkToken: localStorage.getItem("link_token"),
          },
        });
        return;
      }
      generateToken(paymentInitiation);
    };
    init();
  }, [dispatch, generateToken, getInfo]);
  return (
    <Router>
      <div>
        <Routes>
          <Route
            path="/"
            element={
              isLoggedIn ? (
                <Navigate to="/bank-overview" />
              ) : (
                <>
                  {showLogin ? (
                    <Login onLogin={handleLogin} />
                  ) : (
                    <Setup onSignup={handleSignup} />
                  )}
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <button onClick={() => setShowLogin(true)}>Login</button>
                    <button onClick={() => setShowLogin(false)}>Setup</button>
                  </div>
                </>
              )
            }
          />
          <Route path="headers" element={<Header />} />
          <Route path="bank-overview" element={<BankOverview />} />
          <Route path="spend-analysis" element={<SpendAnalysis />} />
          <Route path="spending-analysis" element={<SpendingAnalysis />} />
          <Route path="products" element={<Products />} />
          <Route path="items" element={<Items />} />
          <Route path="detailedspendanalysis" element={<DetailedSpendAnalysis />} />
          <Route path="budget" element={<Budget/>} />

        </Routes>
      </div>
    </Router>
  );
}  


export default App;