import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
    HiOutlineHome,
    HiOutlineBookOpen,
    HiOutlineUsers,
    HiOutlineCollection,
    HiOutlineCog,
    HiOutlineLogout,
    HiOutlineChartBar,
    HiOutlineLibrary,
    HiMenuAlt3
} from "react-icons/hi";
import Swal from "sweetalert2";

export default function Sidebar() {
    const [open, setOpen] = useState(true);
    const [userData, setUserData] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        {
            name: "Dashboard",
            link: "/dashboard",
            icon: HiOutlineHome
        },
        {
            name: "Books",
            link: "/books",
            icon: HiOutlineBookOpen
        },
        {
            name: "Members",
            link: "/members",
            icon: HiOutlineUsers
        },
        {
            name: "Lendings",
            link: "/lendings",
            icon: HiOutlineCollection,
        },
        {
            name: "Restorations",
            link: "/restorations",
            icon: HiOutlineChartBar
        },
    ];

    const getUserData = () => {
        try {
            const userData = localStorage.getItem("user");
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error("Error parsing user data:", error);
            return null;
        }
    };

    useEffect(() => {
        const data = getUserData();
        if (!data) {
            navigate("/login");
            return;
        }
        setUserData(data);
    }, [navigate]);

    const isActivePath = (path) => {
        return location.pathname === path;
    };

    const logoutHandler = () => {
        Swal.fire({
            title: 'Logout Successful!',
            text: 'You have been successfully logged out',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
        }).then(() => {
            localStorage.removeItem("access_token");
            localStorage.removeItem("user");
            navigate("/login");
        });
    };


    if (!userData) return null;

    return (
        <section className="flex gap-6">
            <div className={`bg-white min-h-screen ${
                open ? "w-72" : "w-16"
                } duration-500 text-gray-800 px-4 shadow-lg`}
            >
                {/* Toggle & Logo */}
                <div className="py-4 flex items-center justify-between">
                    <div className={`flex items-center gap-3 ${!open && "scale-0 hidden"}`}>
                        <HiOutlineLibrary className="w-8 h-8 text-rose-500" />
                        <h1 className="text-xl font-bold">
                            Library<span className="text-rose-500">System</span>
                        </h1>
                    </div>
                    <HiMenuAlt3
                        size={26}
                        className="cursor-pointer text-gray-600 hover:text-rose-500"
                        onClick={() => setOpen(!open)}
                    />
                </div>

                {/* Navigation */}
                <div className="mt-4 flex flex-col gap-4 relative">
                    {menuItems.map((menu, i) => (
                        <Link
                            to={menu.link}
                            key={i}
                            className={`${menu?.margin && "mt-5"} 
                                group flex items-center text-sm gap-3.5 font-medium p-2 
                                hover:bg-rose-50 rounded-md
                                ${isActivePath(menu.link) && "bg-rose-50 text-rose-600"}`}
                        >
                            <div>{React.createElement(menu.icon, { size: "20" })}</div>
                            <h2
                                style={{
                                    transitionDelay: `${i + 3}00ms`,
                                }}
                                className={`whitespace-pre duration-500 ${
                                    !open && "opacity-0 translate-x-28 overflow-hidden"
                                }`}
                            >
                                {menu.name}
                            </h2>
                            <h2
                                className={`${
                                    open && "hidden"
                                } absolute left-48 bg-white font-semibold whitespace-pre 
                                text-gray-900 rounded-md drop-shadow-lg px-0 py-0 w-0 overflow-hidden 
                                group-hover:px-2 group-hover:py-1 group-hover:left-14 
                                group-hover:duration-300 group-hover:w-fit`}
                            >
                                {menu.name}
                            </h2>
                        </Link>
                    ))}

                    {/* Logout Button */}
                    <button
                        onClick={logoutHandler}
                        className={`${
                            open ? "px-4 py-3 w-full" : "p-2"
                        } mt-6 flex items-center gap-3.5 text-sm font-medium
                        text-gray-600 hover:text-rose-600 hover:bg-rose-50
                        rounded-md transition-all duration-200 group`}
                    >
                        <HiOutlineLogout size={20} />
                        <span className={`whitespace-pre duration-500 ${
                            !open && "opacity-0 translate-x-28 overflow-hidden"
                        }`}>
                            Logout
                        </span>
                    </button>
                </div>
            </div>
        </section>
    );
}