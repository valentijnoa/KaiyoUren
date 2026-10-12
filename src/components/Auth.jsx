import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";

const ERRORS = {
  "auth/invalid-credential": "Onjuist e-mailadres of wachtwoord",
  "auth/invalid-email": "Ongeldig e-mailadres",
  "auth/user-not-found": "Onjuist e-mailadres of wachtwoord",
  "auth/wrong-password": "Onjuist e-mailadres of wachtwoord",
  "auth/too-many-requests": "Te veel pogingen, probeer het later opnieuw",
};

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { currentUser, login } = useAuth();
  const navigate = useNavigate();

  if (currentUser) return <Navigate to="/" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(ERRORS[err.code] || "Inloggen mislukt");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-container">
      <h2>Inloggen</h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>E-mail:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Wachtwoord:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit" disabled={busy}>Inloggen</button>
      </form>
    </div>
  );
}
