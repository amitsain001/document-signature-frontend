import { useState } from "react";
import API from "../services/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";

const Login = () => {
    const navigate = useNavigate();

    const [email,setEmail] = useState("");
    const [password,setPassword] = useState("");

    const handleLogin = async (e) => {

        e.preventDefault();

        try {
            const {data} = await API.post("/api/auth/login",{email,password});

            localStorage.setItem("token",data.token);

            toast.success("Login successful");

            navigate("/dashboard");

        } catch(err){
            toast.error("Invalid credentials");
        }
    };

    return (

        
        <AuthLayout>

            <h1 className="absolute top-8 left-10 text-3xl font-bold text-white tracking-widest">
                <span className="text-indigo-400">Docu</span>Sign
            </h1>

            <div className="bg-white/10 backdrop-blur-xl p-10 rounded-xl shadow-xl w-[380px] text-white">

                <h2 className="text-3xl font-bold mb-6 text-center">
                    Welcome Back
                </h2>

                <form onSubmit={handleLogin} className="space-y-4">

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

                    <button className="w-full bg-indigo-500 hover:bg-indigo-600 transition p-3 rounded font-semibold">
                        Login
                    </button>
                    
                    <div className="text-center mt-4 text-sm">
                        <span className="text-gray-300">New here? </span>

                        <button
                            onClick={() => navigate("/register")}
                            className="text-indigo-400 hover:underline"
                        >
                            Create an account
                        </button>
                    </div>

                </form>

            </div>

        </AuthLayout>
    );
};

export default Login;