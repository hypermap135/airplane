"use client";

export default function LogoutButton() {
  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }
  return (
    <button
      onClick={logout}
      style={{
        padding: "0.55rem 1rem",
        fontSize: "0.72rem",
        fontWeight: 600,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        borderRadius: 999,
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.12)",
        color: "#fff",
        cursor: "pointer",
      }}
    >
      Déconnexion
    </button>
  );
}
