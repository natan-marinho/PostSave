import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Empty, Icon, Sheet, T } from '../components';
import { useData } from '../data';
import { C, F } from '../theme';
import { CATEGORIAS } from '../prompts/padrao';

/** Lista de prompts para escolher um (usado ao mandar uma foto para o chat). */
export default function EscolherPrompt({ visible, onClose, onEscolher, subtitulo }) {
  const { prompts, chat } = useData();
  const ordenados = [...prompts].sort((a, b) => (b.usos || 0) - (a.usos || 0));
  return (
    <Sheet visible={visible} title="Escolha o prompt" subtitle={subtitulo || `Ele será copiado para colar no ${chat.label}`} onClose={onClose}>
      {!ordenados.length && <Empty icon="text-box-outline">Crie prompts na aba Prompts.</Empty>}
      {ordenados.map((p) => {
        const c = CATEGORIAS.find((x) => x.id === p.categoria) || CATEGORIAS[CATEGORIAS.length - 1];
        return (
          <Pressable key={p.id} onPress={() => onEscolher(p)} style={({ pressed }) => [s.item, pressed && { opacity: 0.7 }]}>
            <View style={s.ico}>
              <Icon name={c.icon} size={20} color={C.lime} />
            </View>
            <View style={{ flex: 1 }}>
              <T v="title" numberOfLines={1}>
                {p.titulo}
              </T>
              <Text style={s.prev} numberOfLines={1}>
                {p.texto}
              </Text>
            </View>
            <Icon name="content-copy" size={18} color={C.muted} />
          </Pressable>
        );
      })}
    </Sheet>
  );
}

const s = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: C.surface,
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: C.border,
  },
  ico: { width: 38, height: 38, borderRadius: 11, backgroundColor: C.limeSoft, alignItems: 'center', justifyContent: 'center' },
  prev: { fontFamily: F.regular, fontSize: 12.5, color: C.muted, marginTop: 2 },
});
