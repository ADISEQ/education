import { createRoot } from 'react-dom/client';
import './style.css';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router';
import MainLayout from './layouts/MainLayout.tsx';

import Budgets from './pages/Budgets.tsx';
import Dashboard from './pages/Dashboard.tsx';
import TransactionList from './pages/TransactionList.tsx';
import TransactionPanel from './pages/TransactionPanel.tsx';
import NewTransactionForm from './pages/forms/NewTransactionForm.tsx';
import NotFound from './pages/NotFound.tsx';


const router = createBrowserRouter([
    {
        path: "/",
        Component: MainLayout,
        children: [
            {index: true, element: <Navigate to="dashboard"/>},
            {path: "dashboard", Component: Dashboard },
            {
                path: "transactions",
                
                children: [
                    {
                        index: true,
                        Component: TransactionList
                    },
                    {
                        path: ":id",
                        Component: TransactionPanel
                    },
                    {
                        path: "new",
                        Component: NewTransactionForm,
                    }
                ]

            },
            {path: "budgets", Component: Budgets},
            {path: "*", Component: NotFound}
        
        ]
    }
])


createRoot(document.getElementById('root')!).render(
    <RouterProvider router={router}/>
);
