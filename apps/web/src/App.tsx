import { useEffect, useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import clsx from 'clsx'
import localforage from "localforage"

import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import { saveConnection, useConnections, useSections } from './db';
import { usePulls } from './queries'
import { sum } from 'remeda'

import styles from "./App.module.scss";
import { Card } from '@blueprintjs/core';

export default function App() {
    const [isDark, setDark] = useState<boolean>(() => {
        // Read the isDark value from local storage (or false if it's not set)
        return JSON.parse(localStorage.getItem('isDark') || 'false') as boolean;
    });
    const connections = useConnections()
    const sections = useSections()

    useEffect(() => {
        // Migrate connections from the legacy format.
        if (connections.isLoaded && connections.data.length === 0) {
            type LegacyConnection = {name?: string, host: string, baseUrl: string, auth: string};
            type LegacyConfig = {connections: LegacyConnection[]};

            localforage.getItem<LegacyConfig>("config").then(config => {
                config && config.connections.forEach(v => {
                    saveConnection({id: "", label: v.name || "", baseUrl: v.baseUrl, host: v.host, auth: v.auth, viewer: "", orgs: []})
                })
            }).catch(console.error)
        }
    }, [connections.isLoaded, connections.data.length]);

    useEffect(() => {
        // Write the isDark value to local storage whenever it changes
        localStorage.setItem('isDark', JSON.stringify(isDark));
    }, [isDark]);

    const pulls = usePulls(sections.data, connections.data);
    const count = sum(sections.data.map((section, idx) => {
        if (section.notified) {
            return sum(pulls.slice(idx * connections.data.length, (idx + 1) * connections.data.length).map(res => res.data?.pulls.length || 0));
        }
        return 0;
    }));

    // Change window's title to include number of pull requests.
    useEffect(() => {
        if (count > 0) {
            document.title = `(${count}) Mergeable`
        } else {
            document.title = "Mergeable"
        }
    }, [count])

    return (
        <div className={clsx(styles.app, isDark && "bp5-dark")}>
            <Sidebar isDark={isDark} onDarkChange={() => setDark(v => !v)}/>
            <main className={styles.main}>
                <div className={styles.content}>
                    {(connections.isLoaded && connections.data.length === 0) &&
                        <Card className={styles.announcement}>
                            No connections are configured. Please go to <Link to="/settings">the settings page</Link> to add a new connection.
                        </Card>}
                    <Outlet/>
                </div>
                <Footer commit={import.meta.env.VITE_COMMIT_SHA}/>
            </main>
        </div>
    )
}