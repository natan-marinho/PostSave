import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Button, Field, SectionTitle, Sheet, T } from '../components';
import { useData } from '../data';
import { C, F } from '../theme';
import { CAMPOS_PERFIL, CHATS } from '../prompts/padrao';

/** Perfil da barbearia (vai no começo de todo prompt) e chat de IA usado. */
export default function Ajustes({ visible, onClose }) {
  const { perfil, setPerfil, chat, setChatId } = useData();
  const [form, setForm] = useState(perfil);

  useEffect(() => {
    if (visible) setForm(perfil);
  }, [visible]);

  const salvar = () => {
    const limpo = {};
    for (const c of CAMPOS_PERFIL) limpo[c.id] = (form[c.id] || '').trim();
    setPerfil(limpo);
    onClose();
  };

  return (
    <Sheet
      visible={visible}
      title="Ajustes"
      subtitle="Vale para todos os prompts"
      onClose={onClose}
      footer={
        <>
          <Button title="Cancelar" variant="dark" onPress={onClose} style={{ flex: 1 }} />
          <Button title="Salvar" icon="check" onPress={salvar} style={{ flex: 1.4 }} />
        </>
      }
    >
      <SectionTitle icon="robot-happy-outline">Chat de IA</SectionTitle>
      <View style={s.chats}>
        {CHATS.map((c) => (
          <Pressable key={c.id} onPress={() => setChatId(c.id)} style={[s.chat, chat.id === c.id && s.chatOn]}>
            <Text style={[s.chatTxt, chat.id === c.id && { color: C.onLime }]}>{c.label}</Text>
          </Pressable>
        ))}
      </View>

      <SectionTitle icon="store-outline">Sua barbearia</SectionTitle>
      <T v="small" style={{ marginBottom: 14 }}>
        Preencha uma vez. Essas informações vão no começo de todo prompt, então a IA já escreve com o nome, o bairro e o jeito de falar da barbearia.
      </T>
      {CAMPOS_PERFIL.map((c) => (
        <Field
          key={c.id}
          label={c.label}
          icon={c.icon}
          value={form[c.id] || ''}
          onChangeText={(v) => setForm((f) => ({ ...f, [c.id]: v }))}
          placeholder={c.placeholder}
          multiline={c.id === 'publico' || c.id === 'tom' || c.id === 'diferenciais'}
        />
      ))}
    </Sheet>
  );
}

const s = StyleSheet.create({
  chats: { flexDirection: 'row', gap: 8, backgroundColor: C.surface, padding: 5, borderRadius: 14, borderWidth: 1, borderColor: C.border },
  chat: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  chatOn: { backgroundColor: C.lime },
  chatTxt: { fontFamily: F.bold, fontSize: 13.5, color: C.text },
});
