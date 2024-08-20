import { useEffect, useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import clsx from 'clsx'

import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import { useConnections, usePulls, useSections } from './lib/queries';
import { sum } from 'remeda'

import styles from "./App.module.scss";
import { Card } from '@blueprintjs/core';
import { getWorker } from './worker/client';
import CommandBar from './components/CommandBar';

export default function App() {
    const [isDark, setDark] = useState<boolean>(() => {
        // Read the isDark value from local storage (or false if it's not set)
        return JSON.parse(localStorage.getItem('isDark') || 'false') as boolean;
    });
    const connections = useConnections();
    const sections = useSections();
    const pulls = usePulls();

    const worker = getWorker();

    useEffect(() => {
        // Write the isDark value to local storage whenever it changes
        localStorage.setItem('isDark', JSON.stringify(isDark));
    }, [isDark]);

    const count = sum(
        sections.data
            .filter(section => section.notified)
            .map(section => pulls.data.filter(pull => pull.sections.indexOf(section.id) > -1).length)
    );

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
            <CommandBar/>
            <Sidebar isDark={isDark} onDarkChange={() => setDark(v => !v)} onRefresh={worker.refreshPulls} />
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