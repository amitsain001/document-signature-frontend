import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
    const [documents, setDocuments] = useState([]);
    const [filter, setFilter] = useState("ALL");
    const [file, setFile] = useState(null);

    const navigate = useNavigate();

    const fetchDocs = async () => {
        try {
            const { data } = await API.get("/api/docs/my-docs");
            setDocuments(data);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        fetchDocs();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/");
    };

    const handleUpload = async () => {
        if (!file) return alert("Select a PDF");

        const formData = new FormData();
        formData.append("file", file);

        try {
            await API.post("/api/docs/upload", formData);
            alert("Document uploaded");
            fetchDocs();
        } catch (err) {
            console.log(err);
        }
    };

    const filteredDocs =
        filter === "ALL"
        ? documents
        : documents.filter((doc) => doc.status === filter);

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm("Delete this document?");
        if (!confirmDelete) return ;
        try {
            await API.delete(`/api/docs/${id}`);
            setDocuments(prev => prev.filter(doc => doc._id !== id));
            navigate("/dashboard") ;

        } catch (error) {
            console.error("Delete failed", error);
        }
    };

    // if (!document) {
    //     return <div>Loading document...</div>;
    // }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-700 to-indigo-900 text-white">

            {/* Navbar */}
            <div className="flex justify-between items-center px-10 py-5 border-b border-white/20">

                <h1 className="text-2xl font-bold tracking-wider">
                <span className="text-indigo-300">Docu</span>Sign
                </h1>

                <button
                    onClick={() => navigate(-1)}
                    className="bg-white text-black px-4 py-2 rounded "
                    >
                        ← Back
                </button>

                <button
                    onClick={handleLogout}
                    className="bg-red-500 px-4 py-2 rounded hover:bg-red-600"
                    >
                    Logout
                </button>

            </div>

            <div className="p-10">

                {/* Header */}
                <div className="flex justify-between items-center mb-6">

                <h2 className="text-3xl font-bold">My Documents</h2>

                <div className="flex gap-3">

                    <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => setFile(e.target.files[0])}
                        className="text-sm"
                    />

                    <button
                        onClick={handleUpload}
                        className="bg-indigo-500 px-5 py-2 rounded hover:bg-indigo-600"
                    >
                    Upload PDF
                    </button>

                </div>
                </div>

                {/* Filter */}
                <select
                    className="mb-6 text-black px-3 py-2 rounded"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                >
                    <option value="ALL">All Documents</option>
                    <option value="PENDING">Pending</option>
                    <option value="SIGNED">Signed</option>
                    <option value="REJECTED">Rejected</option>
                </select>

                {/* Status Cards */}
                <div className="grid grid-cols-3 gap-6 mb-10">

                <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg">
                    <p className="text-gray-300">Pending</p>
                    <h2 className="text-3xl font-bold">
                    {documents.filter(d => d.status === "PENDING").length}
                    </h2>
                </div>

                <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg">
                    <p className="text-gray-300">Signed</p>
                    <h2 className="text-3xl font-bold">
                    {documents.filter(d => d.status === "SIGNED").length}
                    </h2>
                </div>

                <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg">
                    <p className="text-gray-300">Rejected</p>
                    <h2 className="text-3xl font-bold">
                    {documents.filter(d => d.status === "REJECTED").length}
                    </h2>
                </div>

                </div>

                {/* Documents */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

                {filteredDocs.map((doc) => (


                    <div
                        key={doc._id}
                        className="bg-white/10 backdrop-blur-md p-5 rounded-lg cursor-pointer hover:bg-white/20"
                        onClick={() => navigate(`/document/${doc._id}`)}
                    >

                        <div className="relative bg-purple-500 p-6 rounded-xl">

                            <button
                                onClick={() => handleDelete(doc._id)}
                                className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1 rounded"
                            >
                                ✕
                            </button>
                            <h3>{doc.fileName}</h3>

                        </div>

                        <h3 className="font-semibold mb-2">{doc.originalName}</h3>

                        <p className="text-sm text-gray-300">
                            {(doc.fileSize / 1024).toFixed(2)} KB
                        </p>

                        <span
                            className={`mt-3 inline-block px-3 py-1 text-sm rounded-full
                            ${
                            doc.status === "SIGNED"
                                ? "bg-green-500"
                                : doc.status === "REJECTED"
                                ? "bg-red-500"
                                : "bg-yellow-500"
                            }`}
                        >
                            {doc.status}
                        </span>

                    </div>

                ))}

                </div>

            </div>

        </div>
    );
};

export default Dashboard;