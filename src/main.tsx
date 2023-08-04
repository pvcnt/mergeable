import React from 'react'
import ReactDOM from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom'
import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import TimeAgo from 'javascript-time-ago'
import timeAgoEnLocale from 'javascript-time-ago/locale/en.json'
import { Intent, OverlayToaster } from '@blueprintjs/core'

import App from './App.tsx'
import ErrorPage from './error-page.tsx'
import Dashboard from './routes/dashboard.tsx'
import Settings from './routes/settings.tsx'

import 'normalize.css/normalize.css'
import '@blueprintjs/icons/lib/css/blueprint-icons.css'
import '@blueprintjs/core/lib/css/blueprint.css'
import './styles/index.less'

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
            path: "/settings",
            element: <Settings/>,
        },
        ]
    },
])

const toaster = OverlayToaster.create()
const queryClient = new QueryClient({
    queryCache: new QueryCache({
        onError: (error) => {
            toaster.show({message: `Something went wrong: ${error.message}`, intent: Intent.DANGER})
        }
    }),
})

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <ReactQueryDevtools position="bottom-right"/>
            <RouterProvider router={router} />
        </QueryClientProvider>
    </React.StrictMode>,
)
