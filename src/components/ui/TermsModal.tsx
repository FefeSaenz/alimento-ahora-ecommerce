import React from 'react';
import Modal from './Modal';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-3xl">
      
      {/* HEADER FLOTANTE */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
        <h2 className="text-xl font-lilita text-brand-primary tracking-wide">Preguntas Frecuentes</h2>
        <button 
          onClick={onClose} 
          className="bg-gray-50 text-gray-500 hover:text-brand-primary hover:bg-orange-50 w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>

      {/* CUERPO DEL TEXTO */}
      <div className="p-6 md:p-10 overflow-y-auto max-h-[65vh] custom-scrollbar text-sm font-fredoka text-gray-600 space-y-8 leading-relaxed">
        
        {/* SECCIÓN 1 */}
        <div className="space-y-3">
          <h3 className="text-base font-bold text-gray-800">¿Realizan cambios?</h3>
          <p>
            Si el producto se encuentra en mal estado o necesitás cambiarlo, podés realizar el cambio acercándote a nuestro local: <strong>Buenos Aires 60 - Paseo de las luces, Paraná, Entre Ríos</strong>. Los cambios se realizan de martes a sábados de 17:00 a 20:00 hs.
          </p>
          <p>
            En el caso de querer hacer un cambio y vivas en el interior, deberás comunicarte a nuestro WhatsApp (encontrás el ícono en nuestra página abajo a la derecha) para coordinar. Los envíos por devolución son siempre a cargo del comprador.
          </p>
          
          <p className="font-bold text-gray-800 mt-4">Podrás cambiar tu pedido si cumplen estas condiciones:</p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>El envase no debe estar abierto ni adulterado.</li>
            <li>En su packaging original.</li>
            <li>Está dentro de los 15 días de realizada la compra.</li>
            <li>Deberás presentar el remito o factura.</li>
          </ul>
        </div>

        {/* SECCIÓN 2 */}
        <div className="space-y-3 pt-6 border-t border-gray-100">
          <h3 className="text-base font-bold text-gray-800">¿Cómo realizo una compra?</h3>
          <p>
            Seleccioná el producto y la cantidad de unidades que desees. Una vez que hayas seleccionado todos los artículos, deberás proceder al pago de los mismos. Previamente el sistema te solicitará que ingreses tus datos personales para poder efectuar la compra.
          </p>
          <p>
            Deberás elegir la dirección de entrega de tu compra; es muy importante que estos datos sean correctos y exactos (Dirección, altura, piso y nro). El pago se realiza a través de MercadoPago, podés pagar con tarjeta de crédito, débito, efectivo o transferencia bancaria. También es posible seleccionar la opción "retirar por local" y abonarlo en el momento.
          </p>
          <p>
            Una vez confirmado el pago te enviaremos un email de confirmación, y dentro de las 72 horas hábiles despacharemos tu pedido, dependiendo la forma de envío que hayas elegido.
          </p>
        </div>

        {/* SECCIÓN 3 */}
        <div className="space-y-3 pt-6 border-t border-gray-100">
          <h3 className="text-base font-bold text-gray-800">Envíos y Entregas</h3>
          
          <p className="font-bold text-gray-800 mt-4">¿Quién me entrega el producto?</p>
          <p>
            Podemos coordinar el envío en moto (entregados en 24 horas dentro de la ciudad de Paraná). El pago del envío en moto es abonado al repartidor en efectivo.
          </p>

          <p className="font-bold text-gray-800 mt-4">¿Cuándo me llega el pedido?</p>
          <p>
            El tiempo de entrega dependerá del stock disponible y la zona. En general la demora en Paraná es de 24hs hábiles.
          </p>

          <p className="font-bold text-gray-800 mt-4">¿Inconvenientes con el envío o seguimiento?</p>
          <p>
            En caso de tener algún inconveniente, comunicate con nosotros a nuestro WhatsApp. 
            <br/><br/>
            <em className="text-xs text-gray-400">A tener en cuenta: El ingreso de datos precisos en el formulario es vital. Si el pedido no puede ser entregado por falta/error de datos, el comprador deberá abonar el reenvío.</em>
          </p>
        </div>

        {/* SECCIÓN 4 */}
        <div className="space-y-3 pt-6 border-t border-gray-100">
          <h3 className="text-base font-bold text-gray-800">¿Cuáles son las formas de pago?</h3>
          <p>
            Todos los precios están en pesos argentinos (AR$). Los precios no incluyen el costo de envío.
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li><strong>Tarjetas y MercadoPago:</strong> Abonando con tarjeta de crédito/débito la acreditación suele ser instantánea.</li>
            <li><strong>Retiro en Local:</strong> Podés abonar en efectivo en el momento, o con tarjetas/MercadoPago.</li>
            <li><strong>Transferencia Bancaria:</strong> Al seleccionar esta opción, contactate con nuestro WhatsApp para que podamos enviarte los datos de la cuenta y nos envíes el comprobante.</li>
          </ul>
        </div>

      </div>
      
      {/* FOOTER DEL MODAL */}
      <div className="p-6 border-t border-gray-100 shrink-0 bg-gray-50">
        <button 
          onClick={onClose}
          className="w-full bg-brand-primary text-white py-4 rounded-full text-sm font-fredoka font-bold tracking-wider hover:bg-orange-600 hover:shadow-md transition-all cursor-pointer"
        >
          Entendido
        </button>
      </div>

    </Modal>
  );
};

export default TermsModal;