import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../services/api";

const PublicSign = () => {
    const { token } = useParams();
    const [doc, setDoc] = useState(null);

    useEffect(() => {
        const fetchDoc = async () => {
            const { data } = await API.get(`/api/docs/public/${token}`);
            setDoc(data);
        };

        fetchDoc();
    }, [token]);

    if (!doc) return <p>Loading...</p>;

    return (
        <div>
            <h2>Sign Document</h2>
            <iframe
                src={`http://localhost:5000/${doc.filePath}`}
                width="100%"
                height="600px"
            />
        </div>
    );
};

export default PublicSign;