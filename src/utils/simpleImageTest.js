/**
 * Prueba simple de subida de imagen sin validaciones complejas
 */
export const simpleImageTest = async (token) => {
  console.log('🧪 === PRUEBA SIMPLE DE IMAGEN ===');
  
  try {
    // Crear un FormData muy simple
    const formData = new FormData();
    formData.append('nombre', 'TEST_SIMPLE');
    formData.append('descripcion', 'Test simple');
    formData.append('precio', '1');
    formData.append('stock', '1');
    formData.append('categoria', 'Flores');
    formData.append('floristeria', 'test');
    
    // Crear una imagen mínima (1x1 pixel)
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(0, 0, 1, 1);
    
    canvas.toBlob(async (blob) => {
      const file = new File([blob], 'test.png', { type: 'image/png' });
      formData.append('imagen', file);
      
      console.log('📁 Imagen de prueba creada:', {
        name: file.name,
        type: file.type,
        size: file.size + ' bytes'
      });
      
      // Intentar subir
      const response = await fetch('https://flores-backend-px2c.onrender.com/api/flores', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      console.log('📡 Respuesta del servidor:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Éxito:', data);
        alert('✅ Prueba simple exitosa! La imagen se subió correctamente.');
      } else {
        const errorText = await response.text();
        console.error('❌ Error del servidor:', errorText);
        alert(`❌ Error del servidor: ${response.status} ${response.statusText}`);
      }
      
    }, 'image/png');
    
  } catch (error) {
    console.error('❌ Error en prueba simple:', error);
    alert(`❌ Error: ${error.message}`);
  }
};
