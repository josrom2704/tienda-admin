import axios from 'axios';

/**
 * Devuelve una instancia de axios configurada con la URL base de la API y
 * el token JWT en la cabecera Authorization. Si no se proporciona un
 * token, la instancia no incluirá la cabecera Authorization.
 *
 * La URL base se lee de la variable de entorno VITE_API_URL o por
 * defecto apunta a https://flores-backend-px2c.onrender.com/api.
 */
export function getAxiosInstance(token) {
  const instance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://flores-backend-px2c.onrender.com/api'
  });
  if (token) {
    instance.interceptors.request.use((config) => {
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
  }
  return instance;
}