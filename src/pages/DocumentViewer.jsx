import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";

import { useParams } from "react-router-dom";
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

    const [numPages, setNumPages] = useState(null);
    const [signatures, setSignatures] = useState([]);
    const [fileUrl, setFileUrl] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    const pdfPageRef = useRef(null);

    const fetchSignatures = async () => {
        const { data } = await API.get(`/api/signatures/${id}`);
        setSignatures(data);
    };

    // Fetch document
    useEffect(() => {
        const fetchDocument = async () => {
            const { data } = await API.get(`/api/docs/${id}`);
            setFileUrl(`http://localhost:5000/${data.filePath}`);
        };

        fetchDocument();
    }, [id]);

    // Fetch signatures
    useEffect(() => {
        const fetchSignatures = async () => {
            const { data } = await API.get(`/api/signatures/${id}`);
            setSignatures(data);
        };

        fetchSignatures();
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

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        const pageElement = e.target.closest("[data-page-number]");
        if (!pageElement) return;

        const pageNumber = Number(pageElement.dataset.pageNumber);

        const rect = pageElement.getBoundingClientRect();

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const xPercent = (x / rect.width) * 100;
        const yPercent = (y / rect.height) * 100;

        // if (xPercent < 0 || xPercent > 100) return;
        // if (yPercent < 0 || yPercent > 100) return;

        await API.post("/api/signatures", {
            documentId: id,
            pageNumber,
            x: xPercent,
            y: yPercent,
        });

        fetchSignatures();
    };

    const handleMouseDown = (e, id, type) => {
        e.stopPropagation();
        setActiveId(id);
        setActionType(type);
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

    return (
        <div className="flex h-screen">
            {/* Sidebar */}
            <div className="w-64 bg-gray-100 border-r p-4">
                <h2 className="text-lg font-semibold mb-4">Fields</h2>

                <div
                draggable
                onDragStart={(e) => {
                    e.dataTransfer.setData("type", "signature");
                }}
                className="p-3 bg-white border rounded shadow cursor-grab hover:bg-gray-200"
                >
                Signature Field
                </div>
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
                                        .map(sig => (
                                        <div
                                            key={sig._id}
                                            className="absolute bg-yellow-400 px-3 py-1 rounded shadow text-sm"
                                            style={{
                                                top: `${sig.y}%`,
                                                left: `${sig.x}%`,
                                                transform: "translate(-50%, -50%)",
                                            }}
                                        >
                                            Sign Here
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </Document>
                    )}

                    {/* Render Signatures */}
                    {signatures.map((sig) => (
                        <div
                            key={sig._id}
                            className="absolute bg-yellow-400 rounded shadow text-sm font-medium select-none"
                            style={{
                                top: `${sig.y}%`,
                                left: `${sig.x}%`,
                                width: sig.width ? `${sig.width}%` : "15%",
                                padding: "6px 12px",
                                cursor: actionType === "resize" ? "se-resize" : "move",
                            }}
                            onMouseDown={(e) => handleMouseDown(e, sig._id, "move")}
                        >
                            Sign Here

                            {/* Resize Handle */}
                            <div
                                onMouseDown={(e) => {
                                    e.stopPropagation();
                                    handleMouseDown(e, sig._id, "resize");
                                }}
                                className="absolute right-0 top-0 h-full w-3 cursor-ew-resize bg-black"
                            />
                        </div>
                    ))}
                </div>
            </div>
            <button
                onClick={finalizeDocument}
                className="fixed bottom-6 right-6 bg-green-600 text-white px-6 py-3 rounded shadow-lg"
            >
                Generate Signed PDF
            </button>
        </div>
    );
};

export default DocumentViewer;