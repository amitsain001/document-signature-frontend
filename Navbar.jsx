import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const Navbar = () => {

    const navigate = useNavigate();
    return (
        
        <div className="fixed top-0 w-full flex justify-between items-center px-8 py-4 bg-black/40 backdrop-blur-lg border-b border-gray-800">

            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700"
                >
                ← Back
            </button>

            <Link to="/" className="text-2xl font-bold tracking-widest text-white">
                <span className="text-indigo-400">Docu</span>Sign
            </Link>

        </div>
    );
};

export default Navbar;