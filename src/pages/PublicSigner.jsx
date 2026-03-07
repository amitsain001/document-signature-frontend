// import { useParams } from "react-router-dom";
// import { useEffect, useState } from "react";
// import API from "../services/api";

// const PublicSigner = () => {

//     const { token } = useParams();
//     const [doc, setDoc] = useState(null);

//     useEffect(() => {
//         fetchDoc();
//     }, []);

//     const fetchDoc = async () => {
//         const { data } = await API.get(`/api/docs/public/${token}`);
//         setDoc(data);
//     };

//     const signDoc = async () => {
//         await API.post(`/api/docs/finalize/${token}`);
//         alert("Document signed");
//     };

//     return (
//         <div className="p-10">

//         <h2>Sign Document</h2>

//         <button onClick={signDoc}>
//             Sign Document
//         </button>

//         </div>
//     );
// };

// export default PublicSigner;