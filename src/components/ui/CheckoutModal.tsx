import React, { useState, useEffect } from 'react';
import { CartItem, Order } from '@/src/types/product.types';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';
import Price from './Price';
import api from '@/src/api/axios'; 
import { useAuth } from '@/src/context/AuthContext';
import { useOtpAuth } from '@/src/hooks/useOtpAuth';
import { useCheckoutPersistence } from '@/src/hooks/useCheckoutPersistence';
import { isValidEmail, isValidName, isValidDNI, isValidPhone, isValidZipCode, isValidAddress, isValidCity } from '@/src/utils/validators';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onComplete: (order: Order) => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, cart, onComplete }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, login } = useAuth();
  
  const { 
    otpCode, setOtpCode, loading: otpLoading, timeLeft, cooldown, sendOtp, verifyOtp, isCodeSent, syncState, email: otpEmail, clearOtpData
  } = useOtpAuth();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [checkoutError, setCheckoutError] = useState<string | null>(null); // ESTADO DE ERROR LOCAL
  
  const [shippingMethod, setShippingMethod] = useState<'Standard' | 'Pickup'>('Standard');
  const [paymentMethod, setPaymentMethod] = useState<'Efectivo' | 'Transferencia' | 'Tarjeta'>('Transferencia');
  
  const [formData, setFormData] = useState({
    email: '', name: '', dni: '', phone: '', address: '', city: '', zip: '',
  });

  // Conectamos la persistencia al estado del formulario
  const { clearPersistence } = useCheckoutPersistence(formData, setFormData);

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discount = (paymentMethod === 'Efectivo' || paymentMethod === 'Transferencia') ? subtotal * 0.10 : 0;
  const total = subtotal - discount;

  useEffect(() => {
    if (step === 3 && cart.length > 0) {
      setStep(2);
    }
  }, [total]);

  useEffect(() => {
    if (isOpen) {
      syncState(); 
      if (isCodeSent && !isAuthenticated && !formData.name) setStep(1);
      if (isAuthenticated && step === 3) setStep(2);
    } else {
      setErrors({});
      setCheckoutError(null); // Limpiamos error al cerrar
    }
  }, [isOpen, syncState, isCodeSent, isAuthenticated, formData.name, step]);

  useEffect(() => {
    if (isOpen && !formData.email) {
      setFormData((prev) => ({ 
        ...prev, 
        email: user ? user.email : (isCodeSent ? otpEmail : '') 
      }));
    }
  }, [isOpen, user, isCodeSent, otpEmail, formData.email]);

  if (!isOpen) return null;

  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    
    // 1. Recolectamos las validaciones
    if (!isValidName(formData.name)) newErrors.name = 'Nombre inválido';
    if (!isValidEmail(formData.email)) newErrors.email = 'Email incorrecto';
    if (!isValidDNI(formData.dni)) newErrors.dni = 'DNI debe tener 7 u 8 números';
    if (!isValidPhone(formData.phone)) newErrors.phone = 'Teléfono inválido';

    if (shippingMethod === 'Standard') {
      if (!isValidAddress(formData.address)) newErrors.address = 'Dirección incompleta';
      if (!isValidCity(formData.city)) newErrors.city = 'Ciudad necesaria';
      if (!isValidZipCode(formData.zip)) newErrors.zip = 'CP debe tener 4 números';
    }

    setErrors(newErrors);

    // 2. Analizamos los errores para armar el Toast inteligente
    const errorKeys = Object.keys(newErrors);
    
    if (errorKeys.length > 0) {
      // Buscamos si de los campos que fallaron, alguno está totalmente vacío
      const emptyFields = errorKeys.filter(key => !formData[key as keyof typeof formData]?.trim());

      if (emptyFields.length === errorKeys.length) {
        // CASO A: Todos los campos del formulario están vacíos o incompletos
        toast.error("Por favor, completá los campos requeridos.");
      } else if (emptyFields.length > 1) {
        // CASO B: Hay más de un campo vacío
        toast.error("Hay campos incompletos en el formulario.");
      } else if (emptyFields.length === 1) {
        // CASO C: Solo un campo quedó vacío de manera puntual
        const fieldLabels: Record<string, string> = {
          name: 'Nombre', email: 'Email', dni: 'DNI', phone: 'Teléfono',
          address: 'Dirección', city: 'Ciudad', zip: 'Código Postal'
        };
        toast.error(`El campo ${fieldLabels[emptyFields[0]]} está incompleto.`);
      } else {
        // CASO D: Todo está lleno, pero tiene errores de formato (no pasó los Regex)
        if (errorKeys.length === 1) {
          // Si es un solo error de formato, mostramos cuál es de forma amigable
          toast.error(`Error en el formato: ${newErrors[errorKeys[0]]}`);
        } else {
          // Varios errores de formato simultáneos
          toast.error("Error al enviar los datos. Revisá los formatos ingresados.");
        }
      }

      // Scroll automático al primer elemento con error
      const firstErrorKey = errorKeys[0];
      const element = document.getElementsByName(firstErrorKey)[0];
      if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });

      return false;
    }
    return true;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof typeof formData) => {
    let { value } = e.target;
    if (fieldName === 'dni' || fieldName === 'zip' || fieldName === 'phone') {
      value = value.replace(/\D/g, '');
    }
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
    if (errors[fieldName]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[fieldName];
        return next;
      });
    }
  };

  const processCheckout = async () => {
    setLoading(true);
    setCheckoutError(null); // Limpiamos errores previos
    
    const cleanedItems = cart.map((item) => ({
        article_id: parseInt(item.id), 
        variant_id: item.variant_id, 
        quantity: item.quantity,
        price: item.price
    }));

    const newOrder: Order = {
      date: new Date().toISOString(),
      status: 'Procesando',
      customer: { email: formData.email, name: formData.name, phone: formData.phone, dni_cuit: formData.dni },
      summary: { subtotal, shipping: 0, discount, total },
      payment: { method: paymentMethod, status: 'pending' },
      shipping: {
        method: shippingMethod,
        address: shippingMethod === 'Standard' ? formData.address : 'Retiro en Local',
        city: shippingMethod === 'Standard' ? formData.city : 'Paraná',
        zip: shippingMethod === 'Standard' ? formData.zip : '3100'
      },
      items: cleanedItems
    };

    try {
      const response = await api.post('/shop/checkout/', newOrder);
      const orderIdGenerado = response.data?.data?.order_number;
      if (!orderIdGenerado) throw new Error("Backend error");
      
      const finalizedOrder = { ...newOrder, id: orderIdGenerado };
      toast.success(`¡Pedido #${orderIdGenerado} generado!`);
      clearPersistence();
      onComplete(finalizedOrder);
      setStep(1);
      setFormData({ email: '', name: '', dni: '', phone: '', address: '', city: '', zip: '' });
      onClose();
      navigate(`/orden/${orderIdGenerado}`); 
    } catch (error: any) {
      const message = error.response?.status === 400 
        ? "Datos inválidos, verificá los campos." 
        : "Servidor no responde, intentá en un momento.";
      setCheckoutError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (step === 1) {
      if (validateStep()) setStep(2);
    } else if (step === 2) {
      if (isAuthenticated) {
        await processCheckout();
      } else {
        if (isCodeSent) {
          setStep(3);
        } else {
          const sent = await sendOtp(formData.email);
          if (sent) setStep(3);
        }
      }
    }
  };

  const handleVerifyAndPay = async () => {
    const token = await verifyOtp();
    if (token) {
      login({ email: formData.email, token });
      await processCheckout();
    }
  };

  // ESTILOS DE INPUT: Transformados a cajas redondeadas y amigables
  const getInputClass = (fieldName: string) => {
    const isError = !!errors[fieldName];
    return `w-full border rounded-xl px-4 py-3.5 text-[16px] md:text-sm font-fredoka font-medium transition-all outline-none bg-gray-50 placeholder:text-gray-400 ${
      isError 
        ? 'border-red-400 text-red-600 focus:border-red-500 focus:bg-white' 
        : 'border-gray-200 text-gray-800 focus:border-brand-primary focus:bg-white focus:shadow-sm'
    }`;
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-2xl">
      <div className="flex flex-col h-full text-black">
          {/* BARRA DE PROGRESO */}
          <div className="flex border-b border-gray-100 shrink-0 bg-white">
            {[1, 2, step === 3 ? 3 : null].filter(Boolean).map((s) => (
              <div key={s} className={`flex-1 py-4 text-center text-xs font-fredoka font-bold uppercase tracking-widest transition-colors ${step >= s! ? 'text-brand-primary' : 'text-gray-300'}`}>
                {s === 1 ? 'Información' : s === 2 ? 'Pago' : 'Verificación'}
                {/* Indicador redondeado */}
                <div className={`h-1 mt-2 mx-auto w-12 rounded-full transition-all duration-300 ${step >= s! ? 'bg-brand-primary w-16' : 'bg-gray-100'}`} />
              </div>
            ))}
          </div>

          <div className="px-6 py-6 md:px-10 md:py-8 overflow-y-auto flex-1 custom-scrollbar bg-white">
            {/* JSX PARA MOSTRAR EL ERROR DE PROCESAMIENTO */}
            {checkoutError && (
              <div className="p-4 mb-6 bg-red-50 rounded-xl text-red-600 text-xs font-fredoka font-bold text-center border border-red-200 animate-in fade-in">
                {checkoutError}
                <button onClick={processCheckout} className="block w-full underline mt-2 hover:text-red-800 transition-colors cursor-pointer">Reintentar</button>
              </div>
            )}

            {step === 1 && (
              // ... (código de los inputs igual que antes)
              <div className="animate-in slide-in-from-right duration-300">
                <h3 className="text-2xl md:text-3xl font-lilita text-brand-primary tracking-wide mb-4">Entrega</h3>
                
                <div className="flex space-x-4 mb-6">
                  <button onClick={() => setShippingMethod('Standard')} className={`flex-1 py-3.5 rounded-xl border text-xs font-fredoka font-bold uppercase tracking-wider transition-all shadow-sm cursor-pointer ${shippingMethod === 'Standard' ? 'border-brand-primary bg-brand-primary text-white shadow-md' : 'border-gray-200 bg-white text-gray-500 hover:border-brand-primary hover:text-brand-primary'}`}>Envío a Domicilio</button>
                  <button onClick={() => setShippingMethod('Pickup')} className={`flex-1 py-3.5 rounded-xl border text-xs font-fredoka font-bold uppercase tracking-wider transition-all shadow-sm cursor-pointer ${shippingMethod === 'Pickup' ? 'border-brand-primary bg-brand-primary text-white shadow-md' : 'border-gray-200 bg-white text-gray-500 hover:border-brand-primary hover:text-brand-primary'}`}>Retiro en Local</button>
                </div>
                
                <div className="space-y-3 md:space-y-4">
                  <input name="email" type="email" placeholder="Correo Electrónico" className={getInputClass('email')} onChange={(e) => handleInputChange(e, 'email')} value={formData.email} disabled={isAuthenticated || isCodeSent} />
                  <input name="name" type="text" placeholder="Nombre Completo" className={getInputClass('name')} onChange={(e) => handleInputChange(e, 'name')} value={formData.name} />
                  <input name="dni" type="text" inputMode="numeric" placeholder="DNI / CUIT" className={getInputClass('dni')} onChange={(e) => handleInputChange(e, 'dni')} value={formData.dni} />
                  <input name="phone" type="tel" inputMode="numeric" placeholder="Teléfono" className={getInputClass('phone')} onChange={(e) => handleInputChange(e, 'phone')} value={formData.phone} />
                  
                  {shippingMethod === 'Standard' && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-300 space-y-3 md:space-y-4 pt-2">
                      <input name="address" type="text" placeholder="Dirección Completa" className={getInputClass('address')} onChange={(e) => handleInputChange(e, 'address')} value={formData.address} />
                      <div className="grid grid-cols-2 gap-3 md:gap-4">
                        <input name="city" type="text" placeholder="Ciudad" className={getInputClass('city')} onChange={(e) => handleInputChange(e, 'city')} value={formData.city} />
                        <input name="zip" type="text" inputMode="numeric" placeholder="C.P." className={getInputClass('zip')} onChange={(e) => handleInputChange(e, 'zip')} value={formData.zip} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {step === 2 && (
              // ... (código pago)
              <div className="animate-in slide-in-from-right duration-300">
                <h3 className="text-2xl md:text-3xl font-lilita text-brand-primary tracking-wide mb-4">Método de Pago</h3>
                
                <div className="space-y-3 mb-6">
                  {(['Efectivo', 'Transferencia', 'Tarjeta'] as const).map((method) => (
                    <label key={method} onClick={() => setPaymentMethod(method)} className={`block border rounded-xl p-4 cursor-pointer transition-all shadow-sm ${paymentMethod === method ? 'border-brand-primary bg-orange-50' : 'border-gray-200 bg-white hover:border-brand-primary hover:bg-gray-50'}`}>
                      <div className="flex items-center space-x-3 md:space-x-4">
                        {/* Radio button circular suave */}
                        <div className={`w-4 h-4 md:w-5 md:h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${paymentMethod === method ? 'border-brand-primary' : 'border-gray-300'}`}>
                          {paymentMethod === method && <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-brand-primary animate-in zoom-in duration-200" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-fredoka font-bold text-gray-800 uppercase tracking-wide">{method}</span>
                            {/* Píldora de descuento curvo */}
                            {(method === 'Efectivo' || method === 'Transferencia') && <span className="text-[10px] bg-brand-primary text-white px-3 py-1 rounded-full font-fredoka font-bold uppercase tracking-widest shadow-sm">10% OFF</span>}
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="bg-orange-50 p-5 rounded-2xl space-y-2 border border-orange-100 shadow-inner">
                  <div className="flex justify-between text-xs font-fredoka font-semibold text-gray-500 uppercase tracking-widest"><span>Subtotal</span><Price amount={subtotal} /></div>
                  {discount > 0 && <div className="flex justify-between text-xs font-fredoka font-bold text-brand-primary uppercase tracking-widest"><span>Descuento</span><span>-<Price amount={discount} /></span></div>}
                  <div className="flex justify-between text-sm md:text-base font-fredoka font-black uppercase tracking-widest pt-3 border-t border-orange-200 mt-2 text-gray-800"><span>Total a pagar</span><Price amount={total} className="text-brand-primary" /></div>
                </div>
              </div>
            )}

            {step === 3 && (
              // ... (código verificación)
               <div className="animate-in slide-in-from-right duration-300 flex flex-col items-center py-6">
                <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-4 text-brand-primary">
                  <i className="fa-solid fa-shield-check text-3xl"></i>
                </div>
                <h3 className="text-2xl md:text-3xl font-lilita text-brand-primary tracking-wide mb-2">Seguridad</h3>
                
                <p className="text-xs font-fredoka text-gray-500 uppercase tracking-wider text-center mb-8">
                  Enviamos un pin a <span className="font-bold text-gray-800 block mt-1">{formData.email}</span>
                  <span className="text-brand-primary text-[10px] font-bold block mt-2">VÁLIDO POR 10 MINUTOS</span>
                </p>
                
                {/* Input OTP redondeado y grande */}
                <input type="text" placeholder="000000" value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))} maxLength={6} className="w-full max-w-55 bg-gray-50 border-2 border-gray-200 rounded-2xl py-4 text-3xl font-fredoka font-black text-brand-primary focus:border-brand-primary focus:bg-white outline-none tracking-[8px] placeholder:text-gray-300 transition-colors text-center mb-4 shadow-inner" />
                
                {/* Muestro expiración siempre, y manejar el botón de reenvío con el cooldown */}
                <div className="flex flex-col items-center mb-8">
                  {cooldown > 0 ? (
                    <p className="text-[11px] font-fredoka font-bold text-gray-400 uppercase tracking-widest">
                      Reenviar en {formatTime(cooldown)}
                    </p>
                  ) : (
                    <button type="button" onClick={() => sendOtp(formData.email)} className="text-[11px] font-fredoka font-bold text-brand-primary underline uppercase tracking-widest hover:text-orange-600 transition-colors cursor-pointer">
                      Reenviar código
                    </button>
                  )}
                </div>

                <button type="button" onClick={() => { clearOtpData(); setStep(1); }} className="mt-4 text-[10px] font-fredoka font-medium text-gray-400 hover:text-gray-800 transition-colors cursor-pointer">¿Escribiste mal tu correo?</button>
              </div>
            )}
          </div>

          <div className="p-4 md:p-6 border-t border-gray-100 mt-auto shrink-0 bg-white">
            <div className="flex space-x-3 md:space-x-4">
              {step > 1 && (
                <button onClick={() => setStep(step - 1)} disabled={loading || otpLoading} className="px-6 md:px-8 rounded-full border-2 border-gray-200 text-xs font-fredoka font-bold uppercase tracking-wider hover:bg-orange-50 hover:border-brand-primary hover:text-brand-primary text-gray-600 transition-colors disabled:opacity-50 cursor-pointer">
                  Atrás
                </button>
              )}
              <button onClick={step < 3 ? handleNext : handleVerifyAndPay} disabled={loading || otpLoading || (step === 3 && (otpCode.length < 6 || timeLeft === 0))} className="flex-1 rounded-full bg-brand-primary text-white py-4 text-xs md:text-sm font-fredoka font-bold uppercase tracking-wider relative flex items-center justify-center transition-all hover:bg-orange-600 hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:shadow-none cursor-pointer">
                {(loading || otpLoading) ? <i className="fa-solid fa-circle-notch fa-spin"></i> : step === 2 ? 'Confirmar Compra' : step === 3 ? 'Verificar y Pagar' : 'Continuar'}
              </button>
            </div>
          </div>
      </div>
    </Modal>
  );
};

export default CheckoutModal;