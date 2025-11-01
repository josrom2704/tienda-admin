import { Link, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import ProductList from './ProductList';
import ProductForm from './ProductForm';
import { useAuth } from '../context/AuthContext';

/**
 * Dashboard para el rol de usuario. Muestra únicamente las opciones
 * relacionadas con la gestión de arreglos asociados a la floristería del
 * usuario.
 */
export default function UserDashboard() {
  const { logout, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className="min-h-screen flex">
      {/* Overlay móvil */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
      
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-white shadow-lg
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-4 font-bold text-xl border-b flex items-center justify-between">
          <span>Panel Usuario</span>
          {/* Botón cerrar en móvil */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-700 hover:bg-gray-100 rounded-lg p-2 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex flex-col gap-2 p-4 text-gray-700">
          <Link 
            to="productos" 
            onClick={() => setSidebarOpen(false)}
            className="hover:text-red-600"
          >
            Mis Arreglos
          </Link>
          <button onClick={logout} className="mt-4 text-left hover:text-red-600">
            Cerrar sesión
          </button>
        </nav>
      </aside>
      <main className="flex-1 p-6 bg-gray-100">
        {/* Botón hamburguesa móvil */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="bg-white text-gray-700 p-3 rounded-lg hover:bg-gray-100 transition-colors shadow-md"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
        
        <Routes>
          <Route index element={<div>Bienvenido, gestiona tus arreglos.</div>} />
          <Route
            path="productos"
            element={<ProductList floristeriaId={user?.floristeria} />}
          />
          <Route
            path="productos/nuevo"
            element={<ProductForm />}
          />
          <Route
            path="productos/:id"
            element={<ProductForm />}
          />
        </Routes>
      </main>
    </div>
  );
}