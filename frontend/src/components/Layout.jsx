import { NavLink, Outlet } from "react-router-dom";
import logo from "../assets/logo_name_new.png";

function Layout() {
  const BarHeight = 75;

  const linkBase = {
    color: "black",
    textDecoration: "none",
    fontWeight: 700,
    fontSize: 18,
  };

  return (
    <div>
      {/* Top bar */}
      <header
        style={{
          background: "#ffffff00",
          position: "sticky",
          width: "100%",
          height: BarHeight,
          display: "flex",
          alignItems: "center",
          zIndex: 1000,
          boxShadow: "0 5px 8px rgba(0,0,0,0.2)",
        }}
      >
        {/* Inner container */}
        <div
          style={{
            width: "100%",
            padding: "0 24px",
            boxSizing: "border-box",
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            alignItems: "center",
          }}
        >
          {/* LEFT LOGO */}
          <NavLink to="/">
              <img
              src={logo}
              alt="logo"
              style={{
                width: "clamp(150px, 20vw, 250px)",
                objectFit: "contain",
              }}
            />
            </NavLink>

          {/* Center nav */}
          <nav style={{
            display: "flex",
            gap: "clamp(16px, 5vw, 80px)",
            justifySelf: "center"}}>

            <NavLink
              to="/"
              style={({ isActive }) => ({
                ...linkBase,
                borderBottom: isActive ? "2px solid black" : "2px solid transparent",
                paddingBottom: 4,
              })
            }
            >
              Chat
            </NavLink>

            <NavLink
              to="/about"
              style={({ isActive }) => ({
                ...linkBase,
                borderBottom: isActive ? "2px solid black" : "2px solid transparent",
                paddingBottom: 4,
              })}
            >
              About
            </NavLink>

            <NavLink
              to="/upload"
              style={({ isActive }) => ({
                ...linkBase,
                borderBottom: isActive ? "2px solid black" : "2px solid transparent",
                paddingBottom: 4,
              })}
            >
              Upload
            </NavLink>

            <NavLink
              to="/update"
              style={({ isActive }) => ({
                ...linkBase,
                borderBottom: isActive ? "2px solid black" : "2px solid transparent",
                paddingBottom: 4,
              })}
            >
              Update
            </NavLink>

            <NavLink
              to="/contact"
              style={({ isActive }) => ({
                ...linkBase,
                borderBottom: isActive ? "2px solid black" : "2px solid transparent",
                paddingBottom: 4,
              })}
            >
              Contact
            </NavLink>

          </nav>
          {/* RIGHT spacer */}
          <div />
        </div>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;