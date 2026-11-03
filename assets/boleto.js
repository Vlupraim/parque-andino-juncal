// Boleto de reserva firmado: "PAJ1.<datos>.<firma>" (base64url).
// La firma ECDSA P-256 se verifica con la clave pública, sin conexión: un QR inventado o alterado no pasa.
// La clave privada vive solo en el servidor; en esta maqueta la simula assets/boleto-firma-demo.js.
(() => {
  const PUBLIC_JWK = { kty: 'EC', crv: 'P-256', x: 'xAlnESZbLnGZvJ7MJqnZlEmb_VmpnL4RBuLinhc0XxI', y: 'k8PPB8-CN6JNn6sRJv5WptwQJ3HGmx9kdiV11ziJhzc', ext: true };
  const ALG = { name: 'ECDSA', hash: 'SHA-256' };
  const enc = new TextEncoder(), dec = new TextDecoder();

  const toB64u = bytes => btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const fromB64u = text => Uint8Array.from(atob(text.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((text.length + 3) % 4)), c => c.charCodeAt(0));

  let publicKey = null;
  const getPublicKey = () => publicKey ??= crypto.subtle.importKey('jwk', PUBLIC_JWK, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']);

  // Arma el texto del QR firmando los datos con la clave privada que se le pase.
  async function emitir(datos, privateKey) {
    const cuerpo = toB64u(enc.encode(JSON.stringify(datos)));
    const firma = await crypto.subtle.sign(ALG, privateKey, enc.encode('PAJ1.' + cuerpo));
    return `PAJ1.${cuerpo}.${toB64u(firma)}`;
  }

  // Devuelve { ok: true, datos } si la firma es auténtica, o { ok: false, motivo }.
  async function verificar(texto) {
    const partes = String(texto || '').trim().split('.');
    if (partes.length !== 3 || partes[0] !== 'PAJ1') return { ok: false, motivo: 'No es un boleto del Parque Andino Juncal.' };
    try {
      const valida = await crypto.subtle.verify(ALG, await getPublicKey(), fromB64u(partes[2]), enc.encode('PAJ1.' + partes[1]));
      if (!valida) return { ok: false, motivo: 'La firma no corresponde: el boleto fue alterado o no lo emitió el parque.' };
      return { ok: true, datos: JSON.parse(dec.decode(fromB64u(partes[1]))) };
    } catch {
      return { ok: false, motivo: 'El código está incompleto o dañado.' };
    }
  }

  window.Boleto = { emitir, verificar };
})();
