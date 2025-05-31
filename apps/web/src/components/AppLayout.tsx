import { Link, Outlet, redirect } from "react-router";
import clsx from "clsx";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import styles from "./AppLayout.module.scss";
import { useLocalStorage } from "usehooks-ts";
import { deleteConnections, saveConnection } from "../lib/mutations";
import { db } from "../lib/db";
import type { Route } from "./+types/AppLayout";
import { gitHubClient } from "../github";
import { useConnections } from "../lib/queries";
import { Card } from "@blueprintjs/core";

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  // If the "token" query parameter if provided, and no connections are defined, then
  // save a new connection for github.com. This allows to login using an OAuth app.
  const isConnected = (await db.connections.count()) > 0;
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  if (token && !isConnected) {
    const props = {
      label: "",
      baseUrl: "https://api.github.com",
      auth: token,
      host: "github.com",
      orgs: [],
    };
    const viewer = await gitHubClient.getViewer(props);
    await saveConnection({ id: "", ...props, viewer });
    return redirect("/inbox");
  }
  return null;
}

export default function AppLayout() {
  const [isDark, setDark] = useLocalStorage("isDark", false, {
    initializeWithValue: false, // For SSR support.
  });
  const connections = useConnections();
  const handleLogout = () => {
    deleteConnections().catch(console.error);
  };
  return (
    <div className={clsx(styles.app, isDark && "bp5-dark")}>
      <Sidebar
        isDark={isDark}
        onDarkChange={() => setDark((v) => !v)}
        onLogout={handleLogout}
      />
      <main className={styles.main}>
        <div className={styles.content}>
          {connections.isLoaded && connections.data.length === 0 && (
            <Card className={styles.announcement}>
              No connections are configured. Please go to{" "}
              <Link to="/settings">the settings page</Link> to add a new
              connection.
            </Card>
          )}
          <Outlet />
        </div>
        <Footer commit={import.meta.env.VITE_COMMIT_SHA} />
      </main>
    </div>
  );
}
