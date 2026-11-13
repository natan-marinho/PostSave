import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { Button, Empty, Field, Icon, SectionTitle, Sheet, T } from '../components';
import { STATUS, useData } from '../data';
import { apagarArquivos, compartilhar, escolherDaGaleria, exportarParaGaleria, tirarFoto } from '../fotos';
import { C, F } from '../theme';
import EscolherPrompt from './EscolherPrompt';
import Visualizador from './Visualizador';

/** Uma pasta aberta: fotos, legenda, status e envio para o chat de IA. */
export default function PastaScreen({ pastaId, onClose }) {
  const { pastas, setPastas, mudarPasta, chat, abrirChat, copiarPrompt } = useData();
  const pasta = pastas.find((p) => p.id === pastaId);
  const [verFoto, setVerFoto] = useState(null); // índice da foto aberta
  const [escolher, setEscolher] = useState(null); // { foto } aguardando o prompt
  const [renomear, setRenomear] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const lado = Math.floor((useWindowDimensions().width - 32 - 12) / 3);

  if (!pasta) return null;
  const fotos = pasta.fotos || [];
  const capaId = pasta.capaId || fotos[0]?.id;

  const mudar = (fn) => mudarPasta(pasta.id, fn);

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
    Alert.alert('Excluir foto?', 'Ela sai desta pasta. A foto original na galeria não é apagada.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => {
          apagarArquivos([foto]);
          mudar((p) => ({ ...p, fotos: p.fotos.filter((f) => f.id !== foto.id), capaId: p.capaId === foto.id ? null : p.capaId }));
          if (fotos.length <= 1) setVerFoto(null);
        },
      },
    ]);

  const mover = (foto, dir) =>
    mudar((p) => {
      const l = [...p.fotos];
      const a = l.findIndex((f) => f.id === foto.id);
      const b = a + dir;
      if (a < 0 || b < 0 || b >= l.length) return p;
      [l[a], l[b]] = [l[b], l[a]];
      return { ...p, fotos: l };
    });

  const excluirPasta = () =>
    Alert.alert('Excluir pasta?', `"${pasta.nome}" e as ${fotos.length} foto(s) dela saem do app. As fotos da galeria não são apagadas.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => {
          apagarArquivos(fotos);
          onClose();
          setPastas((l) => l.filter((p) => p.id !== pasta.id));
        },
      },
    ]);

  const exportar = async () => {
    if (!fotos.length) return Alert.alert('Pasta vazia', 'Adicione fotos primeiro.');
    setOcupado(true);
    try {
      const album = await exportarParaGaleria(fotos, pasta.nome);
      if (album) Alert.alert('Salvo na galeria', `As fotos estão no álbum "${album}", na ordem desta pasta. Agora é só postar.`);
    } catch (e) {
      Alert.alert('Não deu para salvar', String(e?.message || e));
    } finally {
      setOcupado(false);
    }
  };

  /** Prompt escolhido: copia e manda a foto (ou só abre o chat). */
  const usarPrompt = async (prompt) => {
    const foto = escolher?.foto;
    setEscolher(null);
    await copiarPrompt(prompt, { perguntar: false });
    if (!foto) {
      Alert.alert('Prompt copiado', `No ${chat.label}, segure no campo de mensagem e toque em Colar.`, [
        { text: 'OK' },
        { text: `Abrir ${chat.label}`, onPress: abrirChat },
      ]);
      return;
    }
    Alert.alert(
      'Prompt copiado',
      `Na próxima tela escolha o ${chat.label}. Quando a foto aparecer no chat, segure no campo de mensagem e toque em Colar.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Continuar', onPress: () => compartilhar(foto, `Enviar para o ${chat.label}`) },
      ]
    );
  };

  const copiarLegenda = async () => {
    if (!pasta.legenda?.trim()) return Alert.alert('Sem legenda', 'Escreva ou cole a legenda primeiro.');
    await Clipboard.setStringAsync(pasta.legenda);
    Alert.alert('Legenda copiada', 'Cole no Instagram na hora de postar.');
  };

  const colarLegenda = async () => {
    const txt = await Clipboard.getStringAsync();
    if (!txt) return Alert.alert('Nada copiado', `No ${chat.label}, segure a resposta e toque em Copiar. Depois volte aqui.`);
    mudar((p) => ({ ...p, legenda: p.legenda ? p.legenda + '\n\n' + txt : txt }));
  };

  return (
    <Modal visible animationType="slide" onRequestClose={onClose} statusBarTranslucent navigationBarTranslucent>
      <View style={{ flex: 1, backgroundColor: C.bg }}>
        <SafeAreaView edges={['top']} style={s.header}>
          <Pressable onPress={onClose} hitSlop={12} style={s.voltar}>
            <Icon name="arrow-left" size={22} color={C.onLime} />
          </Pressable>
          <Pressable style={{ flex: 1 }} onPress={() => setRenomear(pasta.nome)}>
            <Text style={s.marca}>
              PASTA · {fotos.length} FOTO{fotos.length === 1 ? '' : 'S'}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={s.titulo} numberOfLines={1}>
                {pasta.nome}
              </Text>
              <Icon name="pencil-outline" size={16} color={C.muted} />
            </View>
          </Pressable>
        </SafeAreaView>
        <View style={s.faixa} />

        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
          {/* Status */}
          <View style={s.status}>
            {STATUS.map((st) => {
              const on = (pasta.status || 'rascunho') === st.id;
              return (
                <Pressable
                  key={st.id}
                  onPress={() => mudar((p) => ({ ...p, status: st.id, postadoEm: st.id === 'postado' ? new Date().toISOString() : null }))}
                  style={[s.stBtn, on && { backgroundColor: st.cor }]}
                >
                  <Icon name={st.icon} size={16} color={on ? C.onLime : st.cor} />
                  <Text style={[s.stTxt, on && { color: C.onLime }]}>{st.label}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* Fotos */}
          <SectionTitle icon="image-multiple-outline">Fotos</SectionTitle>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
            <Button title="Galeria" icon="image-plus" small onPress={() => adicionar('galeria')} style={{ flex: 1 }} disabled={ocupado} />
            <Button title="Câmera" icon="camera-outline" variant="outline" small onPress={() => adicionar('camera')} style={{ flex: 1 }} disabled={ocupado} />
          </View>
          {ocupado && <ActivityIndicator color={C.lime} style={{ marginBottom: 12 }} />}
          {!fotos.length ? (
            <Empty icon="image-plus">Suba as fotos deste post. Elas ficam guardadas dentro do app, na ordem que você escolher.</Empty>
          ) : (
            <View style={s.grade}>
              {fotos.map((f, n) => (
                <Pressable key={f.id} onPress={() => setVerFoto(n)} onLongPress={() => excluirFoto(f)} delayLongPress={450} style={[s.cel, { width: lado }]}>
                  <Image source={{ uri: f.uri }} style={s.thumb} resizeMethod="resize" />
                  <View style={s.num}>
                    <Text style={s.numTxt}>{n + 1}</Text>
                  </View>
                  {f.id === capaId && (
                    <View style={s.estrela}>
                      <Icon name="star" size={13} color={C.onLime} />
                    </View>
                  )}
                </Pressable>
              ))}
            </View>
          )}
          {fotos.length > 0 && <T v="small" style={{ marginTop: 6 }}>Toque numa foto para enviar ao chat, compartilhar ou mudar a ordem.</T>}

          {/* IA */}
          <View style={s.ia}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={s.robo}>
                <Icon name="robot-happy-outline" size={24} color={C.onLime} />
              </View>
              <View style={{ flex: 1 }}>
                <T v="title">Criar com IA</T>
                <T v="small">Copia o prompt e manda a capa para o {chat.label}.</T>
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
              <Button
                title="Foto + prompt"
                icon="image-move"
                small
                disabled={!fotos.length}
                onPress={() => setEscolher({ foto: fotos.find((f) => f.id === capaId) })}
                style={{ flex: 1 }}
              />
              <Button title="Só prompt" icon="content-copy" variant="outline" small onPress={() => setEscolher({ foto: null })} style={{ flex: 1 }} />
            </View>
          </View>

          {/* Legenda */}
          <SectionTitle icon="text-short">Legenda</SectionTitle>
          <Field
            value={pasta.legenda || ''}
            onChangeText={(legenda) => mudar((p) => ({ ...p, legenda }))}
            placeholder="Escreva a legenda ou cole a resposta do chat"
            multiline
            textAlignVertical="top"
            style={{ minHeight: 130 }}
          />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button title="Colar do chat" icon="clipboard-text-outline" variant="dark" small onPress={colarLegenda} style={{ flex: 1 }} />
            <Button title="Copiar legenda" icon="content-copy" small onPress={copiarLegenda} style={{ flex: 1 }} />
          </View>

          {/* Postar */}
          <SectionTitle icon="send-outline">Na hora de postar</SectionTitle>
          <Button title="Salvar fotos na galeria" icon="download" variant="outline" onPress={exportar} disabled={ocupado} />
          <T v="small" style={{ marginTop: 8, marginBottom: 18 }}>
            Cria o álbum "PostSave {pasta.nome}" na galeria, com as fotos na ordem certa para o carrossel.
          </T>
          <Button title="Excluir pasta" icon="delete-outline" variant="danger" small onPress={excluirPasta} />
        </ScrollView>
      </View>

      <Visualizador
        fotos={fotos}
        inicio={verFoto}
        capaId={capaId}
        onClose={() => setVerFoto(null)}
        onChat={(foto) => setEscolher({ foto })}
        onCompartilhar={(foto) => compartilhar(foto)}
        onCapa={(foto) => mudar((p) => ({ ...p, capaId: foto.id }))}
        onMover={mover}
        onExcluir={excluirFoto}
      />

      <EscolherPrompt
        visible={!!escolher}
        onClose={() => setEscolher(null)}
        onEscolher={usarPrompt}
        subtitulo={escolher?.foto ? `Copia o prompt e envia a foto para o ${chat.label}` : undefined}
      />

      <Sheet
        visible={renomear != null}
        title="Renomear pasta"
        onClose={() => setRenomear(null)}
        footer={
          <>
            <Button title="Cancelar" variant="dark" onPress={() => setRenomear(null)} style={{ flex: 1 }} />
            <Button
              title="Salvar"
              icon="check"
              onPress={() => {
                if (!renomear.trim()) return;
                mudar((p) => ({ ...p, nome: renomear.trim() }));
                setRenomear(null);
              }}
              style={{ flex: 1.4 }}
            />
          </>
        }
      >
        <Field label="Nome" icon="folder-outline" value={renomear || ''} onChangeText={setRenomear} autoFocus />
      </Sheet>
    </Modal>
  );
}

const s = StyleSheet.create({
  header: { backgroundColor: '#111111', flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingBottom: 12 },
  voltar: { width: 40, height: 40, borderRadius: 12, backgroundColor: C.lime, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  marca: { fontFamily: F.display, color: C.lime, fontSize: 15, letterSpacing: 3, marginTop: 10 },
  titulo: { fontFamily: F.display, color: C.text, fontSize: 30, letterSpacing: 1, marginTop: -4, flexShrink: 1 },
  faixa: { height: 4, backgroundColor: C.lime },
  status: { flexDirection: 'row', gap: 8, backgroundColor: C.surface, padding: 5, borderRadius: 14, borderWidth: 1, borderColor: C.border },
  stBtn: { flex: 1, flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10 },
  stTxt: { fontFamily: F.bold, fontSize: 13, color: C.text },
  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  cel: { aspectRatio: 4 / 5, borderRadius: 12, overflow: 'hidden', backgroundColor: C.surface2 },
  thumb: { width: '100%', height: '100%' },
  num: { position: 'absolute', left: 6, top: 6, minWidth: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(0,0,0,0.65)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  numTxt: { fontFamily: F.bold, fontSize: 11.5, color: C.text },
  estrela: { position: 'absolute', right: 6, top: 6, width: 22, height: 22, borderRadius: 11, backgroundColor: C.lime, alignItems: 'center', justifyContent: 'center' },
  ia: { marginTop: 18, backgroundColor: '#171A0C', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: 'rgba(196,220,30,0.35)' },
  robo: { width: 44, height: 44, borderRadius: 12, backgroundColor: C.lime, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-8deg' }] },
});
