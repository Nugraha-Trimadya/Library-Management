import { createBrowserRouter} from 'react-router-dom';
import Template from '../layouts/Template';
import Login from '../pages/Login';
import Dashboard from '../pages/Dahsboard';
import LoginPage from '../pages/middleware/Loginpage';
import PrivatePage from '../pages/middleware/Privatepage';
import Books from '../pages/books'; 
import Members from '../pages/members';
import Lendings from '../pages/lendings';
import Restorations from '../pages/restorations';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <Template />,
        children: [
            {
                path: '/login',
                element: <LoginPage />,
                children: [
                    { path: '', element: <Login /> }
                ]
            },
            {
                element: <PrivatePage />,
                children: [
                    { path: '/', element: <Dashboard /> },
                    { path: '/dashboard', element: <Dashboard /> },
                    { 
                        path: 'books', 
                        children: [
                            { index: true, element: <Books /> },
                        ]
                    },
                    {
                        path: 'members',
                        children: [
                            { index: true, element: <Members /> },
                        ]
                    },
                    {
                        path: 'lendings',
                        children: [
                            { index: true, element: <Lendings /> },
                        ]
                    },
                       {
                        path: 'restorations',
                        children: [
                            { index: true, element: <Restorations /> },
                        ]
                    }
                ]
            }
        ]
    }
]);
