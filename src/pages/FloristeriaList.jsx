import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAxiosInstance } from '../api';
import { Trash2, Edit } from 'lucide-react';

/**
 * Muestra una lista de floristerías con opción para añadir una nueva y
 * editar las existentes. Se cargan todas las floristerías mediante
 * una petición autenticada al backend.
 */
export default function FloristeriaList() {
  const { token } = useAuth();
  const [floristerias, setFloristerias] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFloristerias();
  }, [token]);

  const fetchFloristerias = async () => {
    try {
      setLoading(true);
      const axiosInstance = getAxiosInstance(token);
      const res = await axiosInstance.get('/floristerias');
      setFloristerias(res.data);
    } catch (error) {
      console.error('Error al cargar floristerías:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, nombre) => {
    if (!window.confirm(`¿Estás seguro de que quieres borrar la floristería "${nombre}"?`)) {
      return;
    }

    try {
      setLoading(true);
      const axiosInstance = getAxiosInstance(token);
      await axiosInstance.delete(`/floristerias/${id}`);
      
      // Recargar la lista después del borrado
      await fetchFloristerias();
      
      alert('Floristería borrada exitosamente');
    } catch (error) {
      console.error('Error al borrar floristería:', error);
      alert('Error al borrar la floristería. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100 p-6">
      {/* Header con glass effect */}
      <div className="backdrop-blur-md bg-white/30 rounded-3xl p-6 mb-8 shadow-xl border border-white/20">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              🌸 Floristerías
            </h1>
            <p className="text-gray-600 mt-2">Gestiona todas las floristerías de tu tienda</p>
          </div>
          <Link
            to="nuevo"
            className="group relative inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-2xl hover:from-pink-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
          >
            <span className="mr-2">✨</span>
            Añadir Nueva
            <div className="absolute inset-0 bg-white/20 rounded-2xl blur-sm group-hover:blur-md transition-all duration-300"></div>
          </Link>
        </div>
      </div>
      
      {/* Loading spinner mejorado */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block relative">
            <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-purple-600 rounded-full animate-spin" style={{animationDelay: '0.1s'}}></div>
            <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-blue-600 rounded-full animate-spin" style={{animationDelay: '0.2s'}}></div>
          </div>
          <p className="text-gray-600 mt-4 font-medium">Cargando floristerías...</p>
        </div>
      )}
      
      {/* Lista de floristerías con glass cards */}
      <div className="grid gap-6">
        {floristerias.map((flo, index) => (
          <div 
            key={flo._id} 
            className="group backdrop-blur-md bg-white/40 rounded-2xl p-6 shadow-xl border border-white/30 hover:bg-white/50 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl"
            style={{
              animationDelay: `${index * 0.1}s`,
              animation: 'fadeInUp 0.6s ease-out forwards'
            }}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center mb-3">
                  <div className="w-3 h-3 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full mr-3"></div>
                  <h3 className="text-xl font-bold text-gray-800 group-hover:text-purple-700 transition-colors">
                    {flo.nombre}
                  </h3>
                </div>
                <p className="text-gray-600 leading-relaxed pl-6">
                  {flo.descripcion || 'Sin descripción'}
                </p>
              </div>
              
              <div className="flex items-center space-x-3 ml-4">
                <Link 
                  to={`${flo._id}`} 
                  className="group/edit inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                >
                  <Edit size={18} className="mr-2 group-hover/edit:rotate-12 transition-transform" />
                  Editar
                </Link>
                <button
                  onClick={() => handleDelete(flo._id, flo.nombre)}
                  disabled={loading}
                  className="group/delete inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white font-medium rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  title="Borrar floristería"
                >
                  <Trash2 size={18} className="mr-2 group-hover/delete:shake transition-transform" />
                  Borrar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Mensaje cuando no hay floristerías */}
      {!loading && floristerias.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🌸</div>
          <h3 className="text-2xl font-bold text-gray-700 mb-2">No hay floristerías</h3>
          <p className="text-gray-500">Comienza agregando tu primera floristería</p>
        </div>
      )}
      
      {/* Estilos CSS personalizados */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-2px); }
          75% { transform: translateX(2px); }
        }
        
        .group\\/delete:hover .group-hover\\/delete\\:shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}