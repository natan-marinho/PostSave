import React, { createContext, useContext } from 'react';
import { Alert, Linking } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useStored } from './storage';
import { uid } from './date';
import { CHATS, PROMPTS_PADRAO } from './prompts/padrao';

/*
Pasta  { id, nome, status: 'rascunho'|'pronto'|'postado', legenda, fotos: Foto[], capaId, criadaEm, atualizadaEm }
Foto   { id, uri (arquivo dentro do app), largura, altura, criadaEm }
Prompt { id, titulo, texto, categoria, usos, criadoEm }
*/

export const STATUS = [
  { id: 'rascunho', label: 'Rascunho', icon: 'pencil-outline', cor: '#FFB23F', fundo: 'rgba(255,178,63,0.14)' },
  { id: 'pronto', label: 'Pronto', icon: 'check-circle-outline', cor: '#C4DC1E', fundo: 'rgba(196,220,30,0.14)' },
  { id: 'postado', label: 'Postado', icon: 'send-check-outline', cor: '#6CB8FF', fundo: 'rgba(108,184,255,0.14)' },
];
export const statusDe = (id) => STATUS.find((s) => s.id === id) || STATUS[0];

const promptsIniciais = () => {
  const agora = new Date().toISOString();
  return PROMPTS_PADRAO.map((p) => ({ id: uid(), ...p, usos: 0, criadoEm: agora }));
};

const Ctx = createContext(null);

export function DataProvider({ children }) {
  const [pastas, setPastas, okP] = useStored('ps:pastas', []);
  const [prompts, setPrompts, okR] = useStored('ps:prompts', promptsIniciais);
  const [chatId, setChatId, okC] = useStored('ps:chat', 'chatgpt');

  const chat = CHATS.find((c) => c.id === chatId) || CHATS[0];

  /** Altera uma pasta pelo id (e marca a data de atualização). */
  const mudarPasta = (id, fn) =>
    setPastas((l) => l.map((p) => (p.id === id ? { ...fn(p), atualizadaEm: new Date().toISOString() } : p)));

  const abrirChat = () => Linking.openURL(chat.url).catch(() => Alert.alert('Não deu para abrir', chat.url));

  /** Copia o prompt, conta o uso e oferece abrir o chat. */
  const copiarPrompt = async (p, { perguntar = true } = {}) => {
    await Clipboard.setStringAsync(p.texto);
    setPrompts((l) => l.map((x) => (x.id === p.id ? { ...x, usos: (x.usos || 0) + 1 } : x)));
    if (perguntar)
      Alert.alert('Prompt copiado', `Abra o ${chat.label}, segure no campo de mensagem e toque em Colar.`, [
        { text: 'OK' },
        { text: `Abrir ${chat.label}`, onPress: abrirChat },
      ]);
  };

  const valor = {
    pronto: okP && okR && okC,
    pastas: pastas || [],
    setPastas,
    mudarPasta,
    prompts: prompts || [],
    setPrompts,
    chat,
    setChatId,
    abrirChat,
    copiarPrompt,
  };
  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

export const useData = () => useContext(Ctx);
