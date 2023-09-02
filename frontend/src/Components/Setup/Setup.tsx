// Signup.tsx
import React, { useState } from "react";
import styles from "./Setup.module.scss";
import { useNavigate } from "react-router-dom";

interface SignupProps {
  onSignup: (email: string, username: string, password: string) => Promise<boolean>;
}

const Signup: React.FC<SignupProps> = ({ onSignup }) => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const sinupSuccessful = await onSignup(username, password, email);
    if (sinupSuccessful) {
      navigate('/bank-overview');
    } else {
      alert('Signup Failed. Please check your email or username and password.');
    }
  };

  return (
    <div className={styles.SignupPage}>
          <h1 className={`${styles.SignupTitle} SignupTitle`}>Create An Account</h1>
          
    <form onSubmit={handleSubmit} className={styles.Signup}>
      <label>
        Email:
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>
      <label>
        Username:
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
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
      <button type="submit">Sign up</button>
    </form>
    </div>
  );
};

export default Signup;
