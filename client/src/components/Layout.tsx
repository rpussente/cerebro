import { NavLink, Outlet } from "react-router-dom";

const navItems = [
  { to: "/", label: "Tasks" },
  { to: "/ideas", label: "Ideas" },
  { to: "/journal", label: "Journal" },
  { to: "/terminal", label: "Terminal" },
];

export default function Layout() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <nav
        style={{
          width: 200,
          padding: "1rem",
          borderRight: "1px solid #333",
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
        }}
      >
        <h2 style={{ margin: "0 0 1rem 0", fontSize: "1.2rem" }}>Cerebro</h2>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => ({
              display: "block",
              padding: "0.5rem 0.75rem",
              borderRadius: 6,
              textDecoration: "none",
              color: isActive ? "#fff" : "#aaa",
              background: isActive ? "#333" : "transparent",
            })}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <main style={{ flex: 1, padding: "1rem" }}>
        <Outlet />
      </main>
    </div>
  );
}
