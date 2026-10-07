import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { CartItem, Order, Product, ProductContentOption } from '@/src/types/product.types';
import { normalizeContentWeight, weightKey } from '@/src/utils/mappers';
import { useApp } from '@/src/context/AppContext';

// Estado de negocio: cambia cuando se modifica el carrito o las órdenes
interface CartStateContextType {
  cart: CartItem[];
  orders: Order[];
  cartCount: number;
}

// Estado de UI: solo los booleanos de modales/drawers. Cambia al abrir o cerrar uno
interface CartUIContextType {
  isCartOpen: boolean;
  isProfileOpen: boolean;
  isCheckoutOpen: boolean;
}

// Acciones: todas con referencia estable (setters de useState + useCallback sin dependencias),
// por lo que este contexto se crea una única vez y sus consumidores nunca se re-renderizan por él
interface CartActionsContextType {
  setIsCartOpen: (open: boolean) => void;
  setIsProfileOpen: (open: boolean) => void;
  setIsCheckoutOpen: (open: boolean) => void;
  addToCart: (item: CartItem) => void;
  // Actualizamos las firmas para reflejar los nuevos tipos
  updateQuantity: (id: string, content: string, presentation: string, delta: number) => void;
  removeFromCart: (id: string, content: string, presentation: string) => void;
  handleCheckoutComplete: (newOrder: Order) => void;
}

const CartStateContext = createContext<CartStateContextType | undefined>(undefined);
const CartUIContext = createContext<CartUIContextType | undefined>(undefined);
const CartActionsContext = createContext<CartActionsContextType | undefined>(undefined);

// Busca en el catálogo vigente la variante que corresponde a un ítem del carrito.
// Devuelve undefined si el producto no existe en el catálogo; null si el producto existe pero la variante ya no.
const findCartItemOption = (products: Product[], item: CartItem): ProductContentOption | null | undefined => {
  const product = products.find((p) => p.id === item.id);
  if (!product) return undefined;

  const options = product.variants.flatMap((v) => v.options.map((option) => ({ option, presentation: v.presentation.name })));
  const match = item.variant_id !== undefined
    ? options.find(({ option }) => option.variant_id === item.variant_id)
    : options.find(({ option, presentation }) =>
        weightKey(option.content) === weightKey(item.selectedContent) &&
        presentation.toLowerCase() === item.selectedPresentation.toLowerCase());

  return match ? match.option : null;
};

export const CartProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const { allProducts, loading: catalogLoading } = useApp();

  // --- ESTADOS DE INTERFAZ ---
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);

  // --- ESTADO DE NEGOCIO: CARRITO CON PERSISTENCIA ---
  // Lazy initializer: Se ejecuta solo en el primer render para leer el disco duro
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const savedCart = localStorage.getItem('alimento_cart');
      if (!savedCart) return [];

      // Carritos guardados antes de la normalización de pesos ("1,5kg" -> "1.5 kg"):
      // se re-normalizan y se fusionan las líneas que pasan a ser idénticas.
      const merged: CartItem[] = [];
      (JSON.parse(savedCart) as CartItem[]).forEach((item) => {
        const selectedContent = normalizeContentWeight(item.selectedContent);
        const twin = merged.find((m) =>
          m.id === item.id && m.selectedContent === selectedContent && m.selectedPresentation === item.selectedPresentation);
        if (twin) twin.quantity += item.quantity;
        else merged.push({ ...item, selectedContent });
      });
      return merged;
    } catch (error) {
      console.error("Error leyendo el carrito de localStorage:", error);
      return [];
    }
  });

  // Efecto Sincronizador: Cada vez que 'cart' cambia, lo guardamos
  useEffect(() => {
    try {
      localStorage.setItem('alimento_cart', JSON.stringify(cart));
    } catch (error) {
      console.error("Error guardando el carrito en localStorage:", error);
    }
  }, [cart]);


  // REPRICING: el carrito persiste en localStorage y puede traer precios viejos o inexistentes.
  // Una vez cargado el catálogo, cada ítem se alinea con el precio vigente de su variante, y se quitan
  // los que ya no son vendibles (variante discontinuada o sin precio) para no cobrarlos a un precio erróneo.
  useEffect(() => {
    if (catalogLoading || allProducts.length === 0) return;

    const removedNames: string[] = [];
    let changed = false;
    const next = cart.flatMap((item) => {
      const option = findCartItemOption(allProducts, item);
      if (option === undefined) return [item]; // El catálogo no conoce el producto: no se puede juzgar
      if (option === null || !option.available) {
        removedNames.push(item.name);
        changed = true;
        return [];
      }
      if (option.price !== item.price) {
        changed = true;
        return [{ ...item, price: option.price }];
      }
      return [item];
    });

    if (!changed) return;
    setCart(next);
    if (removedNames.length > 0) {
      toast.info(`Quitamos del carrito productos que ya no están disponibles: ${removedNames.join(', ')}.`);
    } else {
      toast.info('Actualizamos los precios de tu carrito.');
    }
  }, [allProducts, catalogLoading, cart]);

  /*
    MANEJADORES DEL CARRITO
   */
  const addToCart = useCallback((newItem: CartItem) => {
    setCart((prev) => {
      const existing = prev.find(
        (item) => item.id === newItem.id && item.selectedContent === newItem.selectedContent && item.selectedPresentation === newItem.selectedPresentation);
      if (existing) {
        return prev.map((item) =>
          (item.id === newItem.id && item.selectedContent === newItem.selectedContent && item.selectedPresentation === newItem.selectedPresentation)
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, newItem];
    });
    
    setIsCartOpen(true);
  }, []);

  const updateQuantity = useCallback((id: string, content: string, presentation: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id && item.selectedContent === content && item.selectedPresentation === presentation) {
            const newQty = Math.max(0, item.quantity + delta);
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  }, []);

  const removeFromCart = useCallback((id: string, content: string, presentation: string) => {
    setCart((prev) => prev.filter((item) => !(item.id === id && item.selectedContent === content && item.selectedPresentation === presentation)));
  }, []);

  
  //  FINALIZACIÓN DE COMPRA
  
  const handleCheckoutComplete = useCallback((newOrder: Order) => {
    // 1. Guardamos la orden en el estado local de pedidos
    setOrders((prev) => [newOrder, ...prev]);
    
    // 2. Vaciamos el carrito (esto dispara el useEffect que limpia localStorage)
    setCart([]); 
    
    // 3. Cerramos el modal de checkout
    setIsCheckoutOpen(false);

    // 4. Cerramos también el carrito por si estaba abierto por algún motivo
    setIsCartOpen(false);
  }, []);

  const cartCount = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);

  // Valores memoizados: las referencias solo cambian cuando cambian sus datos reales
  const stateValue = useMemo(
    () => ({ cart, orders, cartCount }),
    [cart, orders, cartCount]
  );

  const uiValue = useMemo(
    () => ({ isCartOpen, isProfileOpen, isCheckoutOpen }),
    [isCartOpen, isProfileOpen, isCheckoutOpen]
  );

  const actionsValue = useMemo(
    () => ({
      setIsCartOpen, setIsProfileOpen, setIsCheckoutOpen,
      addToCart, updateQuantity, removeFromCart, handleCheckoutComplete
    }),
    [addToCart, updateQuantity, removeFromCart, handleCheckoutComplete]
  );

  return (
    <CartStateContext.Provider value={stateValue}>
      <CartUIContext.Provider value={uiValue}>
        <CartActionsContext.Provider value={actionsValue}>
          {children}
        </CartActionsContext.Provider>
      </CartUIContext.Provider>
    </CartStateContext.Provider>
  );
};

export const useCartState = () => {
  const context = useContext(CartStateContext);
  if (!context) throw new Error("useCartState debe usarse dentro de CartProvider");
  return context;
};

export const useCartUI = () => {
  const context = useContext(CartUIContext);
  if (!context) throw new Error("useCartUI debe usarse dentro de CartProvider");
  return context;
};

export const useCartActions = () => {
  const context = useContext(CartActionsContext);
  if (!context) throw new Error("useCartActions debe usarse dentro de CartProvider");
  return context;
};