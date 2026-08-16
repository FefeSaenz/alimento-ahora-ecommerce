import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Order } from '@/src/types/product.types';
import { useAuth } from '@/src/context/AuthContext';
import { useOtpAuth } from '@/src/hooks/useOtpAuth';
import { isValidEmail } from '@/src/utils/validators';
import { toast } from 'sonner';
import Price from './Price';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
}

const UserProfile: React.FC<UserProfileProps> = ({ isOpen, onClose, orders }) => {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  const [step, setStep] = useState<1 | 2>(1); 
  
  // LÓGICA DE OTP DENTRO DEL HOOK USEOTPAUTH
  const { 
    email, setEmail, otpCode, setOtpCode, loading, timeLeft, cooldown, isCodeSent, sendOtp, verifyOtp, clearOtpData, syncState 
  } = useOtpAuth();

  // EFECTO MAESTRO: Si se abre el panel, obligamos a leer la verdad del localStorage
  useEffect(() => {
    if (isOpen) {
      syncState();
    }
  }, [isOpen, syncState]);

  // Si descubrimos que ya había un código enviado en otra pestaña/modal, pasamos al Paso 2
  useEffect(() => {
    if (isCodeSent) setStep(2);
    else setStep(1);
  }, [isCodeSent]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleSendCode = async (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();

    if (!isValidEmail(email)) {
      toast.error('Por favor, ingresá un email válido.');
      return;
    }

    // LLAMADA REAL AL BACKEND (delegada al hook)
    const success = await sendOtp(email);
    if (success) {
      setStep(2);
    }
  };

  const handleVerifyCode = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    
    // LLAMADA REAL AL BACKEND VERIFICANDO CÓDIGO (delegada al hook)
    const token = await verifyOtp();
    
    if (token) {
      // Asumimos que tu backend devuelve { token: "..." }
      login({ email, token });
      toast.success('¡Sesión iniciada con éxito!');
      setStep(1); 
    }
  };

  const handleLogout = () => {
    logout();
    setEmail('');
    setStep(1);
    // Limpieza por las dudas
    clearOtpData();
    toast.success('Sesión cerrada.');
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const onlyNums = e.target.value.replace(/\D/g, ''); 
    setOtpCode(onlyNums);
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/40 z-50 transition-opacity duration-300 backdrop-blur-sm ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <div
        // Le damos el mismo redondeo que al carrito
        className={`fixed top-0 right-0 h-full bg-white z-50 w-full max-w-100 rounded-l-3xl shadow-2xl transition-transform duration-300 transform flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6 flex items-center justify-between border-b border-gray-100">
          <h2 className="text-xl font-lilita text-brand-primary tracking-wide">
            {isAuthenticated ? 'Mi Perfil' : 'Ingresar'}
          </h2>
          <button onClick={onClose} className="bg-gray-50 text-gray-500 hover:text-brand-primary hover:bg-orange-50 w-10 h-10 rounded-full flex items-center justify-center transition-colors cursor-pointer">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
          
          {isAuthenticated ? (
            <div className="animate-in fade-in duration-300">
              <div className="mb-8 bg-orange-50 p-6 rounded-2xl border border-orange-100 text-center shadow-inner">
                <div className="w-14 h-14 bg-brand-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-lilita shadow-md">
                  {user?.email.charAt(0)}
                </div>
                <h3 className="text-sm font-fredoka font-bold text-gray-800 mb-1">¡Hola de nuevo!</h3>
                <p className="text-xs text-gray-500 font-fredoka">{user?.email}</p>
              </div>

              <div className="mb-8">
                <h3 className="text-sm font-fredoka font-bold text-brand-primary uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Mis Pedidos</h3>
                
                {orders.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <i className="fa-solid fa-box-open text-4xl text-gray-300 mb-3"></i>
                    <p className="text-xs font-fredoka font-bold text-gray-400">No tenés pedidos aún</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <Link 
                        key={order.id} 
                        to={`/orden/${order.id}`} 
                        onClick={onClose} // Cerramos el drawer al navegar
                        className="block border border-gray-100 p-5 rounded-2xl bg-white shadow-sm hover:shadow-md hover:border-brand-primary transition-all mb-4"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="text-xs font-fredoka font-bold text-gray-800">ORDEN #{order.id}</p>
                            <p className="text-[10px] text-gray-400 font-fredoka mt-1">
                              {new Date(order.date || '').toLocaleDateString('es-AR')}
                            </p>
                          </div>
                          <span className={`text-[10px] font-fredoka font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                            order.status === 'Procesando' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        
                        <div className="flex -space-x-3 mb-4 overflow-hidden">
                          {order.items.map((item, idx) => (
                            <img 
                              key={idx} 
                              src={item.selectedImage || item.images?.[0]} 
                              className="w-10 h-10 object-contain p-1 bg-gray-50 rounded-full border-2 border-white shadow-sm"
                              alt={item.name}
                            />
                          ))}
                        </div>

                        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                          <span className="text-xs font-fredoka font-bold text-gray-400">Total</span>
                          <Price amount={order.summary.total} className="text-sm font-fredoka font-black text-brand-primary" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <button 
                onClick={handleLogout}
                className="w-full rounded-full border-2 border-red-100 text-red-500 py-3.5 text-xs font-fredoka font-bold hover:bg-red-50 hover:border-red-200 transition-colors cursor-pointer"
              >
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <div className="flex flex-col h-full justify-center -mt-10">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-primary">
                  <i className="fa-solid fa-paw text-3xl"></i>
                </div>
                <h3 className="text-2xl md:text-3xl font-lilita text-brand-primary tracking-wide mb-2">Acceso Seguro</h3>
                <p className="text-xs text-gray-500 font-fredoka">
                  {step === 1 ? 'Ingresá tu mail y te enviamos un pin de acceso rápido.' : 'Revisá tu bandeja de entrada o spam.'}
                </p>
              </div>

              {step === 1 ? (
                <form onSubmit={handleSendCode} className="space-y-6 animate-in slide-in-from-right duration-300">
                  {/* FIX IOS ZOOM: text-[16px] md:text-sm */}
                  <input 
                    type="email" 
                    placeholder="Tu Correo Electrónico" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border-2 border-gray-100 rounded-xl py-3.5 text-[16px] md:text-sm font-fredoka font-medium text-gray-800 focus:border-brand-primary focus:bg-white outline-none placeholder:text-gray-400 transition-colors bg-gray-50 text-center shadow-inner"
                  />
                  <button 
                    type="submit" 
                    disabled={loading || !email.includes('@')}
                    className="w-full rounded-full bg-brand-primary text-white py-4 text-sm font-fredoka font-bold tracking-wider relative flex items-center justify-center transition-all hover:bg-orange-600 hover:shadow-lg disabled:opacity-50 disabled:shadow-none cursor-pointer"
                  >
                    {loading ? (
                      <div className="flex justify-center items-center h-5 w-5">
                        <svg className="animate-spin h-full w-full text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </div>
                    ) : 'Recibir Código'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyCode} className="space-y-6 animate-in slide-in-from-right duration-300">
                  <div className="text-center space-y-2 mb-6">
                    <p className="text-xs font-fredoka text-gray-500">
                      Código enviado a <br/><span className="font-bold text-gray-800">{email}</span><br />
                      <span className="text-brand-primary text-[10px] font-bold block mt-2">VÁLIDO POR 10 MINUTOS</span>
                    </p>
                  </div>

                  {/* FIX IOS ZOOM: text-[16px] md:text-2xl para que no haga zoom pero siga siendo grande en PC */}
                  <input 
                    type="text" 
                    placeholder="000000" 
                    value={otpCode}
                    onChange={handleOtpChange} 
                    maxLength={6}
                    className="w-full border-2 border-gray-100 rounded-xl py-4 text-[16px] md:text-2xl font-fredoka font-black text-brand-primary focus:border-brand-primary focus:bg-white outline-none tracking-[10px] placeholder:text-gray-300 transition-colors bg-gray-50 text-center shadow-inner"
                  />
                  
                  <div className="flex flex-col items-center mt-2 mb-6">
                    {cooldown > 0 ? (
                      <p className="text-xs font-fredoka font-bold text-gray-400">
                        ¿No lo recibiste? Reenviar en {formatTime(cooldown)}
                      </p>
                    ) : (
                      <button 
                        type="button" 
                        onClick={() => handleSendCode()} 
                        className="text-xs font-fredoka font-bold text-brand-primary underline hover:text-orange-600 transition-colors cursor-pointer"
                      >
                        Reenviar código
                      </button>
                    )}
                  </div>

                  <div className="flex space-x-3">
                    <button 
                      type="button"
                      onClick={() => {
                        setStep(1);
                        clearOtpData();
                      }}
                      className="px-6 rounded-full border-2 border-gray-200 text-gray-500 hover:text-brand-primary hover:border-brand-primary hover:bg-orange-50 transition-colors cursor-pointer"
                    >
                      <i className="fa-solid fa-arrow-left"></i>
                    </button>
                    <button 
                      type="submit" 
                      disabled={loading || otpCode.length < 6 || timeLeft === 0}
                      className="flex-1 rounded-full bg-brand-primary text-white py-4 text-sm font-fredoka font-bold tracking-wider relative flex items-center justify-center transition-all hover:bg-orange-600 hover:shadow-lg disabled:opacity-50 disabled:shadow-none cursor-pointer"
                    >
                      {loading ? (
                        <div className="flex justify-center items-center h-5 w-5">
                          <svg className="animate-spin h-full w-full text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </div>
                      ) : 'Verificar Código'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default UserProfile;