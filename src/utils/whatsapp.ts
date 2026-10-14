import { CartItem } from "@/src/types/product.types";
import { calcSubtotal, countUnpriced, formatPrice } from "@/src/utils/pricing";
import { OUT_OF_STOCK_LABEL } from "@/src/utils/stock";

// Si el mensaje codificado supera este largo se usa el formato compacto (los links muy largos pueden fallar)
const MAX_ENCODED_LENGTH = 3000;

const cleanText = (value: string): string => value.replace(/\s+/g, " ").trim();
const money = (amount: number): string =>
  formatPrice(amount).replace(/\u00a0/g, " ");

/** Presentación y peso del ítem ("Bolsa · 7.5 kg"), omitiendo los valores genéricos ("ÚNICO", "U"). */
const describeOptions = (item: CartItem): string => {
  const presentation = cleanText(item.selectedPresentation ?? "");
  const content = cleanText(item.selectedContent ?? "");
  const parts: string[] = [];
  if (presentation && !["ÚNICO", "UNICO"].includes(presentation.toUpperCase()))
    parts.push(presentation);
  if (content && content.toUpperCase() !== "U") parts.push(content);
  return parts.join(" · ");
};

const itemName = (item: CartItem): string =>
  cleanText(item.name) + (item.brand ? ` (${cleanText(item.brand)})` : "");

const detailedLine = (item: CartItem, index: number): string =>
  [
    `${index + 1}. *${itemName(item)}*`,
    describeOptions(item) && `   ${describeOptions(item)}`,
    `   Cantidad: ${item.quantity}`,
    item.outOfStock && `   (${OUT_OF_STOCK_LABEL})`,
    `   Precio por unidad: ${item.price > 0 ? `${money(item.price)} c/u` : "a consultar"}`,
  ]
    .filter(Boolean)
    .join("\n");

const compactLine = (item: CartItem): string =>
  `• ${item.quantity} x ${itemName(item)}${describeOptions(item) ? ` - ${describeOptions(item)}` : ""}${item.outOfStock ? ` (${OUT_OF_STOCK_LABEL})` : ""}`;

const buildMessage = (items: CartItem[], compact: boolean): string => {
  const subtotal = calcSubtotal(items);
  const unpriced = countUnpriced(items);

  const totals: string[] = [];
  if (subtotal > 0) totals.push(`Total: ${money(subtotal)}`);
  if (unpriced > 0)
    totals.push(
      unpriced === 1
        ? "(1 producto con precio a consultar)"
        : `(${unpriced} productos con precio a consultar)`,
    );

  return [
    "¡Hola ALIMENTO AHORA! Quisiera consultar stock y precio de los siguientes productos:",
    "",
    items
      .map((item, i) => (compact ? compactLine(item) : detailedLine(item, i)))
      .join(compact ? "\n" : "\n\n"),
    ...(totals.length > 0 ? ["", ...totals] : []),
    "",
    "¿Me confirman disponibilidad? ¡Gracias!",
  ].join("\n");
};

/**
 * Arma el link de WhatsApp (wa.me) con la lista de productos del carrito: nombre, marca, presentación,
 * peso, cantidad y precio de referencia. El número viene de VITE_WHATSAPP_NUMBER (.env).
 */
export const generateWhatsAppLink = (cartItems: CartItem[]): string => {
  const phone = String(import.meta.env.VITE_WHATSAPP_NUMBER ?? "").replace(
    /\D/g,
    "",
  );
  if (!phone)
    console.warn(
      "VITE_WHATSAPP_NUMBER no está configurada: el link de WhatsApp se abrirá sin destinatario.",
    );

  const message =
    cartItems.length === 0
      ? "¡Hola ALIMENTO AHORA! Quisiera hacer una consulta."
      : (() => {
          const detailed = buildMessage(cartItems, false);
          return encodeURIComponent(detailed).length <= MAX_ENCODED_LENGTH
            ? detailed
            : buildMessage(cartItems, true);
        })();

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
};
