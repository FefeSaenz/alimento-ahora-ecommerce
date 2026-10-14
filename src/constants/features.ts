/**
 * FEATURE FLAGS
 *
 * ENABLE_AUTH: controla los accesos visibles de cuenta (perfil, "Mi Cuenta", modal UserProfile)
 * y la redirección por sesión expirada. En false la tienda opera como catálogo para invitados;
 * el código de autenticación (AuthContext, useOtpAuth, UserProfile) se conserva para reactivarlo
 * cambiando este valor a true.
 */
export const ENABLE_AUTH = false;
