import React, { createContext, useContext } from 'react';
import { Alert, Linking } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useStored } from './storage';
import { uid } from './date';
import { CAMPOS_PERFIL, CHATS, PERFIL_PADRAO, PROMPTS_PADRAO } from './prompts/padrao';

/*
Pasta  { id, nome, tipo, status: 'rascunho'|'pronto'|'postado', legenda, fotos: Foto[], capaId, criadaEm, atualizadaEm, postadoEm }
Foto   { id, uri (arquivo dentro do app), largura, altura, criadaEm }
Prompt { id, titulo, descricao, texto (com {Campos}), categoria, tipos: string[], usos, ultimos: {campo: valor}, criadoEm }
Perfil { nome, local, instagram, whatsapp, publico, tom, diferenciais }
*/

export const STATUS = [
  { id: 'rascunho', label: 'A fazer', icon: 'progress-pencil', cor: '#FFB23F' },
  { id: 'pronto', label: 'Prontos', icon: 'check-circle-outline', cor: '#C4DC1E' },
  { id: 'postado', label: 'Postados', icon: 'send-check-outline', cor: '#6CB8FF' },
];
export const statusDe = (id) => STATUS.find((s) => s.id === id) || STATUS[0];

/** Campos {Assim} do texto do prompt, sem repetir. */
export const camposDe = (texto) => [...new Set([...(texto || '').matchAll(/\{([^{}\n]{1,60})\}/g)].map((m) => m[1].trim()))];

/** Rótulo do campo sem o exemplo: "Preço (ex.: 30)" -> "Preço". */
export const rotuloCampo = (c) => c.replace(/\s*\(.*\)\s*$/, '');
export const exemploCampo = (c) => (/\((?:ex\.:\s*)?(.*)\)\s*$/.exec(c) || [])[1] || '';

export function contextoPerfil(perfil) {
  const linhas = CAMPOS_PERFIL.filter((c) => (perfil?.[c.id] || '').trim()).map((c) => `- ${c.label}: ${perfil[c.id].trim()}`);
  return linhas.length ? `CONTEXTO DA BARBEARIA (use em toda a resposta):\n${linhas.join('\n')}\n\n` : '';
}

/** Texto final: contexto da barbearia + prompt com os campos preenchidos. */
export function montarPrompt(prompt, valores, perfil) {
  const corpo = (prompt.texto || '').replace(/\{([^{}\n]{1,60})\}/g, (_, c) => {
    const v = (valores?.[c.trim()] || '').trim();
    return v || '(não informado)';
  });
  return contextoPerfil(perfil) + corpo;
}

const promptsIniciais = () => {
  const agora = new Date().toISOString();
  return PROMPTS_PADRAO.map((p) => ({ id: uid(), ...p, usos: 0, ultimos: {}, criadoEm: agora }));
};

const Ctx = createContext(null);

export function DataProvider({ children }) {
  const [pastas, setPastas, okP] = useStored('ps:pastas', []);
  const [prompts, setPrompts, okR] = useStored('ps:prompts:v2', promptsIniciais);
  const [perfil, setPerfil, okF] = useStored('ps:perfil', PERFIL_PADRAO);
  const [chatId, setChatId, okC] = useStored('ps:chat', 'chatgpt');

  const chat = CHATS.find((c) => c.id === chatId) || CHATS[0];

  /** Altera uma pasta pelo id (e marca a data de atualização). */
  const mudarPasta = (id, fn) =>
    setPastas((l) => l.map((p) => (p.id === id ? { ...fn(p), atualizadaEm: new Date().toISOString() } : p)));

  const abrirChat = () => Linking.openURL(chat.url).catch(() => Alert.alert('Não deu para abrir', chat.url));

  /** Monta o prompt final, copia e guarda os valores usados. Retorna o texto copiado. */
  const copiarPrompt = async (p, valores = {}) => {
    const texto = montarPrompt(p, valores, perfil);
    await Clipboard.setStringAsync(texto);
    setPrompts((l) => l.map((x) => (x.id === p.id ? { ...x, usos: (x.usos || 0) + 1, ultimos: valores } : x)));
    return texto;
  };

  const perfilIncompleto = !perfil?.local?.trim() || !(perfil?.whatsapp?.trim() || perfil?.instagram?.trim());

  const valor = {
    pronto: okP && okR && okF && okC,
    pastas: pastas || [],
    setPastas,
    mudarPasta,
    prompts: prompts || [],
    setPrompts,
    perfil: perfil || PERFIL_PADRAO,
    setPerfil,
    perfilIncompleto,
    chat,
    setChatId,
    abrirChat,
    copiarPrompt,
  };
  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

export const useData = () => useContext(Ctx);
