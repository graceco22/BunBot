import { NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-brand">BunBot</div>
      <div className="nav-links">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/pacer">Pacer</NavLink>
        <NavLink to="/run">Run</NavLink>
        <NavLink to="/insights">Insights</NavLink>
        <NavLink to="/training">Training</NavLink>
      </div>
    </nav>
  );
}
