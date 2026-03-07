import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import { useNavigate, useParams } from "react-router-dom";
import { Document, Page, pdfjs } from "react-pdf";
import { useState, useEffect, useRef } from "react";
import API from "../services/api";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

const DocumentViewer = () => {
    const { id } = useParams();
    const [activeId, setActiveId] = useState(null);
    const [actionType, setActionType] = useState(null); // "move" | "resize"
    const [document, setDocument] = useState(null);
    const [numPages, setNumPages] = useState(null);
    const [signatures, setSignatures] = useState([]);
    const [fileUrl, setFileUrl] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [signatureText, setSignatureText] = useState("");
    const [fontFamily, setFontFamily] = useState("cursive");
    const  navigate  = useNavigate();

    const pdfPageRef = useRef(null);

    //fetch Signatures
    const fetchSignatures = async () => {
        try {
            const res = await API.get(`/api/signatures/${id}`);
            setSignatures(res.data);
        } catch (error) {
            console.error("Error loading signatures", error);
        }
    };


    // Fetch document
    useEffect(() => {
        const fetchDocument = async () => {
            const { data } = await API.get(`/api/docs/${id}`);
            setFileUrl(`http://localhost:5000/${data.filePath}`);
        };

        fetchDocument();
    }, [id]);

    useEffect(() => {
        const move = (e) => handleMouseMove(e);
        const up = () => handleMouseUp();

        if (activeId) {
            window.addEventListener("mousemove", move);
            window.addEventListener("mouseup", up);
        }

        return () => {
            window.removeEventListener("mousemove", move);
            window.removeEventListener("mouseup", up);
        };
    }, [activeId, actionType]);

    useEffect(() => {
        fetchDocument();
        fetchSignatures();
    }, []);

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
    };

    const fetchDocument = async () => {
        try {
            const { data } = await API.get(`/api/docs/${id}`);
            setDocument(data);
            setFileUrl(`http://localhost:5000/${data.filePath}`);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        const type = e.dataTransfer.getData("type");
        const text = e.dataTransfer.getData("text");
        const font = e.dataTransfer.getData("font");

        if (type !== "signature") return;

        const pageElement = e.target.closest("[data-page-number]");
        if (!pageElement) return;

        const pageNumber = Number(pageElement.dataset.pageNumber);

        const rect = pageElement.getBoundingClientRect();

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const xPercent = (x / rect.width) * 100;
        const yPercent = (y / rect.height) * 100;

        await API.post("/api/signatures", {
            documentId: id,
            pageNumber,
            x: xPercent,
            y: yPercent,
            text,
            font
        });

        fetchSignatures();
    };

    const handleMouseMove = (e) => {
        if (!activeId) return;

        const rect = pdfPageRef.current.getBoundingClientRect();

        setSignatures((prev) =>
            prev.map((sig) => {
                if (sig._id !== activeId) return sig;

                if (actionType === "move") {
                    const x = ((e.clientX - rect.left) / rect.width) * 100;
                    const y = ((e.clientY - rect.top) / rect.height) * 100;
                    return { ...sig, x, y };
                }

                if (actionType === "resize") {
                    const rect = pdfPageRef.current.getBoundingClientRect();

                    const mouseXPercent =
                        ((e.clientX - rect.left) / rect.width) * 100;

                    let newWidth = mouseXPercent - sig.x;

                    if (newWidth < 5) newWidth = 5;
                    if (newWidth > 80) newWidth = 80;

                    return { ...sig, width: newWidth };
                }
                return sig;
            })
        );
    };

    const handleMouseUp = async () => {
        if (!activeId) return;

        const updatedSig = signatures.find((s) => s._id === activeId);

        try {
            await API.put(`/api/signatures/${activeId}`, updatedSig);
        } catch (err) {
            console.error(err);
        }

        setActiveId(null);
        setActionType(null);
    };

    const finalizeDocument = async () => {
        try {
            const { data } = await API.post(`/api/docs/${id}/finalize`);
            window.open(`http://localhost:5000${data.filePath}`, "_blank");
        } catch (err) {
            console.error(err);
        }
    };

    const generateLink = async () => {
        try {

            const { data } = await API.get(`/api/docs/${id}`);
            const link = `${window.location.origin}/sign/${data.signatureToken}`;
            console.log("Generated link:", link);
            navigator.clipboard.writeText(link);
            alert("Signing link copied!");

        } catch (err) {
            console.error(err);
        }
    };

    const deleteSignature = async (id) => {
        const confirmDelete = window.confirm("Delete this signature?");
        if (!confirmDelete) return;

        try {
            await API.delete(`/api/signatures/${id}`);
            setSignatures(prev => prev.filter(sig => sig._id !== id));

        } catch (error) {
            console.error("Error deleting signature", error);
        }
    };

    return (
        <div className="flex h-screen">

            {/* Sidebar */}
            <div className="w-64 bg-gray-100 border-r p-4">
                <h2 className="text-lg font-semibold mb-4">Fields</h2>

                <div className="space-y-3">

                    <input
                        type="text"
                        placeholder="Type your signature"
                        value={signatureText}
                        onChange={(e) => setSignatureText(e.target.value)}
                        className="w-full p-2 border rounded"
                    />

                    <select
                        value={fontFamily}
                        onChange={(e) => setFontFamily(e.target.value)}
                        className="w-full p-2 border rounded"
                    >
                        <option value="cursive">Cursive</option>
                        <option value="serif">Serif</option>
                        <option value="monospace">Monospace</option>
                        <option value="fantasy">Fantasy</option>
                    </select>

                    <div
                        draggable
                        onDragStart={(e) => {
                            e.dataTransfer.setData("type", "signature");
                            e.dataTransfer.setData("text", signatureText);
                            e.dataTransfer.setData("font", fontFamily);
                        }}
                        className="p-3 bg-white border rounded shadow cursor-grab text-center"
                        style={{ fontFamily }}
                    >
                        {signatureText || "Drag Signature"}
                    </div>

                </div>

                <button
                    onClick={generateLink}
                        className="p-3 mt-6 text-white bg-blue-600 border rounded shadow cursor-grab hover:bg-blue-200"
                    >
                        Generate Signing Link
                </button>

                <button
                    onClick={() => navigate(-1)}
                        className="bg-black mt-6 px-4 py-2 rounded text-white"
                    >
                        ← Back
                </button>

            </div>

            {/* PDF Canvas */}
            <div
                className={`flex-1 relative overflow-auto flex justify-center ${
                isDragging ? "bg-blue-50" : "bg-gray-200"
                }`}
                onDragOver={(e) => e.preventDefault()}
                onDragEnter={() => setIsDragging(true)}
                onDragLeave={() => setIsDragging(false)}
            >
                <div 
                    ref={pdfPageRef} 
                    className="relative mt-6"
                >
                    {fileUrl && (
                        <Document file={fileUrl} onLoadSuccess={onDocumentLoadSuccess}>
                            {Array.from(new Array(numPages), (el, index) => (
                                <div
                                    key={index}
                                    data-page-number={index + 1}
                                    className="relative inline-block"
                                    onDrop={handleDrop}
                                    onDragOver={(e) => e.preventDefault()}
                                >
                                    <Page pageNumber={index + 1} />

                                    {/* Render signatures for THIS page only */}
                                    {signatures
                                        .filter(sig => sig.pageNumber === index + 1)
                                        .map( (sig , index ) => (
                                            <div
                                                key={sig._id || `${sig.x}-${sig.y}-${index}`}
                                                onClick={() => deleteSignature(sig._id)}
                                                className="absolute z-50 cursor-pointer bg-yellow-200 px-4 py-2 rounded-md shadow-md text-sm border border-yellow-500"
                                                style={{
                                                    top: `${sig.y}%`,
                                                    left: `${sig.x}%`,
                                                    transform: "translate(-50%, -50%)"
                                                }}
                                                >
                                                <span style={{ fontFamily: sig.font || "cursive" }}>
                                                    {sig.text || "Sign Here"}
                                                </span>

                                            </div>
                                        ))

                                    }
                                </div>
                            ))}


                        </Document>  
                    )}
                </div>
            </div>
            <button
                disabled={signatures.length === 0}
                onClick={finalizeDocument}
                className="fixed bottom-6 right-6 bg-green-600 text-white px-6 py-3 rounded shadow-lg"
            >
                Generate Signed PDF
            </button>
        </div>
    );
};

export default DocumentViewer;