import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Linking, Modal, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { ActionTile, Button, Empty, Field, Icon, Segmento, Sheet, T } from '../components';
import { statusDe, useData } from '../data';
import { apagarArquivos, compartilhar, escolherDaGaleria, exportarParaGaleria, tirarFoto } from '../fotos';
import { C, F } from '../theme';
import { TIPOS, tipoDe } from '../prompts/padrao';
import UsarPrompt from '../prompts/UsarPrompt';
import Visualizador from './Visualizador';

/** Uma pasta aberta, em 3 etapas: Fotos, Legenda e Postar. */
export default function PastaScreen({ pastaId, onClose }) {
  const { pastas, setPastas, mudarPasta, chat } = useData();
  const pasta = pastas.find((p) => p.id === pastaId);
  const lado = Math.floor((useWindowDimensions().width - 32 - 12) / 3);

  const [etapa, setEtapa] = useState(() => {
    if (!pasta?.fotos?.length) return 'fotos';
    return pasta.legenda?.trim() ? 'postar' : 'legenda';
  });
  const [verFoto, setVerFoto] = useState(null); // índice da foto aberta
  const [ia, setIa] = useState(null); // { foto } -> escolher prompt
  const [editar, setEditar] = useState(null); // { nome, tipo }
  const [ordenar, setOrdenar] = useState(false);
  const [ocupado, setOcupado] = useState(false);

  if (!pasta) return null;
  const fotos = pasta.fotos || [];
  const capa = fotos.find((f) => f.id === pasta.capaId) || fotos[0];
  const tipo = tipoDe(pasta.tipo);
  const status = statusDe(pasta.status);
  const temLegenda = !!pasta.legenda?.trim();

  const mudar = (fn) => mudarPasta(pasta.id, fn);

  /* ---------- Fotos ---------- */
  const adicionar = async (origem) => {
    setOcupado(true);
    try {
      const novas = await (origem === 'camera' ? tirarFoto() : escolherDaGaleria());
      if (novas.length) mudar((p) => ({ ...p, fotos: [...(p.fotos || []), ...novas] }));
    } catch (e) {
      Alert.alert('Não deu para abrir', 'Tente de novo.');
    } finally {
      setOcupado(false);
    }
  };

  const excluirFoto = (foto) =>
    Alert.alert('Tirar foto da pasta?', 'A foto original na galeria não é apagada.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Tirar',
        style: 'destructive',
        onPress: () => {
          apagarArquivos([foto]);
          mudar((p) => ({ ...p, fotos: p.fotos.filter((f) => f.id !== foto.id), capaId: p.capaId === foto.id ? null : p.capaId }));
          if (fotos.length <= 1) setVerFoto(null);
        },
      },
    ]);

  const mover = (n, dir) =>
    mudar((p) => {
      const l = [...p.fotos];
      const m = n + dir;
      if (m < 0 || m >= l.length) return p;
      [l[n], l[m]] = [l[m], l[n]];
      return { ...p, fotos: l };
    });

  /* ---------- Legenda ---------- */
  const colarLegenda = async () => {
    const txt = await Clipboard.getStringAsync();
    if (!txt) return Alert.alert('Nada copiado', `No ${chat.label}, segure a resposta e toque em Copiar. Depois volte aqui.`);
    if (!temLegenda) return mudar((p) => ({ ...p, legenda: txt }));
    Alert.alert('Já tem legenda', 'O que fazer com o texto copiado?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Juntar', onPress: () => mudar((p) => ({ ...p, legenda: p.legenda + '\n\n' + txt })) },
      { text: 'Trocar', onPress: () => mudar((p) => ({ ...p, legenda: txt })) },
    ]);
  };

  const copiarLegenda = async () => {
    if (!temLegenda) return Alert.alert('Sem legenda', 'Escreva ou cole a legenda na etapa Legenda.');
    await Clipboard.setStringAsync(pasta.legenda);
    Alert.alert('Legenda copiada', 'Cole no Instagram na hora de postar.');
  };

  /* ---------- Postar ---------- */
  const salvarGaleria = async () => {
    if (!fotos.length) return Alert.alert('Pasta sem fotos', 'Adicione as fotos na etapa Fotos.');
    setOcupado(true);
    try {
      const album = await exportarParaGaleria(fotos, pasta.nome);
      if (album) {
        mudar((p) => ({ ...p, salvoGaleria: true }));
        Alert.alert('Salvo na galeria', `Álbum "${album}", na ordem da pasta.`);
      }
    } catch (e) {
      Alert.alert('Não deu para salvar', String(e?.message || e));
    } finally {
      setOcupado(false);
    }
  };

  const abrirInstagram = () => Linking.openURL('https://www.instagram.com/').catch(() => {});

  const mudarStatus = (id) => mudar((p) => ({ ...p, status: id, postadoEm: id === 'postado' ? new Date().toISOString() : null }));

  const excluirPasta = () =>
    Alert.alert('Excluir pasta?', `"${pasta.nome}" e as ${fotos.length} foto(s) dela saem do app. As fotos da galeria continuam lá.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => {
          apagarArquivos(fotos);
          setEditar(null);
          onClose();
          setPastas((l) => l.filter((p) => p.id !== pasta.id));
        },
      },
    ]);

  return (
    <Modal visible animationType="slide" onRequestClose={onClose} statusBarTranslucent navigationBarTranslucent>
      <View style={{ flex: 1, backgroundColor: C.bg }}>
        {/* Cabeçalho */}
        <SafeAreaView edges={['top']} style={s.header}>
          <Pressable onPress={onClose} hitSlop={12} style={s.voltar}>
            <Icon name="arrow-left" size={22} color={C.onLime} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={s.marca}>
              {tipo.label.toUpperCase()} · <Text style={{ color: status.cor }}>{status.label.toUpperCase()}</Text>
            </Text>
            <Text style={s.titulo} numberOfLines={1}>
              {pasta.nome}
            </Text>
          </View>
          <Pressable onPress={() => setEditar({ nome: pasta.nome, tipo: pasta.tipo || 'corte' })} hitSlop={10} style={s.icone}>
            <Icon name="pencil-outline" size={20} color={C.text} />
          </Pressable>
        </SafeAreaView>
        <View style={s.faixa} />

        <Segmento
          valor={etapa}
          onChange={(e) => {
            setOrdenar(false);
            setEtapa(e);
          }}
          style={{ margin: 16, marginBottom: 6 }}
          opcoes={[
            { id: 'fotos', label: '1 Fotos', feito: fotos.length > 0 },
            { id: 'legenda', label: '2 Legenda', feito: temLegenda },
            { id: 'postar', label: '3 Postar', feito: pasta.status === 'postado' },
          ]}
        />

        <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 10, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          {/* ===== 1. Fotos ===== */}
          {etapa === 'fotos' && (
            <>
              {!fotos.length ? (
                <View style={s.vazio}>
                  <Icon name="image-plus" size={44} color={C.lime} />
                  <Text style={s.vazioTit}>Adicione as fotos do post</Text>
                  <T v="small" style={{ textAlign: 'center' }}>
                    Elas ficam guardadas aqui dentro, na ordem do carrossel.
                  </T>
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 14, alignSelf: 'stretch' }}>
                    <Button title="Galeria" icon="image-multiple-outline" onPress={() => adicionar('galeria')} style={{ flex: 1 }} disabled={ocupado} />
                    <Button title="Câmera" icon="camera-outline" variant="outline" onPress={() => adicionar('camera')} style={{ flex: 1 }} disabled={ocupado} />
                  </View>
                </View>
              ) : (
                <>
                  <View style={s.barra}>
                    <T v="small" style={{ flex: 1 }}>
                      {ordenar ? 'Use as setas para mudar a ordem.' : 'Toque numa foto para abrir.'}
                    </T>
                    {!ordenar && (
                      <>
                        <Pressable onPress={() => adicionar('galeria')} disabled={ocupado} style={s.mini}>
                          <Icon name="image-plus" size={20} color={C.lime} />
                        </Pressable>
                        <Pressable onPress={() => adicionar('camera')} disabled={ocupado} style={s.mini}>
                          <Icon name="camera-outline" size={20} color={C.lime} />
                        </Pressable>
                      </>
                    )}
                    {fotos.length > 1 && (
                      <Pressable onPress={() => setOrdenar(!ordenar)} style={[s.mini, ordenar && { backgroundColor: C.lime, width: 'auto', paddingHorizontal: 12 }]}>
                        {ordenar ? <Text style={s.miniTxt}>Pronto</Text> : <Icon name="swap-horizontal" size={20} color={C.lime} />}
                      </Pressable>
                    )}
                  </View>
                  {ocupado && <ActivityIndicator color={C.lime} style={{ marginBottom: 10 }} />}
                  <View style={s.grade}>
                    {fotos.map((f, n) => (
                      <Pressable key={f.id} disabled={ordenar} onPress={() => setVerFoto(n)} style={[s.cel, { width: lado }]}>
                        <Image source={{ uri: f.uri }} style={s.thumb} resizeMethod="resize" />
                        <View style={s.num}>
                          <Text style={s.numTxt}>{n + 1}</Text>
                        </View>
                        {f.id === capa?.id && !ordenar && (
                          <View style={s.capaTag}>
                            <Text style={s.capaTxt}>CAPA</Text>
                          </View>
                        )}
                        {ordenar && (
                          <View style={s.setas}>
                            <Pressable onPress={() => mover(n, -1)} disabled={n === 0} style={[s.seta, n === 0 && { opacity: 0.3 }]}>
                              <Icon name="chevron-left" size={22} color={C.onLime} />
                            </Pressable>
                            <Pressable onPress={() => mover(n, 1)} disabled={n === fotos.length - 1} style={[s.seta, n === fotos.length - 1 && { opacity: 0.3 }]}>
                              <Icon name="chevron-right" size={22} color={C.onLime} />
                            </Pressable>
                          </View>
                        )}
                      </Pressable>
                    ))}
                  </View>
                  <Button title="Próximo: legenda" icon="arrow-right" variant="dark" onPress={() => setEtapa('legenda')} style={{ marginTop: 18 }} />
                </>
              )}
            </>
          )}

          {/* ===== 2. Legenda ===== */}
          {etapa === 'legenda' && (
            <>
              <Pressable onPress={() => setIa({ foto: capa || null })} style={({ pressed }) => [s.ia, pressed && { opacity: 0.85 }]}>
                <View style={s.robo}>
                  <Icon name="robot-happy-outline" size={24} color={C.onLime} />
                </View>
                <View style={{ flex: 1 }}>
                  <T v="title">Criar legenda com IA</T>
                  <T v="small">{capa ? `Manda a capa + o prompt para o ${chat.label}` : `Copia o prompt e abre o ${chat.label}`}</T>
                </View>
                <Icon name="chevron-right" size={24} color={C.lime} />
              </Pressable>

              <Field
                label="Legenda"
                value={pasta.legenda || ''}
                onChangeText={(legenda) => mudar((p) => ({ ...p, legenda }))}
                placeholder="Escreva aqui ou cole a resposta do chat"
                multiline
                textAlignVertical="top"
                style={{ minHeight: 170 }}
              />
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Button title="Colar do chat" icon="clipboard-arrow-down-outline" variant="outline" small onPress={colarLegenda} style={{ flex: 1 }} />
                <Button title="Próximo: postar" icon="arrow-right" variant="dark" small onPress={() => setEtapa('postar')} style={{ flex: 1 }} />
              </View>
            </>
          )}

          {/* ===== 3. Postar ===== */}
          {etapa === 'postar' && (
            <>
              <Passo n={1} feito={!!pasta.salvoGaleria} titulo="Salvar fotos na galeria" sub="Cria um álbum com as fotos na ordem certa" acao="Salvar" onPress={salvarGaleria} disabled={ocupado} />
              <Passo n={2} titulo="Copiar a legenda" sub={temLegenda ? 'Para colar no Instagram' : 'Ainda sem legenda'} acao="Copiar" onPress={copiarLegenda} />
              <Passo n={3} titulo="Postar no Instagram" sub="Escolha as fotos do álbum e cole a legenda" acao="Abrir" onPress={abrirInstagram} />
              {ocupado && <ActivityIndicator color={C.lime} style={{ marginVertical: 10 }} />}

              <View style={{ marginTop: 16, gap: 8 }}>
                {pasta.status === 'postado' ? (
                  <Button title="Voltar para A fazer" icon="undo" variant="dark" onPress={() => mudarStatus('rascunho')} />
                ) : (
                  <>
                    <Button title="Marcar como postado" icon="send-check-outline" onPress={() => mudarStatus('postado')} />
                    {pasta.status !== 'pronto' && <Button title="Ainda não, marcar como pronto" icon="check-circle-outline" variant="outline" onPress={() => mudarStatus('pronto')} />}
                  </>
                )}
              </View>
            </>
          )}
        </ScrollView>
      </View>

      <Visualizador
        fotos={fotos}
        inicio={verFoto}
        capaId={capa?.id}
        onClose={() => setVerFoto(null)}
        onChat={(foto) => setIa({ foto })}
        onCompartilhar={(foto) => compartilhar(foto)}
        onCapa={(foto) => mudar((p) => ({ ...p, capaId: foto.id }))}
        onExcluir={excluirFoto}
      />

      <UsarPrompt visible={!!ia} onClose={() => setIa(null)} tipo={pasta.tipo} foto={ia?.foto} />

      <Sheet
        visible={!!editar}
        title="Editar pasta"
        onClose={() => setEditar(null)}
        footer={
          <>
            <Button icon="delete-outline" variant="danger" small onPress={excluirPasta} style={{ width: 52 }} />
            <Button title="Cancelar" variant="dark" onPress={() => setEditar(null)} style={{ flex: 1 }} />
            <Button
              title="Salvar"
              icon="check"
              onPress={() => {
                mudar((p) => ({ ...p, nome: editar.nome.trim() || p.nome, tipo: editar.tipo }));
                setEditar(null);
              }}
              style={{ flex: 1.2 }}
            />
          </>
        }
      >
        {editar && (
          <>
            <Field label="Nome" icon="folder-outline" value={editar.nome} onChangeText={(nome) => setEditar({ ...editar, nome })} />
            <Text style={s.label}>Tipo de post</Text>
            <View style={s.tipos}>
              {TIPOS.map((t) => (
                <ActionTile key={t.id} icon={t.icon} label={t.label} color={C.lime} active={editar.tipo === t.id} onPress={() => setEditar({ ...editar, tipo: t.id })} />
              ))}
            </View>
          </>
        )}
      </Sheet>
    </Modal>
  );
}

function Passo({ n, titulo, sub, acao, onPress, feito, disabled }) {
  return (
    <View style={[s.passo, feito && { borderColor: 'rgba(196,220,30,0.35)' }]}>
      <View style={[s.passoN, feito && { backgroundColor: C.lime }]}>
        {feito ? <Icon name="check-bold" size={16} color={C.onLime} /> : <Text style={s.passoNTxt}>{n}</Text>}
      </View>
      <View style={{ flex: 1 }}>
        <T v="title" style={{ fontSize: 15 }}>
          {titulo}
        </T>
        <T v="small">{sub}</T>
      </View>
      <Button title={acao} small variant="outline" onPress={onPress} disabled={disabled} />
    </View>
  );
}

const s = StyleSheet.create({
  header: { backgroundColor: '#111111', flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingBottom: 12 },
  voltar: { width: 40, height: 40, borderRadius: 12, backgroundColor: C.lime, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  icone: { width: 40, height: 40, borderRadius: 20, backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  marca: { fontFamily: F.display, color: C.lime, fontSize: 15, letterSpacing: 2.5, marginTop: 10 },
  titulo: { fontFamily: F.display, color: C.text, fontSize: 30, letterSpacing: 1, marginTop: -4 },
  faixa: { height: 4, backgroundColor: C.lime },

  vazio: { alignItems: 'center', backgroundColor: C.surface, borderRadius: 20, padding: 24, borderWidth: 1, borderColor: C.border, borderStyle: 'dashed', gap: 6 },
  vazioTit: { fontFamily: F.display, fontSize: 26, color: C.text, letterSpacing: 1, marginTop: 6 },
  barra: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  mini: { width: 40, height: 40, borderRadius: 12, backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center' },
  miniTxt: { fontFamily: F.bold, fontSize: 13, color: C.onLime },
  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  cel: { aspectRatio: 4 / 5, borderRadius: 12, overflow: 'hidden', backgroundColor: C.surface2 },
  thumb: { width: '100%', height: '100%' },
  num: { position: 'absolute', left: 6, top: 6, minWidth: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(0,0,0,0.65)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  numTxt: { fontFamily: F.bold, fontSize: 11.5, color: C.text },
  capaTag: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: C.lime, paddingVertical: 2, alignItems: 'center' },
  capaTxt: { fontFamily: F.display, fontSize: 13, color: C.onLime, letterSpacing: 2 },
  setas: { position: 'absolute', left: 0, right: 0, bottom: 6, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 6 },
  seta: { width: 34, height: 34, borderRadius: 17, backgroundColor: C.lime, alignItems: 'center', justifyContent: 'center' },

  ia: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#171A0C', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: 'rgba(196,220,30,0.35)', marginBottom: 18 },
  robo: { width: 44, height: 44, borderRadius: 12, backgroundColor: C.lime, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-8deg' }] },

  passo: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.surface, borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: C.border },
  passoN: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: C.lime, alignItems: 'center', justifyContent: 'center' },
  passoNTxt: { fontFamily: F.display, fontSize: 18, color: C.lime },

  label: { fontFamily: F.bold, fontSize: 11.5, color: C.muted, marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase' },
  tipos: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
