import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Button, Chip, Empty, Fab, Field, Icon, Sheet, T } from '../components';
import { camposDe, useData } from '../data';
import { uid } from '../date';
import { C, F } from '../theme';
import { CATEGORIAS, catDe } from './padrao';
import UsarPrompt from './UsarPrompt';

export default function PromptsScreen({ abrirAjustes }) {
  const { prompts, setPrompts, perfilIncompleto } = useData();
  const [cat, setCat] = useState('todos');
  const [usando, setUsando] = useState(null);
  const [form, setForm] = useState(null);

  const grupos = useMemo(() => {
    const cats = cat === 'todos' ? CATEGORIAS : CATEGORIAS.filter((c) => c.id === cat);
    return cats
      .map((c) => ({ c, itens: prompts.filter((p) => catDe(p.categoria).id === c.id).sort((a, b) => (b.usos || 0) - (a.usos || 0)) }))
      .filter((g) => g.itens.length);
  }, [prompts, cat]);

  const salvar = () => {
    if (!form.titulo.trim()) return Alert.alert('Falta o título', 'Ex.: Legenda de degradê');
    if (!form.texto.trim()) return Alert.alert('Falta o prompt', 'Escreva ou cole o texto do prompt.');
    const dados = { titulo: form.titulo.trim(), descricao: form.descricao.trim(), texto: form.texto.trim(), categoria: form.categoria };
    if (form.id) {
      setPrompts((l) => l.map((p) => (p.id === form.id ? { ...p, ...dados } : p)));
      setUsando((u) => (u && u.id === form.id ? { ...u, ...dados } : u));
    } else {
      setPrompts((l) => [{ id: uid(), ...dados, tipos: [], usos: 0, ultimos: {}, criadoEm: new Date().toISOString() }, ...l]);
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
          setUsando(null);
        },
      },
    ]);

  const colar = async () => {
    const txt = await Clipboard.getStringAsync();
    if (!txt) return Alert.alert('Nada copiado', 'Copie um texto e volte aqui.');
    setForm((f) => ({ ...f, texto: f.texto ? f.texto + '\n' + txt : txt }));
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={s.chips}>
        <Chip label="Todos" selected={cat === 'todos'} onPress={() => setCat('todos')} />
        {CATEGORIAS.map((c) => (
          <Chip key={c.id} label={c.label} icon={c.icon} selected={cat === c.id} onPress={() => setCat(c.id)} />
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 8, paddingBottom: 110 }}>
        {perfilIncompleto && (
          <Pressable onPress={abrirAjustes} style={({ pressed }) => [s.perfil, pressed && { opacity: 0.8 }]}>
            <Icon name="store-edit-outline" size={22} color={C.warn} />
            <View style={{ flex: 1 }}>
              <T v="title" style={{ fontSize: 14 }}>
                Complete o perfil da barbearia
              </T>
              <T v="small">Bairro, WhatsApp e Instagram entram em todo prompt.</T>
            </View>
            <Icon name="chevron-right" size={22} color={C.warn} />
          </Pressable>
        )}

        {!grupos.length && <Empty icon="text-box-outline">Nenhum prompt aqui. Toque no + para criar.</Empty>}

        {grupos.map(({ c, itens }) => (
          <View key={c.id} style={{ marginBottom: 10 }}>
            {cat === 'todos' && (
              <T v="label" style={{ marginBottom: 8, marginTop: 6 }}>
                {c.label}
              </T>
            )}
            {itens.map((p) => {
              const n = camposDe(p.texto).length;
              return (
                <Pressable key={p.id} onPress={() => setUsando(p)} style={({ pressed }) => [s.item, pressed && { opacity: 0.7 }]}>
                  <View style={s.ico}>
                    <Icon name={c.icon} size={20} color={C.lime} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.titulo} numberOfLines={1}>
                      {p.titulo}
                    </Text>
                    <Text style={s.desc} numberOfLines={1}>
                      {p.descricao || (n ? `${n} campo${n > 1 ? 's' : ''} para preencher` : 'Pronto para copiar')}
                    </Text>
                  </View>
                  <Icon name="chevron-right" size={22} color={C.faint} />
                </Pressable>
              );
            })}
          </View>
        ))}
      </ScrollView>

      <Fab onPress={() => setForm({ id: null, titulo: '', descricao: '', texto: '', categoria: cat === 'todos' ? 'legenda' : cat })} />

      {/* Usar (preencher e copiar) */}
      <UsarPrompt
        visible={!!usando && !form}
        prompt={usando}
        onClose={() => setUsando(null)}
        rodape={
          usando && (
            <>
              <Button icon="delete-outline" variant="danger" small onPress={() => excluir(usando)} style={{ width: 48 }} />
              <Button icon="pencil-outline" variant="dark" small onPress={() => setForm({ descricao: '', ...usando })} style={{ width: 48 }} />
            </>
          )
        }
      />

      {/* Novo / editar */}
      <Sheet
        visible={!!form}
        title={form?.id ? 'Editar prompt' : 'Novo prompt'}
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
            <Field label="Título" icon="format-title" value={form.titulo} onChangeText={(titulo) => setForm({ ...form, titulo })} placeholder="Ex.: Legenda de degradê" />
            <Field label="Para que serve (opcional)" icon="information-outline" value={form.descricao} onChangeText={(descricao) => setForm({ ...form, descricao })} placeholder="Ex.: Foto de antes e depois" />
            <Text style={s.label}>Categoria</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {CATEGORIAS.map((c) => (
                <Chip key={c.id} label={c.label} icon={c.icon} selected={form.categoria === c.id} onPress={() => setForm({ ...form, categoria: c.id })} />
              ))}
            </View>
            <View style={s.dica}>
              <Icon name="lightbulb-on-outline" size={18} color={C.lime} />
              <Text style={s.dicaTxt}>
                Escreva entre chaves o que muda a cada uso, como <Text style={{ color: C.lime }}>{'{Nome do corte}'}</Text> ou{' '}
                <Text style={{ color: C.lime }}>{'{Preço}'}</Text>. O app pergunta antes de copiar. O perfil da barbearia já vai junto.
              </Text>
            </View>
            <Field
              label="Prompt"
              value={form.texto}
              onChangeText={(texto) => setForm({ ...form, texto })}
              placeholder="O que a IA deve fazer?"
              multiline
              textAlignVertical="top"
              style={{ minHeight: 180 }}
            />
            <Button title="Colar texto copiado" icon="clipboard-text-outline" variant="outline" small onPress={colar} />
          </>
        )}
      </Sheet>
    </View>
  );
}

const s = StyleSheet.create({
  chips: { gap: 8, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  perfil: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.warnSoft, borderRadius: 16, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: 'rgba(255,178,63,0.35)' },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.surface, borderRadius: 14, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: C.border },
  ico: { width: 40, height: 40, borderRadius: 12, backgroundColor: C.limeSoft, alignItems: 'center', justifyContent: 'center' },
  titulo: { fontFamily: F.bold, fontSize: 15, color: C.text },
  desc: { fontFamily: F.medium, fontSize: 12.5, color: C.muted, marginTop: 1 },
  label: { fontFamily: F.bold, fontSize: 11.5, color: C.muted, marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase' },
  dica: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', backgroundColor: C.limeSoft, borderRadius: 12, padding: 12, marginBottom: 14 },
  dicaTxt: { flex: 1, fontFamily: F.medium, fontSize: 12.5, color: C.text, lineHeight: 18 },
});
