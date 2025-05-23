import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

export default function Template() {
    const location = useLocation();
    const isLoginPage = location.pathname === '/login';

    return(
        <div className="flex">
            {!isLoginPage && <Sidebar />}
            <div className={`${!isLoginPage ? '' : 'w-full'}`}>
                <Outlet />
            </div>
        </div>
    )
}