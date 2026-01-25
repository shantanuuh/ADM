import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../services/api';

const Navbar = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const onLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-blue-600 text-white shadow-md">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <Link to="/" className="text-xl font-bold flex items-center gap-2">
                    🏙️ Smart City GIS
                </Link>
                <div>
                    {user ? (
                        <div className="flex items-center gap-4">
                            <Link to="/" className="hover:text-blue-200">Map</Link>
                            <Link to="/report" className="hover:text-blue-200">Report Incident</Link>
                            <button
                                onClick={onLogout}
                                className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <Link to="/login" className="hover:text-blue-200">Login</Link>
                            <Link to="/register" className="hover:text-blue-200">Register</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
