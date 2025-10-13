import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { Trash2, Edit, Store, Flower, Sparkles, Crown, Star } from 'lucide-react';

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
        const res = await api.get('/floristerias');
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
      await api.delete(`/floristerias/${id}`);
      
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

  // Función para obtener colores aleatorios vibrantes
  const getRandomColor = (index) => {
    const colors = [
      'from-pink-400 via-purple-500 to-indigo-600',
      'from-orange-400 via-red-500 to-pink-600',
      'from-green-400 via-teal-500 to-cyan-600',
      'from-yellow-400 via-orange-500 to-red-600',
      'from-purple-400 via-pink-500 to-rose-600',
      'from-blue-400 via-indigo-500 to-purple-600',
      'from-emerald-400 via-teal-500 to-blue-600',
      'from-rose-400 via-pink-500 to-purple-600'
    ];
    return colors[index % colors.length];
  };

  // Función para obtener iconos aleatorios
  const getRandomIcon = (index) => {
    const icons = ['🌸', '🌺', '🌹', '🌷', '🌻', '🌼', '💐', '🎀', '✨', '🌟'];
    return icons[index % icons.length];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6 relative overflow-hidden">
      {/* Fondo animado con partículas */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-40 right-1/3 w-28 h-28 bg-yellow-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '0.5s'}}></div>
      </div>

      {/* Header con glass effect y mucho color */}
      <div className="backdrop-blur-xl bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-blue-500/20 rounded-3xl p-8 mb-8 shadow-2xl border border-white/30 relative overflow-hidden">
        {/* Elementos decorativos */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full blur-2xl opacity-30"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full blur-2xl opacity-30"></div>
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl">
              <Store className="w-8 h-8 text-white" />
            </div>
    <div>
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-pink-300 via-purple-300 to-blue-300 bg-clip-text text-transparent mb-2">
                🌸 Floristerías
              </h1>
              <p className="text-purple-200 text-lg font-medium">Gestiona todas las floristerías de tu tienda</p>
            </div>
          </div>
        <Link
          to="nuevo"
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 text-white font-bold rounded-2xl hover:from-pink-600 hover:via-purple-700 hover:to-blue-700 transition-all duration-500 transform hover:scale-110 hover:shadow-2xl hover:shadow-pink-500/50"
        >
            <Sparkles className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
            <span className="text-lg">Añadir Nueva</span>
            <div className="absolute inset-0 bg-white/20 rounded-2xl blur-sm group-hover:blur-md transition-all duration-500"></div>
        </Link>
        </div>
      </div>
      
      {/* Loading spinner mejorado y colorido */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block relative">
            <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-500 rounded-full animate-spin" style={{animationDelay: '0.1s'}}></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-500 rounded-full animate-spin" style={{animationDelay: '0.2s'}}></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-yellow-500 rounded-full animate-spin" style={{animationDelay: '0.3s'}}></div>
          </div>
          <p className="text-purple-200 mt-6 font-bold text-lg">Cargando floristerías mágicas...</p>
        </div>
      )}
      
      {/* Lista de floristerías con glass cards coloridas */}
      <div className="grid gap-6">
        {floristerias.map((flo, index) => (
          <div 
            key={flo._id} 
            className="group backdrop-blur-xl bg-gradient-to-r from-white/20 to-white/10 rounded-3xl p-8 shadow-2xl border border-white/30 hover:border-white/50 transition-all duration-500 transform hover:scale-[1.03] hover:shadow-2xl hover:shadow-purple-500/25 relative overflow-hidden"
            style={{
              animationDelay: `${index * 0.1}s`,
              animation: 'fadeInUp 0.8s ease-out forwards'
            }}
          >
            {/* Fondo de color dinámico */}
            <div className={`absolute inset-0 bg-gradient-to-r ${getRandomColor(index)} opacity-10 group-hover:opacity-20 transition-opacity duration-500 rounded-3xl`}></div>
            
            {/* Elementos decorativos */}
            <div className="absolute top-4 right-4 text-4xl opacity-60 group-hover:opacity-100 transition-opacity duration-300">
              {getRandomIcon(index)}
            </div>
            
            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`w-4 h-4 bg-gradient-to-r ${getRandomColor(index)} rounded-full animate-pulse`}></div>
                    <h3 className="text-2xl font-bold text-white group-hover:text-purple-200 transition-colors duration-300">
                      {flo.nombre}
                    </h3>
                    {/* Badge de estado */}
                    <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full text-white text-xs font-bold">
                      <Star className="w-3 h-3" />
                      Activa
                    </div>
                  </div>
                  <p className="text-purple-200 leading-relaxed pl-8 text-lg">
                    {flo.descripcion || 'Sin descripción - ¡Agrega una descripción atractiva!'}
                  </p>
                  
                  {/* Información adicional */}
                  <div className="flex items-center gap-6 mt-4 pl-8">
                    <div className="flex items-center gap-2 text-purple-300">
                      <Flower className="w-4 h-4" />
                      <span className="text-sm">Floristería</span>
                    </div>
                    <div className="flex items-center gap-2 text-purple-300">
                      <Crown className="w-4 h-4" />
                      <span className="text-sm">Calidad Garantizada</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <Link 
                    to={`${flo._id}`} 
                    className="group/edit inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 text-white font-bold rounded-2xl hover:from-blue-600 hover:via-cyan-600 hover:to-teal-600 transition-all duration-300 transform hover:scale-110 hover:shadow-xl hover:shadow-blue-500/50"
                  >
                    <Edit size={20} className="group-hover/edit:rotate-12 transition-transform duration-300" />
                  Editar
                </Link>
                  <button
                    onClick={() => handleDelete(flo._id, flo.nombre)}
                    disabled={loading}
                    className="group/delete inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 via-pink-500 to-rose-500 text-white font-bold rounded-2xl hover:from-red-600 hover:via-pink-600 hover:to-rose-600 transition-all duration-300 transform hover:scale-110 hover:shadow-xl hover:shadow-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    title="Borrar floristería"
                  >
                    <Trash2 size={20} className="group-hover/delete:shake transition-transform duration-300" />
                    Borrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Mensaje cuando no hay floristerías */}
      {!loading && floristerias.length === 0 && (
        <div className="text-center py-20">
          <div className="text-8xl mb-6 animate-bounce">🌸</div>
          <h3 className="text-3xl font-bold text-white mb-4">No hay floristerías aún</h3>
          <p className="text-purple-200 text-lg mb-8">¡Comienza creando tu primera floristería mágica!</p>
          <Link
            to="nuevo"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 text-white font-bold rounded-2xl hover:from-pink-600 hover:via-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-110 hover:shadow-2xl"
          >
            <Sparkles className="w-6 h-6" />
            Crear Primera Floristería
          </Link>
        </div>
      )}
      
      {/* Footer con estadísticas */}
      {!loading && floristerias.length > 0 && (
        <div className="backdrop-blur-xl bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-blue-500/20 rounded-3xl p-6 mt-8 border border-white/30 text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{floristerias.length}</div>
              <div className="text-purple-200">Floristerías Activas</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">✨</div>
              <div className="text-purple-200">Calidad Garantizada</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">🌟</div>
              <div className="text-purple-200">Experiencia Única</div>
            </div>
          </div>
        </div>
      )}
      
      {/* Estilos CSS personalizados */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-3px); }
          75% { transform: translateX(3px); }
        }
        
        .group\\/delete:hover .group-hover\\/delete\\:shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </div>
  );
}