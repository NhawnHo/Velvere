import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export interface User {
    name: string;
    // Add other properties of User as needed
}

interface Props {
    user: User | null;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const UserDropdownMenu: React.FC<Props> = ({ user, setUser }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null); // cập nhật lại state ở Header
        navigate('/');
    };

    return (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
            <ul className="py-2 text-sm text-black">
                {user ? (
                    <>
                        <li className="px-4 py-2 font-semibold text-gray-700 border-b">
                            👤 {user.name}
                        </li>
                        <li>
                            <Link
                                to="/orders"
                                className="block px-4 py-2 hover:bg-gray-100"
                            >
                                MY ORDERS
                            </Link>
                        </li>
                        <li>
                            <button
                                onClick={handleLogout}
                                className="w-full text-left px-4 py-2 hover:bg-gray-100"
                            >
                                LOG OUT
                            </button>
                        </li>
                    </>
                ) : (
                    <>
                        <li>
                            <Link
                                to="/signin"
                                className="block px-4 py-2 hover:bg-gray-100"
                            >
                                SIGN IN
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/signup"
                                className="block px-4 py-2 hover:bg-gray-100"
                            >
                                SIGN UP
                            </Link>
                        </li>
                    </>
                )}
            </ul>
        </div>
    );
};

export default UserDropdownMenu;
