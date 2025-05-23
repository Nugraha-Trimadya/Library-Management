import axios from 'axios';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { HiOutlineLibrary, HiOutlineMail, HiOutlineLockClosed } from "react-icons/hi";
import Swal from 'sweetalert2';
import { API_URL } from '../constant';

export default function Login() {
    const [login, setLogin] = useState({
        email: '',
        password: ''
    });

    const [err, setError] = useState([]);
    const navigate = useNavigate();

    function loginProcess(e) {
        e.preventDefault();
        axios.post(API_URL + 'login', {
            email: login.email,
            password: login.password
        })
            .then((res) => {
                console.log('Login response:', res.data); // For debugging
                if (res.data.token) {  // Changed from checking success to checking token
                    localStorage.setItem("access_token", res.data.token);
                    localStorage.setItem("user", JSON.stringify({
                        name: res.data.name,
                        email: res.data.email,
                        role: res.data.role
                    }));
                    
                    // Show success alert
                    Swal.fire({
                        icon: 'success',
                        title: 'Login Successful!',
                        text: 'Welcome back ' + res.data.name,
                        timer: 1500,
                        showConfirmButton: false
                    }).then(() => {
                        navigate('/dashboard', { replace: true });
                    });
                } else {
                    setError({
                        message: res.data.message || 'Login failed',
                        data: {}
                    });
                }
            })
            .catch((err) => {
                // ... existing code ...
            });
    }


    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-rose-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full bg-white rounded-xl shadow-2xl space-y-8 p-10 transform transition-all hover:scale-105">
                {/* Logo and Title */}
                <div className="text-center">
                    <div className="flex justify-center">
                        <div className="p-4 bg-rose-100 rounded-full">
                            <HiOutlineLibrary className="w-12 h-12 text-rose-500" />
                        </div>
                    </div>
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Library<span className="text-rose-500">System</span>
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Welcome back! Please sign in to your account
                    </p>
                </div>

                {/* Error Messages */}
                {Object.keys(err).length > 0 && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 my-4 rounded-r-lg">
                        <div className="flex">
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">
                                    There were errors with your submission
                                </h3>
                                <div className="mt-2 text-sm text-red-700">
                                    <ul className="list-disc pl-5 space-y-1">
                                        {Object.entries(err.data).length > 0
                                            ? Object.entries(err.data).map(([key, value], index) => (
                                                <li key={index}>{value}</li>
                                            ))
                                            : <li>{err.message}</li>
                                        }
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Login Form */}
                <form className="mt-8 space-y-6" onSubmit={loginProcess}>
                    <div className="space-y-4">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <HiOutlineMail className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="email"
                                name="email"
                                type="text"
                                required
                                className="pl-10 appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent sm:text-sm"
                                placeholder="Email address"
                                onChange={(e) => setLogin({ ...login, email: e.target.value })}
                            />
                        </div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <HiOutlineLockClosed className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="pl-10 appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent sm:text-sm"
                                placeholder="Password"
                                onChange={(e) => setLogin({ ...login, password: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-all duration-200 transform hover:scale-105"
                        >
                            Sign in
                        </button>
                    </div>

                    <div className="text-center mt-4">
                        <p className="text-sm text-gray-600">
                            Don't have an account?{' '}
                            <Link to="/register" className="font-medium text-rose-600 hover:text-rose-500 transition-colors duration-200">
                                Register here
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}