import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [documents, setDocuments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const { data } = await API.get("/api/docs/my-docs");
        setDocuments(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchDocs();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">My Documents</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {documents.map((doc) => (
          <div
            key={doc._id}
            className="p-4 bg-white shadow rounded cursor-pointer hover:shadow-lg"
            onClick={() => navigate(`/document/${doc._id}`)}
          >
            <h2 className="font-semibold">{doc.originalName}</h2>
            <p className="text-sm text-gray-500">
              {(doc.fileSize / 1024).toFixed(2)} KB
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;