import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAxiosInstance } from '../api';
import { 
  Trash2, 
  Edit, 
  Plus, 
  Flower, 
  Package, 
  Wine, 
  Gift, 
  CheckSquare, 
  Square,
  AlertTriangle,
  Trash,
  CheckCircle,
  XCircle
} from 'lucide-react';

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
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Si no se pasa floristeriaId, cargar floristerías para selección
  useEffect(() => {
    if (!floristeriaId) {
      (async () => {
        try {
          const axiosInstance = getAxiosInstance(token);
          const res = await axiosInstance.get('/floristerias');
          setFloristerias(res.data);
        } catch (error) {
          console.error('Error cargando floristerías:', error);
          showMessage('error', 'Error al cargar floristerías');
        }
      })();
    }
  }, [floristeriaId, token]);

  // Cargar productos cuando se selecciona una floristería
  useEffect(() => {
    if (selectedFloristeria) {
      fetchProductos();
    } else {
      setProductos([]);
    }
  }, [selectedFloristeria, token]);

  // Función para mostrar mensajes
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  // Función para cargar productos
  const fetchProductos = async () => {
    setLoading(true);
    try {
      const axiosInstance = getAxiosInstance(token);
      console.log('🔄 Cargando productos para floristería:', selectedFloristeria);
      
      const res = await axiosInstance.get(`/flores/floristeria/${selectedFloristeria}`);
      console.log('✅ Productos cargados:', res.data);
      
      setProductos(res.data);
      // Limpiar selección al cambiar floristería
      setSelectedProducts(new Set());
    } catch (error) {
      console.error('❌ Error cargando productos:', error);
      showMessage('error', 'Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  // Función para eliminar producto individual
  const handleDelete = async (productId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este arreglo?')) {
      return;
    }

    setDeletingId(productId);
    console.log('🗑️ Intentando eliminar producto:', productId);
    
    try {
      const axiosInstance = getAxiosInstance(token);
      
      // Hacer la petición DELETE
      const response = await axiosInstance.delete(`/flores/${productId}`);
      console.log('✅ Respuesta del backend:', response);
      
      if (response.status === 200 || response.status === 204) {
        // Eliminar del estado local inmediatamente
        setProductos(prevProductos => prevProductos.filter(p => p._id !== productId));
        
        // Mostrar mensaje de éxito
        showMessage('success', 'Producto eliminado exitosamente');
        
        // Recargar la lista para asegurar sincronización
        setTimeout(() => {
          fetchProductos();
        }, 1000);
      } else {
        throw new Error(`Status inesperado: ${response.status}`);
      }
      
    } catch (error) {
      console.error('❌ Error eliminando producto:', error);
      
      // Mostrar error específico
      let errorMessage = 'Error al eliminar el producto';
      if (error.response) {
        errorMessage = `Error ${error.response.status}: ${error.response.data?.message || 'Error del servidor'}`;
      } else if (error.request) {
        errorMessage = 'No se pudo conectar con el servidor';
      } else {
        errorMessage = error.message;
      }
      
      showMessage('error', errorMessage);
      
      // Recargar la lista para ver el estado real
      setTimeout(() => {
        fetchProductos();
      }, 1000);
    } finally {
      setDeletingId(null);
    }
  };

  // Función para borrado masivo
  const handleBulkDelete = async () => {
    if (selectedProducts.size === 0) {
      showMessage('error', 'Por favor, selecciona al menos un producto para eliminar.');
      return;
    }

    const confirmMessage = `¿Estás seguro de que quieres eliminar ${selectedProducts.size} producto(s)? Esta acción no se puede deshacer.`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setBulkDeleting(true);
    console.log('🗑️ Iniciando borrado masivo de:', Array.from(selectedProducts));
    
    try {
      const axiosInstance = getAxiosInstance(token);
      
      // Eliminar productos uno por uno
      const deletePromises = Array.from(selectedProducts).map(async (productId) => {
        try {
          const response = await axiosInstance.delete(`/flores/${productId}`);
          console.log(`✅ Producto ${productId} eliminado:`, response.status);
          return { success: true, id: productId };
        } catch (error) {
          console.error(`❌ Error eliminando producto ${productId}:`, error);
          return { success: false, id: productId, error: error.message };
        }
      });
      
      const results = await Promise.all(deletePromises);
      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);
      
      console.log('📊 Resultados del borrado masivo:', { successful, failed });
      
      if (successful.length > 0) {
        // Actualizar estado local
        setProductos(prevProductos => 
          prevProductos.filter(p => !selectedProducts.has(p._id))
        );
        
        // Mostrar mensaje de éxito
        showMessage('success', `${successful.length} producto(s) eliminado(s) exitosamente`);
      }
      
      if (failed.length > 0) {
        showMessage('error', `${failed.length} producto(s) no se pudieron eliminar`);
      }
      
      // Limpiar selección
      setSelectedProducts(new Set());
      
      // Recargar la lista para asegurar sincronización
      setTimeout(() => {
        fetchProductos();
      }, 1000);
      
    } catch (error) {
      console.error('❌ Error en borrado masivo:', error);
      showMessage('error', 'Error en el borrado masivo. Inténtalo de nuevo.');
    } finally {
      setBulkDeleting(false);
    }
  };

  // Función para manejar selección individual
  const handleProductSelect = (productId) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  // Función para seleccionar/deseleccionar todos
  const handleSelectAll = () => {
    if (selectedProducts.size === productos.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(productos.map(p => p._id)));
    }
  };

  // Función para obtener el icono de categoría
  const getCategoryIcon = (categoria) => {
    const cat = categoria?.toLowerCase();
    if (cat?.includes('flor') || cat?.includes('rama')) return <Flower className="w-4 h-4" />;
    if (cat?.includes('vino') || cat?.includes('whisky') || cat?.includes('licor')) return <Wine className="w-4 h-4" />;
    if (cat?.includes('regalo') || cat?.includes('navideño')) return <Gift className="w-4 h-4" />;
    return <Package className="w-4 h-4" />;
  };

  // Función para obtener el color de categoría
  const getCategoryColor = (categoria) => {
    const cat = categoria?.toLowerCase();
    if (cat?.includes('flor') || cat?.includes('rama')) return 'from-pink-500 to-rose-500';
    if (cat?.includes('vino') || cat?.includes('whisky') || cat?.includes('licor')) return 'from-purple-500 to-indigo-500';
    if (cat?.includes('regalo') || cat?.includes('navideño')) return 'from-green-500 to-emerald-500';
    return 'from-gray-500 to-slate-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      {/* Mensajes de estado */}
      {message.text && (
        <div className={`fixed top-6 right-6 z-50 p-4 rounded-2xl shadow-2xl backdrop-blur-xl border transition-all duration-500 ${
          message.type === 'success' 
            ? 'bg-green-500/20 border-green-400/30 text-green-200' 
            : 'bg-red-500/20 border-red-400/30 text-red-200'
        }`}>
          <div className="flex items-center gap-3">
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-400" />
            ) : (
              <XCircle className="w-5 h-5 text-red-400" />
            )}
            <span className="font-medium">{message.text}</span>
          </div>
        </div>
      )}

      {/* Header Glass */}
      <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-6 mb-8 border border-white/20 shadow-2xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              🌸 Arreglos Florales
            </h1>
            <p className="text-purple-200 mt-2 text-lg">
              Gestiona tu catálogo de arreglos elegantes
            </p>
          </div>
          {selectedFloristeria && (
            <Link
              to={`nuevo?floristeria=${selectedFloristeria}`}
              className="group relative inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-2xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-pink-500/25"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              Añadir Arreglo
            </Link>
          )}
        </div>
      </div>

      {/* Selector de Floristería Glass */}
      {!floristeriaId && (
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 mb-8 border border-white/20 shadow-xl">
          <label className="block text-white/90 mb-3 text-lg font-medium">
            🏪 Seleccionar Floristería
          </label>
          <select
            value={selectedFloristeria}
            onChange={(e) => setSelectedFloristeria(e.target.value)}
            className="w-full bg-white/20 border border-white/30 text-white p-4 rounded-xl backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 placeholder-white/50"
          >
            <option value="" className="text-gray-800">-- Seleccione una Floristería --</option>
            {floristerias.map((flo) => (
              <option key={flo._id} value={flo._id} className="text-gray-800">
                {flo.nombre}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Barra de Acciones Múltiples */}
      {selectedFloristeria && productos.length > 0 && (
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 mb-6 border border-white/20 shadow-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={handleSelectAll}
                className="flex items-center gap-2 text-purple-200 hover:text-white transition-colors duration-200"
              >
                {selectedProducts.size === productos.length ? (
                  <CheckSquare className="w-5 h-5 text-purple-400" />
                ) : (
                  <Square className="w-5 h-5 text-purple-400" />
                )}
                <span className="font-medium">
                  {selectedProducts.size === productos.length ? 'Deseleccionar Todo' : 'Seleccionar Todo'}
                </span>
              </button>
              
              {selectedProducts.size > 0 && (
                <div className="flex items-center gap-2 text-purple-200">
                  <span className="font-medium">
                    {selectedProducts.size} producto(s) seleccionado(s)
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              {/* Botón de Test de Backend */}
              <button
                onClick={async () => {
                  if (productos.length === 0) {
                    showMessage('error', 'No hay productos para testear');
                    return;
                  }
                  
                  const testProduct = productos[0];
                  console.log('🧪 TEST BACKEND - Producto:', testProduct);
                  
                  try {
                    const axiosInstance = getAxiosInstance(token);
                    
                    // Test 1: Verificar que el producto existe
                    console.log('🧪 TEST 1: Verificando que el producto existe...');
                    const getResponse = await axiosInstance.get(`/flores/${testProduct._id}`);
                    console.log('✅ Producto existe:', getResponse.data);
                    
                    // Test 2: Intentar eliminar
                    console.log('🧪 TEST 2: Intentando eliminar...');
                    const deleteResponse = await axiosInstance.delete(`/flores/${testProduct._id}`);
                    console.log('✅ Respuesta DELETE:', deleteResponse);
                    
                    // Test 3: Verificar si realmente se eliminó
                    console.log('🧪 TEST 3: Verificando si se eliminó...');
                    setTimeout(async () => {
                      try {
                        const verifyResponse = await axiosInstance.get(`/flores/${testProduct._id}`);
                        console.log('❌ PRODUCTO SIGUE EXISTIENDO:', verifyResponse.data);
                        showMessage('error', 'PRODUCTO NO SE ELIMINÓ DEL BACKEND');
                      } catch (verifyError) {
                        if (verifyError.response?.status === 404) {
                          console.log('✅ PRODUCTO ELIMINADO CORRECTAMENTE');
                          showMessage('success', 'PRODUCTO ELIMINADO DEL BACKEND');
                        } else {
                          console.log('❌ Error verificando:', verifyError);
                        }
                      }
                    }, 2000);
                    
                  } catch (error) {
                    console.error('❌ TEST BACKEND FALLÓ:', error);
                    showMessage('error', `Test falló: ${error.message}`);
                  }
                }}
                className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-xl font-semibold hover:from-yellow-600 hover:to-orange-600 transition-all duration-300"
              >
                🧪 Test Backend
              </button>
              
              {selectedProducts.size > 0 && (
                <button
                  onClick={handleBulkDelete}
                  disabled={bulkDeleting}
                  className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-red-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {bulkDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Eliminando...
                    </>
                  ) : (
                    <>
                      <Trash className="w-5 h-5" />
                      Eliminar Seleccionados ({selectedProducts.size})
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500"></div>
        </div>
      )}

      {/* Lista de Productos Glass */}
      {selectedFloristeria && !loading && (
        <div className="space-y-6">
          {productos.length === 0 ? (
            <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-12 text-center border border-white/20 shadow-xl">
              <div className="text-6xl mb-4">🌸</div>
              <h3 className="text-2xl font-semibold text-white mb-2">No hay arreglos aún</h3>
              <p className="text-purple-200 mb-6">Comienza creando tu primer arreglo floral</p>
              <Link
                to={`nuevo?floristeria=${selectedFloristeria}`}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-2xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-300"
              >
                <Plus className="w-5 h-5" />
                Crear Primer Arreglo
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {productos.map((prod) => (
                <div
                  key={prod._id}
                  className={`group backdrop-blur-xl bg-white/10 rounded-3xl p-6 border transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 relative ${
                    selectedProducts.has(prod._id) 
                      ? 'border-purple-400 shadow-2xl shadow-purple-500/50' 
                      : 'border-white/20 shadow-xl hover:shadow-2xl hover:shadow-purple-500/25'
                  }`}
                >
                  {/* Checkbox de Selección */}
                  <div className="absolute top-4 right-4 z-10">
                    <button
                      onClick={() => handleProductSelect(prod._id)}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        selectedProducts.has(prod._id)
                          ? 'bg-purple-500 text-white'
                          : 'bg-white/20 text-white/60 hover:bg-white/30'
                      }`}
                    >
                      {selectedProducts.has(prod._id) ? (
                        <CheckSquare className="w-4 h-4" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Imagen del Producto */}
                  <div className="relative mb-4 rounded-2xl overflow-hidden bg-gradient-to-br from-purple-400/20 to-pink-400/20 h-48 flex items-center justify-center">
                    {prod.imagen ? (
                      <img
                        src={prod.imagen}
                        alt={prod.nombre}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="text-6xl text-white/50">🌸</div>
                    )}
                    {/* Overlay Glass */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  {/* Información del Producto */}
                  <div className="space-y-3">
                    {/* Nombre */}
                    <h3 className="text-xl font-bold text-white group-hover:text-purple-200 transition-colors duration-300">
                      {prod.nombre}
                    </h3>

                    {/* Descripción */}
                    {prod.descripcion && (
                      <p className="text-purple-200 text-sm line-clamp-2">
                        {prod.descripcion}
                      </p>
                    )}

                    {/* Categoría */}
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getCategoryColor(prod.categoria)} text-white`}>
                        {getCategoryIcon(prod.categoria)}
                        {prod.categoria}
                      </span>
                    </div>

                    {/* Precio */}
                    <div className="text-2xl font-bold text-white">
                      ${prod.precio}
                    </div>

                    {/* Stock */}
                    {prod.stock !== undefined && (
                      <div className="text-sm text-purple-200">
                        Stock: {prod.stock} unidades
                      </div>
                    )}

                    {/* Botones de Acción */}
                    <div className="flex gap-2 pt-2">
                      <Link
                        to={`${prod._id}?floristeria=${selectedFloristeria}`}
                        className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-xl font-medium hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 transform hover:scale-105"
                      >
                        <Edit className="w-4 h-4" />
                        Editar
                      </Link>
                      <button
                        onClick={() => handleDelete(prod._id)}
                        disabled={deletingId === prod._id}
                        className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-xl font-medium hover:from-red-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deletingId === prod._id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                        {deletingId === prod._id ? 'Eliminando...' : 'Eliminar'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Footer Glass */}
      {selectedFloristeria && productos.length > 0 && (
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-6 mt-8 border border-white/20 shadow-xl text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{productos.length}</div>
              <div className="text-purple-200">Total de Arreglos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{selectedProducts.size}</div>
              <div className="text-purple-200">Seleccionados</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">✨</div>
              <div className="text-purple-200">Calidad Garantizada</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}