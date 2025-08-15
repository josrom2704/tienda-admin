import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAxiosInstance } from '../api';

/**
 * Muestra una lista de usuarios con opción para añadir nuevos. Los
 * administradores pueden ver todos los usuarios registrados y crear
 * nuevos usuarios asignando roles y floristerías.
 */
export default function UserList() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const axiosInstance = getAxiosInstance(token);
        const res = await axiosInstance.get('/users');
        setUsers(res.data);
      } catch (error) {
        console.error(error);
      }
    })();
  }, [token]);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Usuarios</h2>
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
            <th className="p-2">Usuario</th>
            <th className="p-2">Rol</th>
            <th className="p-2">Floristería</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id} className="border-b">
              <td className="p-2">{u.username}</td>
              <td className="p-2">{u.role}</td>
              <td className="p-2">{u.floristeria?.nombre || 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}