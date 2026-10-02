# AUDIT REPORT: Alimento Ahora Ecommerce
**Author:** Senior Software Engineer & Solutions Architect
**Date:** September 2026
**Target Project:** Alimento Ahora (Vite + React 19 + TypeScript + Tailwind v4)

---

## 1. Resumen Ejecutivo (Executive Summary)

El proyecto **Alimento Ahora** se encuentra en una etapa avanzada de migración hacia un modelo de e-commerce moderno enfocado en la nutrición de mascotas. La base de código cuenta con decisiones de diseño acertadas, tales como la implementación de TypeScript estricto, abstracción de llamadas HTTP mediante Axios interceptors, desacoplamiento de capas lógicas (hooks para OTP y persistencia) y uso de Tailwind v4 para el sistema de diseño.

No obstante, la transición desde el modelo heredado de indumentaria ("Dresses/Clothes") ha dejado un ecosistema híbrido que mezcla nomenclaturas antiguas y nuevas. Adicionalmente, el análisis exhaustivo revela oportunidades críticas en las áreas de **Arquitectura de Estado**, **Seguridad y Privacidad de Datos de Clientes**, y **Core Web Vitals (Rendimiento)**.

Este reporte detalla cada hallazgo con sus respectivas referencias de archivos y líneas de código, clasificándolos por nivel de severidad y proponiendo un Roadmap pragmático para su resolución sin generar fricciones en el flujo de negocio actual.

---

## 2. Análisis Crítico por Pilares

### PILAR A: Transición de Arquitectura (Modelo de Datos)
El dominio de negocio se ha redefinido exitosamente hacia el modelo de alimentos para mascotas con variantes anidadas (Presentación/Edad/Contenido/Peso), pero persisten residuos conceptuales del sistema anterior de indumentaria.

*   **Variant Pricing Incompleto:** Se detecta que el sistema de variantes anidadas en la UI espera por precios dinámicos específicos por variante (`variant_price`), pero el mapeador y el backend no están sincronizados para ello. El precio se lee de forma general por producto base, lo cual es restrictivo para alimentos de mascotas donde la bolsa de 3kg difiere drásticamente en precio de la de 15kg.
*   **Comentarios de Transición ("Deuda Técnica Visual"):** El código está plagado de comentarios informales que, aunque ayudan temporalmente al desarrollador, denotan una transición incompleta y confunden la especificación de tipos de dominio (ej. `// Chau dress_name`, `// Ex 'selectedColor'`).
*   **Mezcla de Nomenclatura en la API:** La interfaz del backend y del mapeador interno expone inconsistencias (el backend devuelve `product_variants` que luego se transforman en `presentation` y `options` en la UI, pero el mapeo conserva rastros lógicos comentados).

---

### PILAR B: Seguridad del Checkout y Autenticación
El flujo de checkout implementa un sistema OTP (One-Time Password) por correo para autenticar al usuario sin contraseña (passwordless), el cual es innovador y reduce la fricción, pero introduce riesgos de privacidad y seguridad física de los datos.

*   **Fuga de Información Personal (PII) en LocalStorage:** El hook `useCheckoutPersistence.ts` serializa los datos del formulario (`formData` que incluye `name`, `dni`, `phone`, `email`, `address`) directamente en `localStorage` en formato plano (JSON plano sin encriptación). Esto expone datos personales ante ataques XSS (Cross-Site Scripting) o acceso físico no autorizado al navegador del cliente.
*   **Sesiones de Checkout Expuestas a Secuestros (Session Hijacking):** El token JWT devuelto por el backend durante la verificación OTP se almacena directamente en `localStorage` bajo la clave `alimento_token`. Los tokens persistidos sin la bandera `HttpOnly` son vulnerables a filtraciones a través de scripts de terceros (como SDKs de analíticas o chat de soporte) si hay una brecha XSS.
*   **UUID de Huella de Sesión Dinámico pero Inseguro:** El generador de UUIDs `generateSafeUUID` en `src/api/axios.ts` provee robustez para entornos HTTP locales (utilizando fallbacks manuales frente a la ausencia de `window.crypto` en dispositivos móviles). Sin embargo, carece de firma criptográfica y el backend confía ciegamente en la cabecera `X-Guest-ID` para rastrear carritos y borradores de sesión de checkout.

---

### PILAR C: Rendimiento & Core Web Vitals
El rendimiento de cara al usuario final es aceptable debido a la ligereza de React 19 y Tailwind v4, pero presenta bloqueos severos en la carga inicial que afectan las métricas de Core Web Vitals.

*   **Bloqueo de LCP (Large Contentful Paint) en Home:** Las imágenes de banners principales (`AAbanner1.png`, etc.) no poseen prioridad de precarga (`fetchpriority="high"` o links de precarga en HTML). Adicionalmente, `Home.tsx` realiza una carga condicional que primero intenta recuperar banners de la API y luego cae en archivos locales. Esto genera un retardo visible mientras se monta el árbol de componentes y se resuelven las llamadas asíncronas.
*   **Layout Shifts (CLS) en Fichas de Producto:** En `src/pages/ProductDetail.tsx`, la inserción dinámica del banner de error de selección de variante o peso provoca desplazamientos en el botón "Agregar al Carrito". Aunque existe una corrección con la asignación de altura mínima (`min-h-13`), el renderizado del carrusel de fotos y el cambio dinámico del peso siguen modificando las dimensiones generales de la vista de especificaciones, afectando la experiencia de scroll acumulado.
*   **React Context Bottleneck (Re-renders Innecesarios):** Los contextos globales de la aplicación (`CartContext.tsx` y `AppContext.tsx`) proveen objetos de valor inline en sus respectivos Providers (ej. `value={{ cart, orders, isCartOpen, ... }}`). Esto invalida la memoización de React, provocando que **cualquier cambio en la cantidad de un ítem del carrito fuerce la actualización y el re-renderizado completo de todos los componentes que consumen `useCart`**, incluyendo componentes del layout como el `Header` o el `Footer`, que solo necesitan leer `cartCount` o abrir el drawer.

---

## 3. Hallazgos Específicos (Mapeo de Código)

A continuación se detallan los hallazgos con referencia exacta a los archivos y secciones de código analizados:

### SEVERIDAD: ALTA 🔴

#### Hallazgo 1.1: Persistencia de Datos Sensibles (PII) en Texto Plano
*   **Archivo:** `src/hooks/useCheckoutPersistence.ts`
*   **Líneas:** 1-38 (Lógica general del hook)
*   **Código crítico:**
    ```typescript
    // Guardar datos al cambiar
    useEffect(() => {
        const hasData = Object.values(formData).some(val => val !== '');
        if (hasData) {
            localStorage.setItem(CHECKOUT_DRAFT_KEY, JSON.stringify({
                data: formData,
                timestamp: Date.now()
            }));
        }
    }, [formData]);
    ```
*   **Diagnóstico:** Si el cliente completa sus datos de dirección de entrega, DNI/CUIT, número de teléfono y nombre, estos datos quedan grabados de forma permanente en el almacenamiento local del dispositivo durante un tiempo prolongado. Si un atacante inyecta código a través de una dependencia vulnerada (ej. un widget de chat o analíticas), puede extraer fácilmente estos datos enviando un simple payload `localStorage.getItem('alimento_checkout_draft')`.
*   **Impacto:** Alto riesgo para la privacidad del usuario (violación de normativas como GDPR/DNP) y alta exposición a filtrado de datos.

#### Hallazgo 1.2: Redirección Forzada con Hard Reload (SPA Churn)
*   **Archivo:** `src/api/axios.ts`
*   **Líneas:** 43-56 (Interceptor de respuestas)
*   **Código crítico:**
    ```typescript
    if (error.response?.status === 401) {
        console.warn("Sesión expirada. Limpiando credenciales...");
        localStorage.removeItem('alimento_token');
        localStorage.removeItem('alimento_email');
        
        window.location.href = '/';
    }
    ```
*   **Diagnóstico:** El interceptor realiza un `window.location.href = '/'` ante una respuesta HTTP 401. Esto rompe completamente el ciclo de vida de la SPA (Single Page Application), descartando el estado en memoria, destruyendo la sesión actual del carrito no persistida y forzando una recarga total de red hacia el host de origen, degradando drásticamente la experiencia de usuario y el rendimiento.
*   **Impacto:** Fricción severa en la conversión del embudo de ventas, pérdida de estado local e interrupción de la experiencia.

---

### SEVERIDAD: MEDIA 🟡

#### Hallazgo 2.1: Cuello de Botella de Renderizado en `CartContext`
*   **Archivo:** `src/context/CartContext.tsx`
*   **Líneas:** 110-117
*   **Código crítico:**
    ```typescript
    return (
      <CartContext.Provider value={{ 
        cart, orders, isCartOpen, setIsCartOpen, isProfileOpen, setIsProfileOpen,
        isCheckoutOpen, setIsCheckoutOpen, addToCart, updateQuantity, 
        removeFromCart, handleCheckoutComplete, cartCount 
      }}>
        {children}
      </CartContext.Provider>
    );
    ```
*   **Diagnóstico:** El valor inyectado en el Provider no está memoizado, y además mezcla estado de la UI (`isCartOpen`, `isCheckoutOpen`) con estado persistente del carrito (`cart`) y acciones de negocio (`addToCart`, `updateQuantity`). Cada vez que un usuario interactúa con la cantidad de un producto, se genera una nueva referencia de objeto de contexto. Todos los suscriptores a `useCart()` se re-renderizan forzosamente.
*   **Impacto:** Degradación de la fluidez táctil (input lag) en dispositivos móviles antiguos durante la navegación y modificación rápida de cantidades en el carrito.

#### Hallazgo 2.2: Price Mapping Desactivado para Variantes de Producto
*   **Archivo:** `src/utils/mappers.ts`
*   **Línea:** 40
*   **Código crítico:**
    ```typescript
    // price: v.variant_price, // <-- ¡Descomentar cuando el back lo envíe!
    ```
*   **Diagnóstico:** El mapper tiene desactivado el precio específico de variantes debido a limitaciones temporales del backend. Esto causa que todos los pesos de alimento de un mismo producto (ej: bolsa de 3kg y bolsa de 15kg) compartan el mismo precio base en el catálogo de la UI, lo cual imposibilita el cobro correcto de productos multivariante en producción si no existe una lógica backend robusta que reemplace este precio en checkout.
*   **Impacto:** Riesgo operativo y funcional. El cliente visualiza un precio uniforme que no representa la realidad financiera de la presentación física seleccionada.

---

### SEVERIDAD: BAJA / NITPICK 🟢

#### Hallazgo 3.1: Comentarios de Código Obsoletos y "Residuo de Indumentaria"
*   **Archivo:** `src/utils/mappers.ts`
*   **Líneas:** 13, 29, 129, 132, 134, 135
*   **Archivo:** `src/types/product.types.ts`
*   **Líneas:** 17, 52, 53
*   **Código crítico:**
    ```typescript
    // mappers.ts
    name: item.product_name || 'Producto', // Chau dress_name
    selectedPresentation: item.variant_presentation || 'N/A', // Chau variant_color
    selectedContent: item.variant_content || 'N/A', // Chau variant_size
    selectedImage: item.product_picture || undefined // Chau dress_picture

    // product.types.ts
    name: string; // Ex 'color.name' (Ej: "Mini Adulto")
    selectedContent: string; // Ex 'selectedSize' (Ej: "15KG")
    selectedPresentation: string; // Ex 'selectedColor' (Ej: "Mini Adulto")
    ```
*   **Diagnóstico:** Estos comentarios introducen ruido visual en la definición de contratos de datos e interfaces de TypeScript. Afectan la claridad de la documentación de código para futuros ingenieros integradores y sugieren que el refactoring no fue completamente cerrado a nivel conceptual.
*   **Impacto:** Menor legibilidad y confusión en la incorporación de nuevos desarrolladores al equipo.

#### Hallazgo 3.2: Renderizado Condicional Bloqueante de Banners (LCP Delay)
*   **Archivo:** `src/pages/Home.tsx`
*   **Líneas:** 51-103
*   **Diagnóstico:** La resolución de banners dinámicos pasa por un `useMemo` condicional que evalúa si el arreglo devuelto por la API de `frontConfig` es mayor a 0. Esto significa que hasta que la promesa HTTP de `getFrontData()` en `AppContext` no se complete y actualice el estado, la página de inicio renderiza banners genéricos locales en el primer tick de render, y luego los reemplaza abruptamente por los banners devueltos por el servidor. Esto degrada drásticamente la métrica de LCP y genera parpadeos que confunden al usuario final.
*   **Impacto:** Penalización en posicionamiento SEO y experiencia visual inicial inestable.

---

## 4. Roadmap de Refactorización Priorizado

Se propone el siguiente plan estratégico de refactorización incremental, ordenado por severidad y facilidad de integración (sin generar impacto destructivo en la funcionalidad):

### 🚀 Fase 1: Corrección Inmediata (Seguridad y Resiliencia)
*   **Acción 1 (Encriptación de Persistencia Ligera):** Modificar `useCheckoutPersistence.ts` para encriptar los valores sensibles del borrador del formulario mediante codificación simple Base64 o una clave de cifrado simétrica ligera (ej: `AES-256` vía librería ligera o un transformador simple de caracteres). Al menos, ofuscar para mitigar la lectura directa por scrapers maliciosos de navegador.
*   **Acción 2 (Sanitización del SPA Hard Reload):** Reemplazar `window.location.href = '/'` en el interceptor de Axios por una llamada controlada de redirección mediante el router de la aplicación, o en su defecto, limpiar los estados de autenticación y permitir que el renderizado de rutas asíncronas maneje la caída automática hacia la pantalla de autenticación de forma nativa en React.

### ⚙️ Fase 2: Optimización de Arquitectura de Estado & Rendimiento
*   **Acción 3 (Separar Estado Lógico vs. UI en CartContext):** Dividir el `CartContext` para evitar renderizados redundantes:
    1.  **CartStateContext:** Almacena únicamente el arreglo `cart`, `orders` y `cartCount`.
    2.  **CartUIContext / Actions:** Almacena los booleanos de interfaz (`isCartOpen`, `isCheckoutOpen`, etc.) y las funciones despachadoras (`addToCart`, `updateQuantity`).
    Esto previene que un cambio de cantidad en el carrito dispare re-renders en componentes estáticos del Layout que solo consumen métodos estáticos de acción.
*   **Acción 4 (Optimizar Precarga de Banners):** Configurar etiquetas `<link rel="preload" as="image" href="..." />` dinámicas en el archivo `index.html` o a través de `react-helmet-async` para la primera imagen del banner que se renderizará de forma prioritaria, reduciendo sustancialmente el LCP y la inestabilidad de la pantalla (CLS).

### 🧹 Fase 3: Higiene de Código y Sincronización de Precios
*   **Acción 5 (Remoción de Residuos de Nomenclatura):** Limpiar por completo todos los comentarios heredados de indumentaria en `mappers.ts`, `product.types.ts`, e interfaces internas para consolidar la arquitectura de dominio del Pet Shop.
*   **Acción 6 (Integración de Variant Prices):** Trabajar en conjunto con el equipo de backend para habilitar el campo `variant_price` en el endpoint `/shop/page/`. Una vez habilitado, descomentar la línea 40 de `mappers.ts` para reflejar con exactitud la escala de precios según el peso de bolsa de alimento seleccionado en la vista de detalle.

---

## 5. Conclusiones Generales

La arquitectura general de **Alimento Ahora** se encuentra en excelente estado técnico en lo que respecta a modularidad y uso de tecnologías modernas de desarrollo web. Los hallazgos identificados son habituales en procesos de refactorización y migración rápida de modelos de negocio.

La aplicación de las optimizaciones sugeridas en este reporte no solo elevará los estándares de **Seguridad y Privacidad de Datos** de la tienda, sino que además garantizará una experiencia táctil ultra fluida en dispositivos móviles, optimizando las tasas de conversión y maximizando el posicionamiento SEO a través de una mejora directa en las métricas de **Core Web Vitals**.
