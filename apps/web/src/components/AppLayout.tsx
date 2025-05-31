import { Outlet, useNavigate } from "react-router";
import clsx from "clsx";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import styles from "./AppLayout.module.scss";
import { useLocalStorage } from "usehooks-ts";
import { deleteConnections } from "../lib/mutations";

export default function AppLayout() {
  const [isDark, setDark] = useLocalStorage("isDark", false, {
    initializeWithValue: false, // For SSR support.
  });
  const navigate = useNavigate();
  const handleLogout = async () => {
    await deleteConnections();
    return navigate("/");
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
          <Outlet />
        </div>
        <Footer commit={import.meta.env.VITE_COMMIT_SHA} />
      </main>
    </div>
  );
}
