import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Order } from '@/src/types/product.types';
import api from '@/src/api/axios';
import Price from '@/src/components/ui/Price';
import { mapOrderFromApi } from '@/src/utils/mappers';

const OrderSuccess: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // TODO: Mover esto a variables de entorno cuando se limpien los hardcodeos
  const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || "5493431234567"; 

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        // LLAMADA REAL A LA API
        const response = await api.get(`/shop/cart/${id}`);

        // Aplicamos el patrón Adapter estricto de un solo argumento
        if (response.data?.data) {
          const orderMapeada = mapOrderFromApi(response.data.data);
          setOrder(orderMapeada);
        } else {
          setError(true);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error al traer la orden:", err);
        setError(true);
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id]);

  const generateWhatsAppLink = () => {
    if (!order) return "#";
    const text = `¡Hola ALIMENTO AHORA! Acabo de realizar el pedido *#${order.id}* por un total de *$${order.summary.total}*. Quiero coordinar el pago/envío.`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-brand-primary">
        <i className="fa-solid fa-circle-notch fa-spin text-5xl mb-4"></i>
        <p className="text-sm font-fredoka font-bold uppercase tracking-wider text-gray-500">Buscando tu pedido...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-5 text-center">
        <i className="fa-solid fa-triangle-exclamation text-6xl mb-4 text-red-400"></i>
        <h1 className="text-3xl font-lilita tracking-wide text-gray-800 mb-2">Pedido no encontrado</h1>
        <p className="text-sm text-gray-500 font-fredoka font-medium mb-8">No pudimos cargar los datos de la orden #{id}.</p>
        <Link to="/" className="bg-brand-primary text-white px-8 py-4 rounded-full text-sm font-fredoka font-bold uppercase tracking-wider hover:bg-orange-600 transition-colors shadow-md cursor-pointer">
          Volver a la tienda
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-5 py-12 md:py-20 animate-in fade-in duration-500">
      
      {/* BLOQUEO SEO: Prevenimos que Google indexe los recibos de los clientes */}
      <Helmet>
        <title>ALIMENTO AHORA | Pedido Confirmado</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* HEADER DEL RECIBO */}
      <div className="text-center mb-10">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500 shadow-inner">
          <i className="fa-solid fa-check text-4xl"></i>
        </div>
        <h1 className="text-4xl md:text-5xl font-lilita tracking-wide mb-2 text-gray-800">¡Pedido Confirmado!</h1>
        <p className="text-sm text-brand-primary font-fredoka font-bold uppercase tracking-widest">
          ORDEN #{order.id}
        </p>
      </div>

      {/* CAJA DE DETALLES TIPO TICKET */}
      <div className="bg-white border border-gray-100 p-6 md:p-10 rounded-3xl shadow-sm mb-8 relative overflow-hidden">
        
        {/* Decoración de ticket superior */}
        <div className="absolute top-0 left-0 w-full h-2 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCI+PHBhdGggZD0iTTAgMTBMNSAwTDEwIDEwSDB6IiBmaWxsPSIjRjNGNEY2Ii8+PC9zdmc+')] bg-repeat-x"></div>

        {/* ESTADO Y FECHA */}
        <div className="flex flex-col md:flex-row justify-between pb-6 border-b-2 border-dashed border-gray-100 mb-6 gap-4">
          <div>
            <p className="text-xs font-fredoka font-bold uppercase tracking-wider text-gray-400 mb-1">Estado</p>
            <span className={`inline-block px-4 py-1.5 text-xs font-fredoka font-bold uppercase tracking-wider rounded-full ${order.status === 'Procesando' ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-green-50 text-green-600 border border-green-200'}`}>
              {order.status}
            </span>
          </div>
          <div className="md:text-right">
            <p className="text-xs font-fredoka font-bold uppercase tracking-wider text-gray-400 mb-1">Fecha</p>
            <p className="text-sm font-fredoka font-medium text-gray-800">
              {new Date(order.date || '').toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>

        {/* DATOS DEL CLIENTE Y LOGÍSTICA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 pb-8 border-b-2 border-dashed border-gray-100">
          <div>
            <p className="text-xs font-fredoka font-bold uppercase tracking-wider text-gray-400 mb-3">Datos del Cliente</p>
            <p className="text-base font-fredoka font-bold text-gray-800 capitalize mb-1">{order.customer.name}</p>
            <p className="text-sm font-fredoka text-gray-500">{order.customer.email}</p>
            <p className="text-sm font-fredoka text-gray-500">{order.customer.phone}</p>
            {order.customer.dni_cuit && <p className="text-sm font-fredoka text-gray-500">DNI: {order.customer.dni_cuit}</p>}
          </div>
          <div>
            <p className="text-xs font-fredoka font-bold uppercase tracking-wider text-gray-400 mb-3">Entrega: <span className="text-brand-primary">{order.shipping.method}</span></p>
            <p className="text-base font-fredoka font-bold text-gray-800 capitalize mb-1">{order.shipping.address}</p>
            {/* RENDERIZADO CONDICIONAL: Solo mostramos Ciudad y CP si el método es Standard (Envío) */}
            {order.shipping.method === 'Standard' && (
              <p className="text-sm font-fredoka text-gray-500">{order.shipping.city}, CP: {order.shipping.zip}</p>
            )}
          </div>
        </div>

        {/* LISTA DE PRODUCTOS */}
        <div className="mb-8">
          <p className="text-xs font-fredoka font-bold uppercase tracking-wider text-gray-400 mb-4">Productos</p>
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center p-1 border border-gray-100 shadow-sm shrink-0">
                     <img src={item.selectedImage || item.images?.[0]} alt={item.name} className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <p className="text-sm font-fredoka font-bold text-gray-800">{item.name}</p>
                    <p className="text-[11px] font-fredoka font-medium text-gray-500 uppercase tracking-wide mt-1">
                      {item.selectedColor || 'N/A'} | Peso: {item.selectedSize || 'N/A'} | Cant: {item.quantity}
                    </p>
                  </div>
                </div>
                <Price amount={item.price * item.quantity} className="text-sm md:text-base font-fredoka font-black text-brand-primary" />
              </div>
            ))}
          </div>
        </div>

        {/* TOTALES */}
        <div className="bg-orange-50 rounded-2xl p-5 border border-orange-100">
          <div className="flex justify-between text-sm font-fredoka font-medium text-gray-600 mb-2">
            <span>Subtotal</span>
            <Price amount={order.summary.subtotal} />
          </div>
          {(order.summary.discount ?? 0) > 0 && (
            <div className="flex justify-between text-sm font-fredoka font-bold text-green-600 mb-2">
              <span>Descuento</span>
              <span>-<Price amount={order.summary.discount} /></span>
            </div>
          )}
          <div className="flex justify-between items-end mt-4 pt-4 border-t border-orange-200">
            <div>
              <p className="text-[10px] font-fredoka font-bold uppercase tracking-widest text-gray-500 mb-1">Pago: {order.payment.method}</p>
              <p className="text-2xl font-lilita text-gray-800">TOTAL</p>
            </div>
            <Price amount={order.summary.total} className="text-3xl font-fredoka font-black text-brand-primary" />
          </div>
        </div>
      </div>

      {/* ACCIONES FINALES */}
      <div className="flex flex-col md:flex-row gap-4">
        <a 
          href={generateWhatsAppLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 bg-[#25D366] text-white py-4 px-6 rounded-full text-sm font-fredoka font-bold uppercase tracking-wider hover:bg-[#20bd5a] hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center space-x-3 cursor-pointer shadow-md"
        >
          <i className="fa-brands fa-whatsapp text-xl"></i>
          <span>Coordinar por WhatsApp</span>
        </a>
        <Link 
          to="/"
          className="flex-1 border-2 border-gray-200 text-gray-600 py-4 px-6 rounded-full text-center text-sm font-fredoka font-bold uppercase tracking-wider hover:border-brand-primary hover:text-brand-primary hover:bg-orange-50 transition-colors cursor-pointer"
        >
          Volver al Inicio
        </Link>
      </div>

    </div>
  );
};

export default OrderSuccess;