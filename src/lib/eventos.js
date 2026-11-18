// Avisos simples entre partes da tela que não estão ligadas diretamente.
// Ex.: depois de salvar um administrador (numa janela), a lista recarrega sozinha.

export const USUARIOS_ALTERADOS = 'usuarios-alterados';
export const ALUNOS_ALTERADOS = 'alunos-alterados';

export function avisar(evento) {
  window.dispatchEvent(new Event(evento));
}
