import { useEffect, useState } from "react";
import { Link, Outlet } from "react-router";
import clsx from "clsx";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";
import { useConnections } from "./lib/queries";
import styles from "./App.module.scss";
import { Card } from "@blueprintjs/core";

export default function App() {
  const [isDark, setDark] = useState<boolean>(() => {
    // Read the isDark value from local storage (or false if it's not set)
    return JSON.parse(localStorage.getItem("isDark") || "false") as boolean;
  });
  const connections = useConnections();

  useEffect(() => {
    // Write the isDark value to local storage whenever it changes
    localStorage.setItem("isDark", JSON.stringify(isDark));
  }, [isDark]);

  return (
    <div className={clsx(styles.app, isDark && "bp5-dark")}>
      <Sidebar isDark={isDark} onDarkChange={() => setDark((v) => !v)} />
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
