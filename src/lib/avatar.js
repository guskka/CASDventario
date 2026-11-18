import { API_URL } from './api';

// Endereço da imagem de avatar de uma pessoa: a foto de perfil, se ela enviou
// uma (url_foto vem da API, ex: "/uploads/usuarios/12-ab12cd.webp"), ou o
// avatar automático gerado a partir do nome.
export function urlAvatar(nome, urlFoto) {
  if (urlFoto) {
    return `${API_URL}${urlFoto}`;
  }
  return `https://api.dicebear.com/10.x/shadows/svg?seed=${encodeURIComponent(nome ?? '')}`;
}
