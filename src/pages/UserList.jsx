import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAxiosInstance } from '../api';
import { Trash2, Edit, Plus, User, Crown, Store, Shield } from 'lucide-react';

/**
 * Muestra una lista de usuarios con opción para añadir nuevos. Los
 * administradores pueden ver todos los usuarios registrados y crear
 * nuevos usuarios asignando roles y floristerías.
 */
export default function UserList() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const axiosInstance = getAxiosInstance(token);
      const res = await axiosInstance.get('/users');
      setUsers(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Función para eliminar usuario
  const handleDelete = async (userId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.')) {
      return;
    }

    setDeletingId(userId);
    try {
      const axiosInstance = getAxiosInstance(token);
      await axiosInstance.delete(`/users/${userId}`);
      
      // Actualizar la lista
      setUsers(users.filter(u => u._id !== userId));
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      alert('Error al eliminar el usuario');
    } finally {
      setDeletingId(null);
    }
  };

  // Función para obtener el icono del rol
  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'usuario':
        return <User className="w-4 h-4 text-blue-500" />;
      default:
        return <Shield className="w-4 h-4 text-gray-500" />;
    }
  };

  // Función para obtener el color del rol
  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'from-yellow-500 to-orange-500';
      case 'usuario':
        return 'from-blue-500 to-cyan-500';
      default:
        return 'from-gray-500 to-slate-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      {/* Header Glass */}
      <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-6 mb-8 border border-white/20 shadow-2xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              👥 Gestión de Usuarios
            </h1>
            <p className="text-purple-200 mt-2 text-lg">
              Administra las cuentas de tu sistema
            </p>
          </div>
          <Link
            to="nuevo"
            className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-2xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-pink-500/25"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            Añadir Usuario
          </Link>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500"></div>
        </div>
      )}

      {/* Lista de Usuarios Glass */}
      {!loading && (
        <div className="space-y-6">
          {users.length === 0 ? (
            <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-12 text-center border border-white/20 shadow-xl">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-2xl font-semibold text-white mb-2">No hay usuarios registrados</h3>
              <p className="text-purple-200 mb-6">Comienza creando el primer usuario del sistema</p>
              <Link
                to="nuevo"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-2xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-300"
              >
                <Plus className="w-5 h-5" />
                Crear Primer Usuario
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {users.map((user) => (
                <div
                  key={user._id}
                  className="group backdrop-blur-xl bg-white/10 rounded-3xl p-6 border border-white/20 shadow-xl hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2"
                >
                  {/* Avatar del Usuario */}
                  <div className="relative mb-4">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                      {user.username?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    {/* Indicador de rol */}
                    <div className="absolute -top-2 -right-2">
                      <div className={`w-8 h-8 bg-gradient-to-r ${getRoleColor(user.role)} rounded-full flex items-center justify-center shadow-lg`}>
                        {getRoleIcon(user.role)}
                      </div>
                    </div>
                  </div>

                  {/* Información del Usuario */}
                  <div className="space-y-3 text-center">
                    {/* Nombre de Usuario */}
                    <h3 className="text-xl font-bold text-white group-hover:text-purple-200 transition-colors duration-300">
                      {user.username}
                    </h3>

                    {/* Email */}
                    {user.email && (
                      <p className="text-purple-200 text-sm break-all">
                        {user.email}
                      </p>
                    )}

                    {/* Rol */}
                    <div className="flex items-center justify-center gap-2">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getRoleColor(user.role)} text-white`}>
                        {getRoleIcon(user.role)}
                        {user.role === 'admin' ? 'Administrador' : 'Usuario'}
                      </span>
                    </div>

                    {/* Floristería */}
                    {user.floristeria && (
                      <div className="flex items-center justify-center gap-2 text-purple-200 text-sm">
                        <Store className="w-4 h-4" />
                        <span>{user.floristeria.nombre}</span>
                      </div>
                    )}

                    {/* Fecha de Creación */}
                    {user.createdAt && (
                      <p className="text-purple-300 text-xs">
                        Creado: {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  {/* Botones de Acción */}
                  <div className="flex gap-2 pt-4">
                    <Link
                      to={`${user._id}`}
                      className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-xl font-medium hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 transform hover:scale-105"
                    >
                      <Edit className="w-4 h-4" />
                      Editar
                    </Link>
                    <button
                      onClick={() => handleDelete(user._id)}
                      disabled={deletingId === user._id}
                      className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-xl font-medium hover:from-red-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deletingId === user._id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                      {deletingId === user._id ? 'Eliminando...' : 'Eliminar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Footer Glass */}
      {!loading && users.length > 0 && (
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-6 mt-8 border border-white/20 shadow-xl text-center">
          <p className="text-purple-200">
            Total de usuarios: <span className="font-bold text-white">{users.length}</span>
          </p>
        </div>
      )}
    </div>
  );
}