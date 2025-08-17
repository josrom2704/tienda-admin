/**
 * Utilidad para diagnosticar problemas de subida de imágenes
 */
export const debugImageUpload = (formData, token) => {
  console.log('🔍 === DIAGNÓSTICO COMPLETO DE IMAGEN ===');
  
  // 1. Verificar FormData
  console.log('📋 FormData entries:');
  for (let [key, value] of formData.entries()) {
    if (value instanceof File) {
      console.log(`  📁 ${key}:`, {
        name: value.name,
        type: value.type,
        size: value.size,
        sizeMB: (value.size / 1024 / 1024).toFixed(2) + 'MB',
        lastModified: new Date(value.lastModified).toISOString()
      });
    } else {
      console.log(`  📝 ${key}:`, value);
    }
  }
  
  // 2. Verificar token
  console.log('🔑 Token:', {
    exists: !!token,
    length: token ? token.length : 0,
    startsWith: token ? token.substring(0, 20) + '...' : 'N/A'
  });
  
  // 3. Verificar headers
  const headers = {
    'Content-Type': 'multipart/form-data',
    'Accept': 'application/json'
  };
  console.log('📋 Headers a enviar:', headers);
  
  // 4. Verificar configuración de axios
  console.log('⚙️ Configuración recomendada:', {
    timeout: 30000,
    maxContentLength: Infinity,
    maxBodyLength: Infinity
  });
  
  return true;
};

/**
 * Crear un FormData de prueba simple
 */
export const createTestFormData = () => {
  const formData = new FormData();
  
  // Datos básicos de prueba
  formData.append('nombre', 'TEST_IMAGEN_' + Date.now());
  formData.append('descripcion', 'Descripción de prueba');
  formData.append('precio', '10.00');
  formData.append('stock', '5');
  formData.append('categoria', 'Flores');
  formData.append('floristeria', 'test');
  
  console.log('🧪 FormData de prueba creado');
  return formData;
};

/**
 * Simular una imagen de prueba
 */
export const createTestImage = () => {
  // Crear un blob de imagen de prueba
  const canvas = document.createElement('canvas');
  canvas.width = 100;
  canvas.height = 100;
  const ctx = canvas.getContext('2d');
  
  // Dibujar algo simple
  ctx.fillStyle = '#ff6b6b';
  ctx.fillRect(0, 0, 100, 100);
  ctx.fillStyle = '#ffffff';
  ctx.font = '20px Arial';
  ctx.fillText('TEST', 25, 55);
  
  // Convertir a blob
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      const file = new File([blob], 'test-image.png', { type: 'image/png' });
      console.log('🖼️ Imagen de prueba creada:', {
        name: file.name,
        type: file.type,
        size: file.size
      });
      resolve(file);
    }, 'image/png');
  });
};

/**
 * Probar subida con imagen generada
 */
export const testWithGeneratedImage = async (token) => {
  try {
    console.log('🧪 Iniciando prueba con imagen generada...');
    
    const testImage = await createTestImage();
    const formData = createTestFormData();
    formData.append('imagen', testImage);
    
    // Diagnosticar
    debugImageUpload(formData, token);
    
    return { success: true, formData, testImage };
  } catch (error) {
    console.error('❌ Error creando imagen de prueba:', error);
    return { success: false, error };
  }
};
