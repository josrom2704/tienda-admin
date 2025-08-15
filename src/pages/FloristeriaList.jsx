import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAxiosInstance } from '../api';

/**
 * Muestra una lista de floristerías con opción para añadir una nueva y
 * editar las existentes. Se cargan todas las floristerías mediante
 * una petición autenticada al backend.
 */
export default function FloristeriaList() {
  const { token } = useAuth();
  const [floristerias, setFloristerias] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const axiosInstance = getAxiosInstance(token);
        const res = await axiosInstance.get('/floristerias');
        setFloristerias(res.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, [token]);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Floristerías</h2>
        <Link
          to="nuevo"
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
        >
          Añadir
        </Link>
      </div>
      <table className="w-full border-collapse bg-white rounded shadow">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 text-left">Nombre</th>
            <th className="p-2 text-left">Descripción</th>
            <th className="p-2 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {floristerias.map((flo) => (
            <tr key={flo._id} className="border-b">
              <td className="p-2">{flo.nombre}</td>
              <td className="p-2">{flo.descripcion}</td>
              <td className="p-2 space-x-2">
                <Link to={`${flo._id}`} className="text-blue-600 hover:underline">
                  Editar
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}