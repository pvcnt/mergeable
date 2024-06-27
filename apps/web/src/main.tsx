import React from 'react'
import ReactDOM from 'react-dom/client'
import {createBrowserRouter, RouterProvider} from 'react-router-dom'
import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import TimeAgo from 'javascript-time-ago'
import timeAgoEnLocale from 'javascript-time-ago/locale/en.json'
import { Intent, BlueprintProvider } from '@blueprintjs/core'

import { AppToaster}  from './lib/toaster.ts'
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
                element: <Dashboard/>,
            },
            {
                path: "/stars",
                element: <Stars/>,
            },
            {
                path: "/settings",
                element: <Settings/>,
            },
        ]
    },
])

const queryClient = new QueryClient({
    queryCache: new QueryCache({
        onError: async (error) => {
            const details = (error instanceof Error) ? error.message : "Internal error";
            (await AppToaster).show({message: `Something went wrong: ${details}`, intent: Intent.DANGER})
        }
    }),
})

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <BlueprintProvider>
            <QueryClientProvider client={queryClient}>
                <ReactQueryDevtools position="bottom-right"/>
                <RouterProvider router={router} />
            </QueryClientProvider>
        </BlueprintProvider>
    </React.StrictMode>,
)
