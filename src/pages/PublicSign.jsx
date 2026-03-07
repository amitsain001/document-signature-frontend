import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Document, Page } from "react-pdf";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

const PublicSign = () => {
    const { token } = useParams();
    const [document, setDocument] = useState(null);
    const [fileUrl, setFileUrl] = useState(null);
    const navigate = useNavigate();

    const handleReject = async () => {
        const reason = prompt("Enter rejection reason");
        if (!reason) return;
        await API.post(`/api/docs/reject/${token}`, {
            reason
        });

        alert("Document rejected");
        navigate("/");
    };

    useEffect(() => {
        fetchDoc();
    }, []);

    useEffect(() => {
        fetchDoc();
    }, [token]);

    const fetchDoc = async () => {
        try {
            const { data } = await API.get(`/api/docs/public/${token}`);
            console.log(data); // check if document is coming
            setDocument(data);
            setFileUrl(`http://localhost:5000/${data.filePath}`);
        } catch (error) {
            console.error(error);
        }
    };

    const signDoc = async () => {
        await API.post(`/api/docs/finalize/${token}`);
        alert("Document signed");
    };

    // const handleSign = async () => {

    //     await API.post(`/api/docs/sign/${token}`)

    //     alert("Document signed successfully")

    //     navigate("/")
    // }

    const handleSign = () => {
        if (!document) return;
        navigate(`/document/${document._id}`);
    };

    {!document && (
        <div className="text-center mt-10 text-gray-500">
        Loading document...
        </div>
    )}

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">

            {/* Header */}
            <div className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
                <h1 className="text-xl font-bold text-purple-700">DocuSign</h1>
                <h2 className="text-gray-600 font-medium">Sign Document</h2>
            </div>

            <button
                onClick={() => navigate(-1)}
                    className="bg-gray-500 px-4 py-2 rounded hover:bg-gray-600"
                >
                    ← Back
            </button>

            {/* PDF Viewer */}
            <div className="flex justify-center items-center flex-1 p-6">

                {fileUrl && (
                    <div className="bg-white shadow-lg rounded-lg p-4">

                    <Document file={fileUrl}>
                        <Page pageNumber={1} />
                    </Document>

                    </div>
                )}

            </div>

            {/* Action Buttons */}
            <div className="bg-white border-t flex justify-center gap-6 p-6">

                <button
                    onClick={handleReject}
                    className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition"
                >
                    Reject Document
                </button>

                <button
                    onClick={handleSign}
                    disabled={!document}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg"
                    >
                    Sign Document
                </button>
              

            </div>

        </div>
    );
};

export default PublicSign;