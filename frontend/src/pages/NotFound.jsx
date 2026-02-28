import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaHospital } from 'react-icons/fa';

export default function NotFound() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-flex bg-blue-100 text-blue-600 p-4 rounded-full mb-6">
          <FaHospital className="text-4xl" />
        </div>
        <h1 className="text-7xl font-bold text-blue-600 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h2>
        <p className="text-gray-500 mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <Link to={user ? `/${user.role}` : '/'} className="btn-primary">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}