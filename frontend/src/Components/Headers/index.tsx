import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Callout from "plaid-threads/Callout";
import Button from "plaid-threads/Button";
import InlineLink from "plaid-threads/InlineLink";
import Link from "../Link";
import { Link as RouterLink } from 'react-router-dom'; // Rename the imported Link to avoid naming conflicts
import Context from "../../Context";
import styles from "./index.module.scss";
//import getStartedImage from '/assets/piggybank.png';
///Users/felipe/Documents/GitHub/senior-project-spring-2023-interactive-banking/assets/piggybank.png
import getStartedImage from './piggybank-nb.png';


const Header = () => {
  const [isLinkSuccess, setIsLinkSuccess] = useState(false);
  const navigate = useNavigate();

  const goToBankOverview = () => {
    navigate("/bank-overview");
  };

  useEffect(() => {
    if (isLinkSuccess) {
      goToBankOverview();
    }
  }, [isLinkSuccess]);

  const resetLinkSuccess = () => {
    setIsLinkSuccess(false);
  };

  return (
    <div className={`${styles.grid} ${styles.centerContent}`}>
      <h1 className={styles.title}>Take Control of Your Finances</h1>
      <div style={{ marginTop: '-30px' }}>
      <p style={{ marginBottom: '0', color: '#888888' }}>
          View a deeper insight into your spending habits and stay on top of your financial life
        </p>
      </div>      {!isLinkSuccess ? (
        <>
          <div className={`${styles.linkButton} ${styles.centerText}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Link onSuccess={() => setIsLinkSuccess(true)} className={styles.roundedButton} />
          </div>
        </>
      ) : (
        <>
          <h4 className={styles.subtitle}>
            Congrats! Your account has been connected.
          </h4>
          <div className={styles.linkButton}>
            <Button large onClick={resetLinkSuccess}>
              Add another account
            </Button>
          </div>
        </>
      )}
      <img src={getStartedImage} alt="Get Started" className={styles.image} style={{ width: '300px', height: '300px' }} />

      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <RouterLink to="/bank-overview">
          <button>Go to Bank Overview</button>
        </RouterLink>
        <RouterLink to="/spending-analysis">
          <button>Go to Spending Analysis</button>
        </RouterLink>
        <RouterLink to="/budget">
          <button>Go to Budget Planner</button>
        </RouterLink>
      </div>
    </div>
  );
};

Header.displayName = "Header";

export default Header;