import { useEffect, useState } from "react";
import { FiAlertCircle, FiLock, FiMail } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate("/", { replace: true });
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await login(email, password);
    if (result.success) {
      navigate("/");
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className='flex items-center justify-center min-h-screen px-4 bg-gradient-to-br from-blue-50 to-indigo-100'>
      <div className='w-full max-w-md space-y-8'>
        <div>
          <div className='flex items-center justify-center w-16 h-16 mx-auto bg-blue-600 rounded-full'>
            <span className='text-2xl font-bold text-white'>SN</span>
          </div>
          <h2 className='mt-6 text-3xl font-extrabold text-center text-gray-900'>
            SANAYA
          </h2>
          <p className='mt-2 text-sm text-center text-gray-600'>
            Inicia sesión para continuar
          </p>
        </div>

        <form
          className='p-8 mt-8 space-y-6 bg-white shadow-lg rounded-xl'
          onSubmit={handleSubmit}
        >
          {error && (
            <div className='p-4 rounded-md bg-red-50'>
              <div className='flex'>
                <FiAlertCircle className='w-5 h-5 text-red-400' />
                <h3 className='ml-3 text-sm font-medium text-red-800'>
                  {error}
                </h3>
              </div>
            </div>
          )}

          <div className='space-y-4'>
            <div>
              <label className='block mb-1 text-sm font-medium text-gray-700'>
                Correo electrónico
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
                  <FiMail className='w-5 h-5 text-gray-400' />
                </div>
                <input
                  type='email'
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className='block w-full py-2.5 pl-10 pr-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  placeholder='admin@sanaya.local'
                />
              </div>
            </div>

            <div>
              <label className='block mb-1 text-sm font-medium text-gray-700'>
                Contraseña
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
                  <FiLock className='w-5 h-5 text-gray-400' />
                </div>
                <input
                  type='password'
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className='block w-full py-2.5 pl-10 pr-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  placeholder='••••••••'
                />
              </div>
            </div>
          </div>

          <button
            type='submit'
            disabled={loading}
            className='w-full px-4 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50'
          >
            {loading ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
