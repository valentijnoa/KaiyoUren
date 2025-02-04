// components/Navbar.jsx
import { useAuth } from "../context/AuthContext";
import { Link, NavLink } from "react-router-dom";

const Navbar = () => {
  const { currentUser, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="nav-left">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `nav-link ${isActive ? "active-nav-link" : ""}`
          }
        >
          Uren Registratie
        </NavLink>
        <NavLink
          to="/employees"
          className={({ isActive }) =>
            `nav-link ${isActive ? "active-nav-link" : ""}`
          }
        >
          Medewerkers
        </NavLink>
      </div>
      <div className="nav-right">
        {currentUser ? (
          <>
            <span className="user-email">{currentUser.email}</span>
            <button onClick={logout} className="logout-button">
              Uitloggen
            </button>
          </>
        ) : (
          <Link to="/login" className="login-button">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
