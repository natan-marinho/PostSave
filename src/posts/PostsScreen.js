import React, { useMemo, useState } from 'react';
import { Alert, FlatList, Image, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Button, Chip, Empty, Fab, Field, Icon, Sheet } from '../components';
import { STATUS, statusDe, useData } from '../data';
import { fmtDataHora, uid } from '../date';
import { C, F } from '../theme';
import PastaScreen from './PastaScreen';

export default function PostsScreen() {
  const { pastas, setPastas } = useData();
  const { width } = useWindowDimensions();
  const [filtro, setFiltro] = useState('todos');
  const [aberta, setAberta] = useState(null);
  const [nova, setNova] = useState(null);

  const lista = useMemo(
    () =>
      pastas
        .filter((p) => filtro === 'todos' || (p.status || 'rascunho') === filtro)
        .sort((a, b) => (b.atualizadaEm || b.criadaEm).localeCompare(a.atualizadaEm || a.criadaEm)),
    [pastas, filtro]
  );

  const conta = (id) => pastas.filter((p) => (p.status || 'rascunho') === id).length;
  const lado = Math.floor((width - 32 - 12) / 2);

  const criar = () => {
    const nome = (nova || '').trim();
    if (!nome) return Alert.alert('Falta o nome', 'Ex.: Promoção de sexta, Antes e depois...');
    const agora = new Date().toISOString();
    const p = { id: uid(), nome, status: 'rascunho', legenda: '', fotos: [], capaId: null, criadaEm: agora, atualizadaEm: agora };
    setPastas((l) => [p, ...l]);
    setNova(null);
    setFiltro('todos');
    setAberta(p.id);
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={lista}
        key="grade"
        numColumns={2}
        keyExtractor={(p) => p.id}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 110, gap: 12 }}
        ListHeaderComponent={
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 4 }}>
            <Chip label={`Todas · ${pastas.length}`} selected={filtro === 'todos'} onPress={() => setFiltro('todos')} />
            {STATUS.map((st) => (
              <Chip key={st.id} label={`${st.label} · ${conta(st.id)}`} icon={st.icon} selected={filtro === st.id} onPress={() => setFiltro(st.id)} />
            ))}
          </ScrollView>
        }
        ListEmptyComponent={
          <View style={{ width: width - 32 }}>
            {pastas.length ? (
              <Empty icon="folder-search-outline">Nenhuma pasta com esse status.</Empty>
            ) : (
              <View style={s.boasVindas}>
                <View style={s.bvIcon}>
                  <Icon name="folder-image" size={34} color={C.onLime} />
                </View>
                <Text style={s.bvTitulo}>Organize seus posts</Text>
                <Text style={s.bvTxt}>
                  Crie uma pasta para cada post, suba as fotos, gere a legenda com IA e marque quando estiver pronto ou postado.
                </Text>
                <Button title="Criar primeira pasta" icon="folder-plus-outline" onPress={() => setNova('')} style={{ alignSelf: 'stretch', marginTop: 6 }} />
              </View>
            )}
          </View>
        }
        renderItem={({ item: p }) => {
          const fotos = p.fotos || [];
          const capa = fotos.find((f) => f.id === p.capaId) || fotos[0];
          const st = statusDe(p.status);
          return (
            <Pressable onPress={() => setAberta(p.id)} style={({ pressed }) => [s.card, { width: lado }, pressed && { opacity: 0.8 }]}>
              <View style={s.capa}>
                {capa ? (
                  <Image source={{ uri: capa.uri }} style={StyleSheet.absoluteFill} resizeMethod="resize" />
                ) : (
                  <Icon name="image-plus" size={34} color={C.graphite} />
                )}
                <View style={[s.st, { backgroundColor: st.cor }]}>
                  <Icon name={st.icon} size={12} color={C.onLime} />
                  <Text style={s.stTxt}>{st.label}</Text>
                </View>
                {fotos.length > 1 && (
                  <View style={s.qtd}>
                    <Icon name="checkbox-multiple-blank-outline" size={12} color={C.text} />
                    <Text style={s.qtdTxt}>{fotos.length}</Text>
                  </View>
                )}
              </View>
              <View style={{ padding: 10 }}>
                <Text style={s.nome} numberOfLines={1}>
                  {p.nome}
                </Text>
                <Text style={s.sub} numberOfLines={1}>
                  {p.legenda?.trim() ? 'Com legenda' : 'Sem legenda'} · {fmtDataHora(p.atualizadaEm || p.criadaEm)}
                </Text>
              </View>
            </Pressable>
          );
        }}
      />

      <Fab icon="folder-plus-outline" onPress={() => setNova('')} />

      <Sheet
        visible={nova != null}
        title="Nova pasta"
        subtitle="Uma pasta para cada post"
        onClose={() => setNova(null)}
        footer={
          <>
            <Button title="Cancelar" variant="dark" onPress={() => setNova(null)} style={{ flex: 1 }} />
            <Button title="Criar" icon="check" onPress={criar} style={{ flex: 1.4 }} />
          </>
        }
      >
        <Field label="Nome da pasta" icon="folder-outline" value={nova || ''} onChangeText={setNova} placeholder="Ex.: Promoção de sexta" autoFocus onSubmitEditing={criar} returnKeyType="done" />
      </Sheet>

      {aberta && <PastaScreen pastaId={aberta} onClose={() => setAberta(null)} />}
    </View>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: C.surface, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: C.border },
  capa: { aspectRatio: 4 / 5, backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center' },
  st: { position: 'absolute', left: 8, top: 8, flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 4 },
  stTxt: { fontFamily: F.bold, fontSize: 10.5, color: C.onLime },
  qtd: { position: 'absolute', right: 8, top: 8, flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 8, paddingHorizontal: 7, paddingVertical: 4, backgroundColor: 'rgba(0,0,0,0.65)' },
  qtdTxt: { fontFamily: F.bold, fontSize: 11, color: C.text },
  nome: { fontFamily: F.bold, fontSize: 14.5, color: C.text },
  sub: { fontFamily: F.medium, fontSize: 11.5, color: C.muted, marginTop: 2 },
  boasVindas: { alignItems: 'center', backgroundColor: C.surface, borderRadius: 20, padding: 22, marginTop: 16, borderWidth: 1, borderColor: C.border, gap: 10 },
  bvIcon: { width: 64, height: 64, borderRadius: 18, backgroundColor: C.lime, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-8deg' }] },
  bvTitulo: { fontFamily: F.display, fontSize: 30, color: C.text, letterSpacing: 1, marginTop: 4 },
  bvTxt: { fontFamily: F.medium, fontSize: 14, color: C.muted, textAlign: 'center', lineHeight: 20 },
});
