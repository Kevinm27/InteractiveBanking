import React, { useState } from "react";
import styles from "./Login.module.scss";
import { useNavigate } from "react-router-dom";

interface LoginProps {
  onLogin: (identifier: string, password: string) => Promise<any>;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const loginResult = await onLogin(identifier, password);
    if (loginResult.success) {
      navigate('/bank-overview');
    } else if (loginResult.message === 'Invalid access token') {
      navigate(`/headers?bank=${encodeURIComponent(loginResult.bankName)}`);
    } else {
      alert('Login failed. Please check your email or username and password.');
    }
  };

  return (
    <div className={styles.LoginPage}>
      <h1 className={styles.LoginTitle}>Welcome Interactive Banking</h1>
      <form onSubmit={handleSubmit} className={styles.Login}>
        <label>
          Email/Username:
          <input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />
        </label>
        <label>
          Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <button type="submit">Log in</button>
      </form>
    </div>
  );
};
    
  

export default Login;
