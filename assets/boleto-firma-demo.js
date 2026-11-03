// SOLO PARA LA MAQUETA. En producción esta clave privada vive únicamente en el servidor (variable de entorno)
// y los boletos se firman allí al confirmarse el pago. Publicarla, como aquí, permitiría falsificar boletos.
(() => {
  const PRIVATE_JWK = {
    kty: 'EC', crv: 'P-256', ext: true,
    x: 'xAlnESZbLnGZvJ7MJqnZlEmb_VmpnL4RBuLinhc0XxI', y: 'k8PPB8-CN6JNn6sRJv5WptwQJ3HGmx9kdiV11ziJhzc', d: 'X30dAnIlkODbeEaf80jUUJLOsWpR3r47XuVC3PinYKc'
  };
  let key = null;
  window.firmarBoletoDemo = async datos => {
    key ??= await crypto.subtle.importKey('jwk', PRIVATE_JWK, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
    return window.Boleto.emitir(datos, key);
  };
})();
