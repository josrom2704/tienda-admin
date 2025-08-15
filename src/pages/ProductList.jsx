import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAxiosInstance } from '../api';

/**
 * Muestra una lista de productos (arreglos) filtrados por floristería.
 * Si se recibe un `floristeriaId` como prop, se utiliza directamente y
 * no se muestra el selector de floristerías. De lo contrario, se
 * cargan las floristerías disponibles para permitir al usuario elegir.
 */
export default function ProductList({ floristeriaId }) {
  const { token } = useAuth();
  const [floristerias, setFloristerias] = useState([]);
  const [selectedFloristeria, setSelectedFloristeria] = useState(floristeriaId || '');
  const [productos, setProductos] = useState([]);

  // Si no se pasa floristeriaId, cargar floristerías para selección
  useEffect(() => {
    if (!floristeriaId) {
      (async () => {
        try {
          const axiosInstance = getAxiosInstance(token);
          const res = await axiosInstance.get('/floristerias');
          setFloristerias(res.data);
        } catch (error) {
          console.error(error);
        }
      })();
    }
  }, [floristeriaId, token]);

  // Cargar productos cuando se selecciona una floristería
  useEffect(() => {
    if (selectedFloristeria) {
      (async () => {
        try {
          const axiosInstance = getAxiosInstance(token);
          const res = await axiosInstance.get(`/flores/floristeria/${selectedFloristeria}`);
          setProductos(res.data);
        } catch (error) {
          console.error(error);
        }
      })();
    } else {
      setProductos([]);
    }
  }, [selectedFloristeria, token]);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Arreglos</h2>
        {selectedFloristeria && (
          <Link
            to={`nuevo?floristeria=${selectedFloristeria}`}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
          >
            Añadir
          </Link>
        )}
      </div>
      {/* Mostrar selector sólo si no se ha forzado una floristería */}
      {!floristeriaId && (
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Seleccionar Floristería</label>
          <select
            value={selectedFloristeria}
            onChange={(e) => setSelectedFloristeria(e.target.value)}
            className="w-full border p-2 rounded"
          >
            <option value="">-- Seleccione --</option>
            {floristerias.map((flo) => (
              <option key={flo._id} value={flo._id}>
                {flo.nombre}
              </option>
            ))}
          </select>
        </div>
      )}
      {selectedFloristeria && (
        <table className="w-full border-collapse bg-white rounded shadow">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2">Nombre</th>
              <th className="p-2">Categoría</th>
              <th className="p-2">Precio</th>
              <th className="p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((prod) => (
              <tr key={prod._id} className="border-b">
                <td className="p-2">{prod.nombre}</td>
                <td className="p-2">{prod.categoria}</td>
                <td className="p-2">${prod.precio}</td>
                <td className="p-2 space-x-2">
                  <Link
                    to={`${prod._id}?floristeria=${selectedFloristeria}`}
                    className="text-blue-600 hover:underline"
                  >
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}