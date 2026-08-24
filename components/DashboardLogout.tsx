"use client";

import { useState } from "react";

export function DashboardLogout() {
  const [leaving, setLeaving] = useState(false);

  async function logout() {
    setLeaving(true);
    await fetch("/api/dashboard-auth", { method: "DELETE" });
    window.location.reload();
  }

  return (
    <button className="dashboard-logout" type="button" onClick={logout} disabled={leaving}>
      {leaving ? "Saindo..." : "Sair"}
    </button>
  );
}
