import React, { useMemo, useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { ActionTile, Button, Empty, Fab, Field, Icon, Segmento, Sheet, T } from '../components';
import { STATUS, useData } from '../data';
import { fmtCurto, isoDate, uid } from '../date';
import { C, F } from '../theme';
import { TIPOS, tipoDe } from '../prompts/padrao';
import PastaScreen from './PastaScreen';

const VAZIO = {
  rascunho: 'Nenhum post para fazer. Toque no + para começar um.',
  pronto: 'Nenhum post pronto. Quando terminar a legenda, marque a pasta como pronta.',
  postado: 'Os posts que você publicar aparecem aqui.',
};

export default function PostsScreen() {
  const { pastas, setPastas } = useData();
  const { width } = useWindowDimensions();
  const [filtro, setFiltro] = useState('rascunho');
  const [aberta, setAberta] = useState(null);
  const [nova, setNova] = useState(null); // { tipo, nome }

  const lista = useMemo(
    () =>
      pastas
        .filter((p) => (p.status || 'rascunho') === filtro)
        .sort((a, b) => (b.atualizadaEm || b.criadaEm).localeCompare(a.atualizadaEm || a.criadaEm)),
    [pastas, filtro]
  );

  const conta = (id) => pastas.filter((p) => (p.status || 'rascunho') === id).length;
  const lado = Math.floor((width - 32 - 12) / 2);

  const criar = () => {
    const tipo = tipoDe(nova.tipo);
    const nome = nova.nome.trim() || `${tipo.label} · ${fmtCurto(isoDate())}`;
    const agora = new Date().toISOString();
    const p = { id: uid(), nome, tipo: tipo.id, status: 'rascunho', legenda: '', fotos: [], capaId: null, criadaEm: agora, atualizadaEm: agora };
    setPastas((l) => [p, ...l]);
    setNova(null);
    setFiltro('rascunho');
    setAberta(p.id);
  };

  return (
    <View style={{ flex: 1 }}>
      <Segmento
        opcoes={STATUS.map((s) => ({ id: s.id, label: `${s.label} ${conta(s.id) || ''}`.trim() }))}
        valor={filtro}
        onChange={setFiltro}
        style={{ margin: 16, marginBottom: 4 }}
      />

      <FlatList
        data={lista}
        numColumns={2}
        keyExtractor={(p) => p.id}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 110, gap: 12 }}
        ListEmptyComponent={
          !pastas.length ? (
            <View style={[s.boasVindas, { width: width - 32 }]}>
              <View style={s.bvIcon}>
                <Icon name="folder-image" size={34} color={C.onLime} />
              </View>
              <Text style={s.bvTitulo}>Um post, uma pasta</Text>
              <T v="small" style={{ textAlign: 'center', fontSize: 14, lineHeight: 20 }}>
                Junte as fotos, gere a legenda com IA e deixe tudo pronto para postar.
              </T>
              <Button title="Criar primeira pasta" icon="folder-plus-outline" onPress={() => setNova({ tipo: 'corte', nome: '' })} style={{ alignSelf: 'stretch', marginTop: 8 }} />
            </View>
          ) : (
            <View style={{ width: width - 32 }}>
              <Empty icon="folder-outline">{VAZIO[filtro]}</Empty>
            </View>
          )
        }
        renderItem={({ item: p }) => {
          const fotos = p.fotos || [];
          const capa = fotos.find((f) => f.id === p.capaId) || fotos[0];
          const tipo = tipoDe(p.tipo);
          return (
            <Pressable onPress={() => setAberta(p.id)} style={({ pressed }) => [s.card, { width: lado }, pressed && { opacity: 0.8 }]}>
              <View style={s.capa}>
                {capa ? <Image source={{ uri: capa.uri }} style={StyleSheet.absoluteFill} resizeMethod="resize" /> : <Icon name={tipo.icon} size={36} color={C.graphite} />}
              </View>
              <View style={{ padding: 10 }}>
                <Text style={s.nome} numberOfLines={1}>
                  {p.nome}
                </Text>
                <Text style={s.sub} numberOfLines={1}>
                  {tipo.label} · {fotos.length ? `${fotos.length} foto${fotos.length > 1 ? 's' : ''}` : 'sem fotos'}
                </Text>
              </View>
            </Pressable>
          );
        }}
      />

      <Fab onPress={() => setNova({ tipo: 'corte', nome: '' })} />

      <Sheet
        visible={!!nova}
        title="Novo post"
        subtitle="Escolha o tipo para receber os prompts certos"
        onClose={() => setNova(null)}
        footer={
          <>
            <Button title="Cancelar" variant="dark" onPress={() => setNova(null)} style={{ flex: 1 }} />
            <Button title="Criar pasta" icon="check" onPress={criar} style={{ flex: 1.4 }} />
          </>
        }
      >
        {nova && (
          <>
            <View style={s.tipos}>
              {TIPOS.map((t) => (
                <ActionTile key={t.id} icon={t.icon} label={t.label} color={C.lime} active={nova.tipo === t.id} onPress={() => setNova({ ...nova, tipo: t.id })} />
              ))}
            </View>
            <Field
              label="Nome (opcional)"
              icon="folder-outline"
              value={nova.nome}
              onChangeText={(nome) => setNova({ ...nova, nome })}
              placeholder={`${tipoDe(nova.tipo).label} · ${fmtCurto(isoDate())}`}
              onSubmitEditing={criar}
              returnKeyType="done"
            />
          </>
        )}
      </Sheet>

      {aberta && <PastaScreen pastaId={aberta} onClose={() => setAberta(null)} />}
    </View>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: C.surface, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: C.border },
  capa: { aspectRatio: 4 / 5, backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center' },
  nome: { fontFamily: F.bold, fontSize: 14.5, color: C.text },
  sub: { fontFamily: F.medium, fontSize: 12, color: C.muted, marginTop: 2 },
  tipos: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  boasVindas: { alignItems: 'center', backgroundColor: C.surface, borderRadius: 20, padding: 22, marginTop: 4, borderWidth: 1, borderColor: C.border, gap: 8 },
  bvIcon: { width: 64, height: 64, borderRadius: 18, backgroundColor: C.lime, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-8deg' }] },
  bvTitulo: { fontFamily: F.display, fontSize: 30, color: C.text, letterSpacing: 1, marginTop: 6 },
});
