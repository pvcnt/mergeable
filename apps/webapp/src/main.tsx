import React from 'react'
import ReactDOM from 'react-dom/client'
import {createBrowserRouter, Navigate, RouterProvider} from 'react-router-dom'
import TimeAgo from 'javascript-time-ago'
import timeAgoEnLocale from 'javascript-time-ago/locale/en.json'
import { BlueprintProvider } from '@blueprintjs/core'
import App from './App.tsx'
import ErrorPage from './error-page.tsx'
import Dashboard from './routes/dashboard.tsx'
import Settings from './routes/settings.tsx'
import Stars from './routes/stars.tsx'

import 'normalize.css/normalize.css'
import '@blueprintjs/icons/lib/css/blueprint-icons.css'
import '@blueprintjs/core/lib/css/blueprint.css'
import '@blueprintjs/select/lib/css/blueprint-select.css'
import './main.scss'

TimeAgo.addDefaultLocale(timeAgoEnLocale)

const router = createBrowserRouter([
    {
        path: "/",
        element: <App/>,
        errorElement: <ErrorPage />,
        children: [
            {
                index: true,
                element: <Navigate to="/inbox"/>,
            },
            {
                path: "/inbox",
                element: <Dashboard/>,
            },
            {
                path: "/inbox/stars",
                element: <Stars/>,
            },
            {
                path: "/settings",
                element: <Settings/>,
            },
        ]
    },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <BlueprintProvider>
            <RouterProvider router={router} />
        </BlueprintProvider>
    </React.StrictMode>,
)
