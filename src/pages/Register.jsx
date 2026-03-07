import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import toast from "react-hot-toast";

const Register = () => {

    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email,setEmail] = useState("");
    const [password,setPassword] = useState("");

    const handleRegister = async (e) => {
        e.preventDefault();

        try {

        await API.post("/api/auth/register",{
            name,
            email,
            password
        });

        toast.success("User registered successfully");

        navigate("/login");

        } catch(err){
            toast.error("Registration failed");
        }

    };

    return (

        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-black">

            <h1 className="absolute top-8 left-10 text-3xl font-bold text-white tracking-widest">
                <span className="text-indigo-400">Docu</span>Sign
            </h1>

            <div className="bg-white/10 backdrop-blur-xl p-10 rounded-xl shadow-xl w-[380px] text-white">

                <h2 className="text-3xl font-bold mb-6 text-center">
                    Create Account
                </h2>

                <form onSubmit={handleRegister} className="space-y-4">

                    <input
                        type="text"
                        placeholder="Name"
                        className="w-full p-3 rounded bg-black/40 border border-gray-700"
                        onChange={(e)=>setName(e.target.value)}
                    />

                    <input
                        type="email"
                        placeholder="Email"
                        className="w-full p-3 rounded bg-black/40 border border-gray-700"
                        onChange={(e)=>setEmail(e.target.value)}
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full p-3 rounded bg-black/40 border border-gray-700"
                        onChange={(e)=>setPassword(e.target.value)}
                    />

                    <button className="w-full bg-indigo-500 hover:bg-indigo-600 p-3 rounded">
                        Register
                    </button>

                </form>

                <div className="text-center mt-4 text-sm">
                    <span>Already have an account? </span>

                    <button
                        onClick={()=>navigate("/login")}
                        className="text-indigo-400 hover:underline"
                    >
                        Login
                    </button>
                </div>

            </div>

        </div>

    );
};

export default Register;