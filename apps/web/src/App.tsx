import { useEffect, useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import clsx from 'clsx'
import { Card } from '@blueprintjs/core'
import localforage from "localforage"

import Sidebar from '@repo/ui/components/Sidebar';
import Footer from '@repo/ui/components/Footer';
import { saveConnection, useConnections } from './db';

export default function App() {
    const [isDark, setDark] = useState<boolean>(() => {
        // Read the isDark value from local storage (or false if it's not set)
        return JSON.parse(localStorage.getItem('isDark') || 'false') as boolean;
    });
    const connections = useConnections()

    useEffect(() => {
        // Migrate connections from the legacy format.
        if (connections.isLoaded && connections.data.length === 0) {
            type LegacyConnection = {name?: string, host: string, baseUrl: string, auth: string};
            type LegacyConfig = {connections: LegacyConnection[]};

            localforage.getItem<LegacyConfig>("config").then(config => {
                config && config.connections.forEach(v => {
                    saveConnection({id: "", label: v.name || "", baseUrl: v.baseUrl, host: v.host, token: v.auth})
                })
            }).catch(console.error)
        }
    }, [connections.isLoaded, connections.data.length]);

    useEffect(() => {
        // Write the isDark value to local storage whenever it changes
        localStorage.setItem('isDark', JSON.stringify(isDark));
    }, [isDark]);

    return (
        <div className={clsx("app", isDark && "bp5-dark")}>
            <Sidebar isDark={isDark} onDarkChange={() => setDark(v => !v)}/>
            <main>
                <div>
                    {(connections.isLoaded && connections.data.length === 0) &&
                        <Card className="announcement">
                            No connections are configured. Please go to <Link to="/settings">the settings page</Link> to add a new connection.
                        </Card>}
                    <Outlet/>
                    <Footer commit={import.meta.env.VITE_COMMIT_SHA}/>
                </div>
            </main>
        </div>
    )
}