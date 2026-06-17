import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/admin-auth";
import LoginForm from "./LoginForm";

export const metadata = {
  title: "Connexion admin",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  if (await isAuthenticated()) redirect("/admin");
  const { next } = await searchParams;
  return (
    <div
      style={{
        minHeight: "100svh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        background: "#06060f",
        color: "#fff",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 380,
          padding: "2.5rem",
          borderRadius: "1.5rem",
          background: "linear-gradient(160deg, #0e0e1c 0%, #0a0a14 100%)",
          border: "1px solid rgba(255,255,255,0.06)",
          boxShadow: "0 20px 80px -20px rgba(58,142,255,0.25)",
        }}
      >
        <div
          style={{
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: "0.6rem",
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "rgba(58,142,255,0.7)",
            marginBottom: "1.4rem",
          }}
        >
          ✈ AirplaneStore · Admin
        </div>
        <h1
          style={{
            fontSize: "1.6rem",
            fontWeight: 800,
            letterSpacing: "-0.02em",
            marginBottom: "0.4rem",
          }}
        >
          Connexion
        </h1>
        <p
          style={{
            fontSize: "0.85rem",
            color: "rgba(255,255,255,0.55)",
            marginBottom: "1.6rem",
          }}
        >
          Mot de passe transmis par AirplaneStore.
        </p>
        <LoginForm nextUrl={next ?? "/admin"} />
      </div>
    </div>
  );
}
