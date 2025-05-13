import { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router";
import clsx from "clsx";
import { Card, Spinner } from "@blueprintjs/core";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";
import Login from "./components/Login";
import { useConnections } from "./lib/queries";
import styles from "./App.module.scss";
import { createConnection, deleteConnections } from "./lib/mutations";

export default function App() {
  const [isDark, setDark] = useState<boolean>(() => {
    // Read the isDark value from local storage (or false if it's not set)
    return JSON.parse(localStorage.getItem("isDark") || "false") as boolean;
  });
  useEffect(() => {
    // Write the isDark value to local storage whenever it changes
    localStorage.setItem("isDark", JSON.stringify(isDark));
  }, [isDark]);
  
  const connections = useConnections();
  const isConnected = connections.data.length > 0;

  const { hash } = useLocation();

  useEffect(() => {
    if (hash?.startsWith("#token=") && !isConnected) {
      const auth = hash.substring(7);
      createConnection({
        baseUrl: "https://api.github.com",
        auth,
        host: "github.com",
        orgs: [],
      }).then(() => window.location.replace(""))
        .catch(console.error);
    }
  }, [hash, isConnected]);

  const handleLogout = () => {
    deleteConnections().catch(console.error);
  };

  if (!connections.isLoaded) {
    return <Spinner />;
  } else if (!isConnected) {
    return <Login />;
  } else {
    return (
      <div className={clsx(styles.app, isDark && "bp5-dark")}>
        <Sidebar isDark={isDark} onDarkChange={() => setDark((v) => !v)} onLogout={handleLogout} />
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
}
