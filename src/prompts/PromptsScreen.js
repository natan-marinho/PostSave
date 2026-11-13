import React, { useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Button, Card, Chip, Empty, Fab, Field, Icon, Sheet, T } from '../components';
import { useData } from '../data';
import { uid } from '../date';
import { C, F } from '../theme';
import { CATEGORIAS, CHATS } from './padrao';

const normalizar = (t) =>
  (t || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

const catDe = (id) => CATEGORIAS.find((c) => c.id === id) || CATEGORIAS[CATEGORIAS.length - 1];

export default function PromptsScreen() {
  const { prompts, setPrompts, copiarPrompt, abrirChat, chat, setChatId } = useData();
  const [busca, setBusca] = useState('');
  const [cat, setCat] = useState('todos');
  const [aberto, setAberto] = useState(null);
  const [form, setForm] = useState(null);

  const lista = useMemo(() => {
    const q = normalizar(busca);
    return prompts
      .filter((p) => cat === 'todos' || p.categoria === cat)
      .filter((p) => !q || normalizar(p.titulo + ' ' + p.texto).includes(q))
      .sort((a, b) => (b.usos || 0) - (a.usos || 0) || a.titulo.localeCompare(b.titulo));
  }, [prompts, busca, cat]);

  const salvar = () => {
    if (!form.titulo.trim()) return Alert.alert('Falta o título', 'Ex.: Legenda para Reels');
    if (!form.texto.trim()) return Alert.alert('Falta o prompt', 'Escreva ou cole o texto do prompt.');
    const dados = { titulo: form.titulo.trim(), texto: form.texto.trim(), categoria: form.categoria };
    if (form.id) {
      setPrompts((l) => l.map((p) => (p.id === form.id ? { ...p, ...dados } : p)));
      setAberto((a) => (a && a.id === form.id ? { ...a, ...dados } : a));
    } else {
      setPrompts((l) => [{ id: uid(), ...dados, usos: 0, criadoEm: new Date().toISOString() }, ...l]);
    }
    setForm(null);
  };

  const excluir = (p) =>
    Alert.alert('Excluir prompt?', p.titulo, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => {
          setPrompts((l) => l.filter((x) => x.id !== p.id));
          setAberto(null);
        },
      },
    ]);

  const colar = async () => {
    const txt = await Clipboard.getStringAsync();
    if (!txt) return Alert.alert('Nada copiado', 'Copie um texto e volte aqui.');
    setForm((f) => ({ ...f, texto: f.texto ? f.texto + '\n' + txt : txt }));
  };

  const topo = (
    <View>
      <Field icon="magnify" value={busca} onChangeText={setBusca} placeholder="Buscar prompt" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 4 }}>
        <Chip label="Todos" selected={cat === 'todos'} onPress={() => setCat('todos')} />
        {CATEGORIAS.map((c) => (
          <Chip key={c.id} label={c.label} icon={c.icon} selected={cat === c.id} onPress={() => setCat(c.id)} />
        ))}
      </ScrollView>

      <View style={s.chatBox}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <Icon name="robot-happy-outline" size={18} color={C.lime} />
          <T v="label" style={{ color: C.text }}>
            Chat de IA
          </T>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {CHATS.map((c) => (
            <Pressable key={c.id} onPress={() => setChatId(c.id)} style={[s.chatOpt, chat.id === c.id && s.chatOptOn]}>
              <Text style={[s.chatTxt, chat.id === c.id && { color: C.onLime }]}>{c.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={lista}
        keyExtractor={(p) => p.id}
        ListHeaderComponent={topo}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 16, paddingBottom: 110 }}
        ListEmptyComponent={
          <Empty icon="text-box-search-outline">
            {prompts.length ? 'Nenhum prompt encontrado.' : 'Toque no + para criar seu primeiro prompt.'}
          </Empty>
        }
        renderItem={({ item: p }) => {
          const c = catDe(p.categoria);
          return (
            <Card onPress={() => setAberto(p)} onLongPress={() => setForm({ ...p })}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={s.ico}>
                  <Icon name={c.icon} size={22} color={C.lime} />
                </View>
                <View style={{ flex: 1 }}>
                  <T v="title" numberOfLines={1}>
                    {p.titulo}
                  </T>
                  <T v="small">
                    {c.label}
                    {p.usos ? ` · usado ${p.usos}x` : ''}
                  </T>
                </View>
              </View>
              <Text style={s.preview} numberOfLines={2}>
                {p.texto}
              </Text>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                <Button title="Copiar" icon="content-copy" small onPress={() => copiarPrompt(p)} style={{ flex: 1 }} />
                <Button
                  title={chat.label}
                  icon="open-in-new"
                  variant="outline"
                  small
                  onPress={async () => {
                    await copiarPrompt(p, { perguntar: false });
                    abrirChat();
                  }}
                  style={{ flex: 1 }}
                />
              </View>
            </Card>
          );
        }}
      />

      <Fab onPress={() => setForm({ id: null, titulo: '', texto: '', categoria: cat === 'todos' ? 'legenda' : cat })} />

      {/* Ver prompt */}
      <Sheet
        visible={!!aberto && !form}
        title={aberto?.titulo || ''}
        subtitle={aberto ? catDe(aberto.categoria).label : ''}
        onClose={() => setAberto(null)}
        footer={
          aberto && (
            <>
              <Button icon="delete-outline" variant="danger" small onPress={() => excluir(aberto)} style={{ width: 52 }} />
              <Button title="Editar" icon="pencil-outline" variant="dark" small onPress={() => setForm({ ...aberto })} style={{ flex: 1 }} />
              <Button
                title={`Copiar e abrir`}
                icon="robot-outline"
                small
                onPress={async () => {
                  await copiarPrompt(aberto, { perguntar: false });
                  abrirChat();
                }}
                style={{ flex: 1.4 }}
              />
            </>
          )
        }
      >
        {aberto && (
          <Text selectable style={s.texto}>
            {aberto.texto}
          </Text>
        )}
      </Sheet>

      {/* Novo / editar */}
      <Sheet
        visible={!!form}
        title={form?.id ? 'Editar prompt' : 'Novo prompt'}
        subtitle={form?.id ? '' : 'Guarde aqui os prompts que você mais usa'}
        onClose={() => setForm(null)}
        footer={
          <>
            <Button title="Cancelar" variant="dark" onPress={() => setForm(null)} style={{ flex: 1 }} />
            <Button title="Salvar" icon="check" onPress={salvar} style={{ flex: 1.4 }} />
          </>
        }
      >
        {form && (
          <>
            <Field label="Título" icon="format-title" value={form.titulo} onChangeText={(titulo) => setForm({ ...form, titulo })} placeholder="Ex.: Legenda para Reels" />
            <Text style={s.label}>Categoria</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
              {CATEGORIAS.map((c) => (
                <Chip key={c.id} label={c.label} icon={c.icon} selected={form.categoria === c.id} onPress={() => setForm({ ...form, categoria: c.id })} />
              ))}
            </View>
            <Button title="Colar texto copiado" icon="clipboard-text-outline" variant="outline" small onPress={colar} style={{ marginBottom: 12 }} />
            <Field
              label="Prompt"
              value={form.texto}
              onChangeText={(texto) => setForm({ ...form, texto })}
              placeholder="Escreva o que a IA deve fazer"
              multiline
              textAlignVertical="top"
              style={{ minHeight: 180 }}
            />
          </>
        )}
      </Sheet>
    </View>
  );
}

const s = StyleSheet.create({
  ico: { width: 42, height: 42, borderRadius: 12, backgroundColor: C.limeSoft, alignItems: 'center', justifyContent: 'center' },
  preview: { fontFamily: F.regular, fontSize: 13.5, color: C.muted, lineHeight: 19, marginTop: 10 },
  texto: { fontFamily: F.regular, fontSize: 15, color: C.text, lineHeight: 23 },
  label: { fontFamily: F.bold, fontSize: 11.5, color: C.muted, marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase' },
  chatBox: { backgroundColor: C.surface, borderRadius: 16, padding: 14, marginTop: 12, marginBottom: 16, borderWidth: 1, borderColor: C.border },
  chatOpt: { flex: 1, paddingVertical: 9, borderRadius: 10, alignItems: 'center', backgroundColor: C.surface2 },
  chatOptOn: { backgroundColor: C.lime },
  chatTxt: { fontFamily: F.bold, fontSize: 13, color: C.text },
});
