import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAxiosInstance } from '../api';
import { testApiConnection, testProductCreation } from '../utils/apiTest';
import { debugImageUpload, testWithGeneratedImage } from '../utils/debugImage';
import { simpleImageTest } from '../utils/simpleImageTest';
import { healthCheck } from '../utils/healthCheck';
import { testBackendSimple, testPostVariations, testFormData } from '../utils/backendTest';
import { minimalTest, testMongoConnection } from '../utils/minimalTest';

/**
 * Formulario para crear o editar un arreglo/producto. Recibe un parámetro
 * opcional `id` para editar, y lee el parámetro de consulta `floristeria`
 * para asociar el producto a una floristería. Incluye campos para nombre,
 * descripción, precio, stock, categoría e imagen.
 */
export default function ProductForm() {
  const { token } = useAuth();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const floristeriaFromQuery = searchParams.get('floristeria');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    stock: '',
    categoria: '',
    imagen: null,
    floristeria: floristeriaFromQuery || ''
  });

  // Cargar datos de producto existente
  useEffect(() => {
    if (id) {
      (async () => {
        try {
          const axiosInstance = getAxiosInstance(token);
          const res = await axiosInstance.get(`/flores/${id}`);
          const { nombre, descripcion, precio, stock, categoria, floristeria } = res.data;
          setForm({
            nombre,
            descripcion,
            precio,
            stock,
            categoria,
            imagen: null,
            floristeria
          });
        } catch (error) {
          console.error(error);
        }
      })();
    }
  }, [id, token]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (files) {
      const file = files[0];
      
      // Validación de imagen
      if (name === 'imagen') {
        // Verificar tipo de archivo
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
          setError('Solo se permiten archivos de imagen (JPEG, PNG, GIF, WebP)');
          return;
        }
        
        // Verificar tamaño (5MB máximo)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
          setError('La imagen debe ser menor a 5MB');
          return;
        }
        
        console.log('🖼️ Imagen válida seleccionada:', {
          name: file.name,
          type: file.type,
          size: (file.size / 1024 / 1024).toFixed(2) + 'MB'
        });
        
        setError(''); // Limpiar errores previos
      }
      
      setForm({ ...form, [name]: file });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleTestApi = async () => {
    setTesting(true);
    setTestResults(null);
    
    try {
      const results = await testApiConnection(token);
      setTestResults(results);
      
      if (results.success) {
        console.log('✅ Pruebas de API exitosas:', results);
      } else {
        console.error('❌ Pruebas de API fallaron:', results.error);
      }
    } catch (error) {
      console.error('❌ Error en las pruebas:', error);
      setTestResults({
        success: false,
        message: 'Error inesperado en las pruebas',
        error: { message: error.message }
      });
    } finally {
      setTesting(false);
    }
  };

  const handleTestImageUpload = async () => {
    if (!form.imagen) {
      setError('Primero selecciona una imagen para probar');
      return;
    }
    
    setTesting(true);
    setError('');
    
    try {
      console.log('🧪 Probando subida de imagen...');
      
      const testData = {
        nombre: 'TEST_IMAGEN',
        descripcion: 'Prueba de subida de imagen',
        precio: '1.00',
        stock: '1',
        categoria: 'Flores',
        floristeria: form.floristeria || 'test',
        imagen: form.imagen
      };
      
      const results = await testProductCreation(token, testData);
      
      if (results.success) {
        setError('');
        alert('✅ Prueba de imagen exitosa! La imagen se subió correctamente.');
        console.log('✅ Imagen subida exitosamente:', results.data);
      } else {
        setError(`❌ Error en prueba de imagen: ${results.error.message}`);
        console.error('❌ Error al subir imagen de prueba:', results.error);
      }
      
    } catch (error) {
      console.error('❌ Error inesperado en prueba de imagen:', error);
      setError('Error inesperado en la prueba de imagen');
    } finally {
      setTesting(false);
    }
  };

  const handleTestGeneratedImage = async () => {
    setTesting(true);
    setError('');
    
    try {
      console.log('🎨 Probando con imagen generada...');
      
      const testResult = await testWithGeneratedImage(token);
      
      if (!testResult.success) {
        setError('Error creando imagen de prueba');
        return;
      }
      
      // Intentar subir la imagen generada
      const axiosInstance = getAxiosInstance(token);
      
      console.log('🚀 Enviando imagen generada al servidor...');
      
      const response = await axiosInstance.post('/flores', testResult.formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json'
        },
        timeout: 30000,
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });
      
      console.log('✅ Imagen generada subida exitosamente:', response.data);
      setError('');
      alert('✅ Prueba con imagen generada exitosa! La API funciona correctamente.');
      
    } catch (error) {
      console.error('❌ Error al subir imagen generada:', error);
      
      const errorMessage = error.response?.data?.message || error.message;
      setError(`❌ Error en prueba con imagen generada: ${errorMessage}`);
      
      // Log detallado del error
      console.error('📊 Detalles del error:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
      });
    } finally {
      setTesting(false);
    }
  };

  const handleHealthCheck = async () => {
    setTesting(true);
    setError('');
    
    try {
      console.log('🏥 Iniciando verificación de salud del backend...');
      
      const results = await healthCheck();
      
      if (results.success) {
        console.log('✅ Verificación de salud completada:', results);
        setError('');
        alert('✅ Verificación de salud completada. Revisa la consola para detalles.');
      } else {
        console.error('❌ Error en verificación de salud:', results.error);
        setError('Error en la verificación de salud');
      }
      
    } catch (error) {
      console.error('❌ Error inesperado en verificación de salud:', error);
      setError('Error inesperado en la verificación de salud');
    } finally {
      setTesting(false);
    }
  };

  const handleBackendTest = async () => {
    setTesting(true);
    setError('');
    
    try {
      console.log('🧪 Iniciando pruebas del backend...');
      
      await testBackendSimple();
      setError('');
      alert('✅ Pruebas del backend completadas. Revisa la consola para detalles.');
      
    } catch (error) {
      console.error('❌ Error en pruebas del backend:', error);
      setError('Error en las pruebas del backend');
    } finally {
      setTesting(false);
    }
  };

  const handlePostVariations = async () => {
    setTesting(true);
    setError('');
    
    try {
      console.log('🧪 Iniciando pruebas de POST con variaciones...');
      
      await testPostVariations();
      setError('');
      alert('✅ Pruebas de POST completadas. Revisa la consola para detalles.');
      
    } catch (error) {
      console.error('❌ Error en pruebas de POST:', error);
      setError('Error en las pruebas de POST');
    } finally {
      setTesting(false);
    }
  };

  const handleFormDataTest = async () => {
    setTesting(true);
    setError('');
    
    try {
      console.log('🧪 Iniciando prueba con FormData...');
      
      await testFormData();
      setError('');
      alert('✅ Prueba con FormData completada. Revisa la consola para detalles.');
      
    } catch (error) {
      console.error('❌ Error en prueba con FormData:', error);
      setError('Error en la prueba con FormData');
    } finally {
      setTesting(false);
    }
  };

  const handleMinimalTest = async () => {
    setTesting(true);
    setError('');
    
    try {
      console.log('🧪 Iniciando test mínimo...');
      
      await minimalTest();
      setError('');
      alert('✅ Test mínimo completado. Revisa la consola para detalles.');
      
    } catch (error) {
      console.error('❌ Error en test mínimo:', error);
      setError('Error en el test mínimo');
    } finally {
      setTesting(false);
    }
  };

  const handleMongoTest = async () => {
    setTesting(true);
    setError('');
    
    try {
      console.log('🗄️ Iniciando test de MongoDB...');
      
      await testMongoConnection();
      setError('');
      alert('✅ Test de MongoDB completado. Revisa la consola para detalles.');
      
    } catch (error) {
      console.error('❌ Error en test de MongoDB:', error);
      setError('Error en el test de MongoDB');
    } finally {
      setTesting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación básica
    if (!form.nombre || !form.precio || !form.stock || !form.categoria || !form.floristeria) {
      setError('Por favor, completa todos los campos obligatorios');
      return;
    }

    setLoading(true);
    setError('');
    
    console.log('🚀 Iniciando envío del formulario...');
    console.log('📋 Datos del formulario:', form);
    
    const formData = new FormData();
    
    // Agregar campos básicos
    formData.append('nombre', form.nombre);
    formData.append('descripcion', form.descripcion);
    formData.append('precio', form.precio);
    formData.append('stock', form.stock);
    formData.append('categoria', form.categoria);
    formData.append('floristeria', form.floristeria);
    
    // Agregar imagen si existe
    if (form.imagen) {
      console.log('🖼️ Preparando imagen para envío:', {
        name: form.imagen.name,
        type: form.imagen.type,
        size: (form.imagen.size / 1024 / 1024).toFixed(2) + 'MB'
      });
      
      formData.append('imagen', form.imagen, form.imagen.name);
      console.log('✅ Imagen agregada al FormData');
    } else {
      console.log('ℹ️ No hay imagen para enviar');
    }
    
    // Diagnóstico completo de la imagen
    debugImageUpload(formData, token);
    
    try {
      const axiosInstance = getAxiosInstance(token);
      console.log('🔑 Token disponible:', !!token);
      console.log('🌐 URL base:', axiosInstance.defaults.baseURL);
      
      if (id) {
        console.log('✏️ Actualizando producto existente...');
        await axiosInstance.put(`/flores/${id}`, formData, {
          headers: { 
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json'
          },
          timeout: 30000, // 30 segundos de timeout
          maxContentLength: Infinity,
          maxBodyLength: Infinity
        });
        console.log('✅ Producto actualizado exitosamente');
      } else {
        console.log('➕ Creando nuevo producto...');
        const response = await axiosInstance.post('/flores', formData, {
          headers: { 
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json'
          },
          timeout: 30000, // 30 segundos de timeout
          maxContentLength: Infinity,
          maxBodyLength: Infinity
        });
        console.log('✅ Producto creado exitosamente:', response.data);
      }
      
      navigate(`/admin/productos?floristeria=${form.floristeria}`);
    } catch (error) {
      console.error('❌ Error en la operación:', error);
      console.error('📊 Detalles del error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      
      setError(
        error.response?.data?.message || 
        error.message || 
        'Error al procesar la solicitud. Revisa la consola para más detalles.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header con glass effect */}
        <div className="backdrop-blur-md bg-white/30 rounded-3xl p-6 mb-8 shadow-xl border border-white/20">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-2">
            {id ? '✏️ Editar' : '✨ Añadir'} Arreglo
          </h1>
          <p className="text-gray-600">Completa los datos del nuevo arreglo floral</p>
        </div>
        
        {/* Mensaje de error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            <div className="flex items-center">
              <span className="text-xl mr-2">⚠️</span>
              <span>{error}</span>
            </div>
          </div>
        )}
        
        {/* Botón de prueba de API */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-800 mb-1">🔧 Diagnóstico de API</h3>
              <p className="text-blue-600 text-sm">Prueba la conexión antes de enviar el formulario</p>
            </div>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={handleTestApi}
                disabled={testing}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {testing ? '🧪 Probando...' : '🧪 Probar API'}
              </button>
              
              <button
                type="button"
                onClick={handleTestImageUpload}
                disabled={testing || !form.imagen}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                title={!form.imagen ? 'Selecciona una imagen primero' : 'Probar subida de imagen'}
              >
                {testing ? '🖼️ Probando...' : '🖼️ Probar Imagen'}
              </button>
              
              <button
                type="button"
                onClick={handleTestGeneratedImage}
                disabled={testing}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                title="Probar con imagen generada automáticamente"
              >
                {testing ? '🎨 Probando...' : '🎨 Imagen Generada'}
              </button>
              
              <button
                type="button"
                onClick={() => simpleImageTest(token)}
                disabled={testing}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                title="Prueba simple con fetch nativo"
              >
                🚀 Prueba Simple
              </button>
              
              <button
                type="button"
                onClick={handleHealthCheck}
                disabled={testing}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                title="Verificar salud del backend"
              >
                🏥 Salud Backend
              </button>
              
              <button
                type="button"
                onClick={handleBackendTest}
                disabled={testing}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                title="Pruebas básicas del backend"
              >
                🧪 Backend Test
              </button>
              
              <button
                type="button"
                onClick={handlePostVariations}
                disabled={testing}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
                title="Probar POST con diferentes datos"
              >
                📊 POST Test
              </button>
              
              <button
                type="button"
                onClick={handleFormDataTest}
                disabled={testing}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50"
                title="Probar con FormData simple"
              >
                📁 FormData Test
              </button>
              
              <button
                type="button"
                onClick={handleMinimalTest}
                disabled={testing}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                title="Test mínimo para error 500"
              >
                🎯 Test Mínimo
              </button>
              
              <button
                type="button"
                onClick={handleMongoTest}
                disabled={testing}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                title="Test de conexión MongoDB"
              >
                🗄️ MongoDB Test
              </button>
            </div>
          </div>
          
          {/* Información adicional de debug */}
          <div className="mt-4 p-3 bg-blue-100 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">🔍 Información de Debug:</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• Token válido: {token ? '✅ Sí' : '❌ No'}</p>
              <p>• Imagen seleccionada: {form.imagen ? `✅ ${form.imagen.name}` : '❌ No'}</p>
              <p>• Floristería: {form.floristeria || '❌ No seleccionada'}</p>
              <p>• URL API: {import.meta.env.VITE_API_URL || 'https://flores-backend-px2c.onrender.com/api'}</p>
            </div>
          </div>
          
          {/* Resultados de la prueba */}
          {testResults && (
            <div className={`mt-4 p-3 rounded-lg ${
              testResults.success 
                ? 'bg-green-50 border border-green-200 text-green-700' 
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              <div className="flex items-center">
                <span className="text-xl mr-2">
                  {testResults.success ? '✅' : '❌'}
                </span>
                <div>
                  <p className="font-semibold">{testResults.message}</p>
                  {testResults.data && (
                    <p className="text-sm mt-1">
                      Floristerías: {testResults.data.floristerias} | 
                      Productos: {testResults.data.productos}
                    </p>
                  )}
                  {testResults.error && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm">Ver detalles del error</summary>
                      <pre className="mt-2 text-xs bg-white/50 p-2 rounded overflow-auto">
                        {JSON.stringify(testResults.error, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Formulario */}
        <div className="backdrop-blur-md bg-white/40 rounded-2xl p-8 shadow-xl border border-white/30">
          <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Nombre del Arreglo</label>
            <input
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              placeholder="Ej: Canasta de Rosas"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Categoría</label>
            <select
              name="categoria"
              value={form.categoria}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              required
            >
              <option value="">-- Seleccione categoría --</option>
              <option value="Canastas con vino">🍷 Canastas con vino</option>
              <option value="Canastas con whisky">🥃 Canastas con whisky</option>
              <option value="Canastas sin licor">🌺 Canastas sin licor</option>
              <option value="Regalos navideños">🎄 Regalos navideños</option>
              <option value="Detalles pequeños">🎁 Detalles pequeños</option>
              <option value="Canastas frutales">🍎 Canastas frutales</option>
              <option value="Flores">🌸 Flores</option>
            </select>
          </div>
        </div>
        
        {/* Campo de floristería si no viene en la URL */}
        {!floristeriaFromQuery && (
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Floristería</label>
            <select
              name="floristeria"
              value={form.floristeria}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              required
            >
              <option value="">-- Seleccione floristería --</option>
              <option value="floristeria1">🏪 Floristería 1</option>
              <option value="floristeria2">🏪 Floristería 2</option>
              <option value="floristeria3">🏪 Floristería 3</option>
            </select>
          </div>
        )}
        
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Descripción</label>
          <textarea
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
            rows="3"
            placeholder="Describe el arreglo floral..."
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Precio ($)</label>
            <input
              type="number"
              step="0.01"
              name="precio"
              value={form.precio}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              placeholder="0.00"
              required
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Stock Disponible</label>
            <input
              type="number"
              name="stock"
              value={form.stock}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              placeholder="0"
              required
            />
          </div>
        </div>
        
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Imagen del Arreglo</label>
          <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 ${
            form.imagen 
              ? 'border-green-400 bg-green-50' 
              : 'border-gray-300 hover:border-purple-400'
          }`}>
            <input
              type="file"
              name="imagen"
              accept="image/*"
              onChange={handleChange}
              className="hidden"
              id="imagen-input"
            />
            <label htmlFor="imagen-input" className="cursor-pointer">
              <div className="text-4xl mb-2">
                {form.imagen ? '🖼️' : '📸'}
              </div>
              
              {form.imagen ? (
                <div className="space-y-2">
                  <p className="text-green-700 font-medium">
                    ✅ Imagen seleccionada
                  </p>
                  <p className="text-green-600 text-sm">
                    {form.imagen.name}
                  </p>
                  <p className="text-green-500 text-xs">
                    {(form.imagen.size / 1024 / 1024).toFixed(2)} MB • {form.imagen.type}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-gray-600 mb-2">
                    Haz clic para seleccionar una imagen
                  </p>
                  <p className="text-sm text-gray-500">
                    PNG, JPG, GIF, WebP hasta 5MB
                  </p>
                </div>
              )}
            </label>
          </div>
          
          {/* Botón para quitar imagen */}
          {form.imagen && (
            <div className="mt-3 text-center">
              <button
                type="button"
                onClick={() => setForm({ ...form, imagen: null })}
                className="text-red-600 hover:text-red-800 text-sm underline"
              >
                🗑️ Quitar imagen
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between pt-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200"
          >
            ← Volver
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className="group relative inline-flex items-center px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-2xl hover:from-pink-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Procesando...
              </>
            ) : (
              <>
                <span className="mr-2">{id ? '💾' : '✨'}</span>
                {id ? 'Actualizar' : 'Crear'} Arreglo
              </>
            )}
            <div className="absolute inset-0 bg-white/20 rounded-2xl blur-sm group-hover:blur-md transition-all duration-300"></div>
          </button>
        </div>
      </form>
    </div>
  );
}