import { useEffect, useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import clsx from 'clsx'
import { Card } from '@blueprintjs/core'

import Sidebar from '@repo/ui/components/Sidebar';
import { ConfigContext, defaultConfig, readConfig, writeConfig } from './config';
import Footer from '@repo/ui/components/Footer';
import { Config } from '@repo/types';
import { useConnections } from './db';

export default function App() {
    const [isDark, setDark] = useState<boolean>(() => {
        // Read the isDark value from local storage (or false if it's not set)
        return JSON.parse(localStorage.getItem('isDark') || 'false') as boolean;
    });
    const [config, setConfig] = useState<Config>(defaultConfig)
    const { data: connections, isLoaded } = useConnections()

    useEffect(() => {
        readConfig()
            .then(config => {
                setConfig(config)
                console.log("Loaded configuration from local storage")
            })
            .catch(console.error)
    }, [])

    useEffect(() => {
        console.log("Writing configuration to local storage")
        writeConfig(config).catch(console.error)
    }, [config])

    useEffect(() => {
        // Write the isDark value to local storage whenever it changes
        localStorage.setItem('isDark', JSON.stringify(isDark));
    }, [isDark]);

    return (
        <ConfigContext.Provider value={{ config, setConfig }}>
            <div className={clsx("app", isDark && "bp5-dark")}>
                <Sidebar isDark={isDark} onDarkChange={() => setDark(v => !v)}/>
                <main>
                    <div>
                        {(isLoaded && connections.length === 0) &&
                            <Card className="announcement">
                                No connections are configured. Please go to <Link to="/settings">the settings page</Link> to add a new connection.
                            </Card>}
                        <Outlet/>
                        <Footer commit={import.meta.env.VITE_COMMIT_SHA}/>
                    </div>
                </main>
            </div>
        </ConfigContext.Provider>
    )
}