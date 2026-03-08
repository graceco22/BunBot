import { NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-brand">🐇 BunBot</div>
      <div className="nav-links">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/stroller">Stroller</NavLink>
        <NavLink to="/run">Run</NavLink>
        <NavLink to="/training">Training</NavLink>
        <NavLink to="/history">History</NavLink>
      </div>
    </nav>
  );
}
