import { Link, Outlet } from "react-router";
import clsx from "clsx";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import styles from "./AppLayout.module.scss";
import { useLocalStorage } from "usehooks-ts";
import { deleteConnections } from "../lib/mutations";
import { Card } from "@blueprintjs/core";
import { useConnections } from "../lib/queries";

export default function AppLayout() {
  const [isDark, setDark] = useLocalStorage("isDark", false, {
    initializeWithValue: false, // For SSR support.
  });
  const connections = useConnections();
  const handleLogout = async () => {
    await deleteConnections();
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
