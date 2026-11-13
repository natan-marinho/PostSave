import React, { useEffect, useRef, useState } from 'react';
import { FlatList, Image, Modal, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../components';
import { C, F } from '../theme';

/** Fotos em tela cheia, deslizando para os lados, com as ações embaixo. */
export default function Visualizador({ fotos, inicio, capaId, onClose, onChat, onCompartilhar, onCapa, onMover, onExcluir }) {
  const { width } = useWindowDimensions();
  const [i, setI] = useState(inicio || 0);
  const lista = useRef(null);
  const visivel = inicio != null && fotos.length > 0;

  useEffect(() => {
    if (inicio != null) setI(inicio);
  }, [inicio]);

  // Se a foto atual foi excluída, volta para uma que existe.
  const idx = Math.min(i, fotos.length - 1);
  const foto = fotos[idx];

  const irPara = (n) => {
    setI(n);
    lista.current?.scrollToIndex({ index: n, animated: false });
  };

  return (
    <Modal visible={visivel} animationType="fade" onRequestClose={onClose} statusBarTranslucent navigationBarTranslucent>
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        <SafeAreaView edges={['top']} style={s.topo}>
          <Pressable onPress={onClose} hitSlop={12} style={s.redondo}>
            <Icon name="arrow-left" size={22} color={C.text} />
          </Pressable>
          <Text style={s.contador}>
            {idx + 1} / {fotos.length}
          </Text>
          {foto && foto.id === capaId ? (
            <View style={s.capa}>
              <Icon name="star" size={14} color={C.onLime} />
              <Text style={s.capaTxt}>Capa</Text>
            </View>
          ) : (
            <View style={{ width: 40 }} />
          )}
        </SafeAreaView>

        {visivel && (
          <FlatList
            ref={lista}
            data={fotos}
            keyExtractor={(f) => f.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={Math.min(inicio, fotos.length - 1)}
            getItemLayout={(_, n) => ({ length: width, offset: width * n, index: n })}
            onMomentumScrollEnd={(e) => setI(Math.round(e.nativeEvent.contentOffset.x / width))}
            renderItem={({ item }) => (
              <View style={{ width, flex: 1, justifyContent: 'center' }}>
                <Image source={{ uri: item.uri }} style={{ width, height: '100%' }} resizeMode="contain" />
              </View>
            )}
          />
        )}

        {foto && (
          <SafeAreaView edges={['bottom']} style={s.base}>
            <Pressable onPress={() => onChat(foto)} style={({ pressed }) => [s.chatBtn, pressed && { opacity: 0.8 }]}>
              <Icon name="robot-happy-outline" size={22} color={C.onLime} />
              <Text style={s.chatTxt}>Enviar ao chat com prompt</Text>
            </Pressable>
            <View style={s.acoes}>
              <Acao icon="share-variant" label="Compartilhar" onPress={() => onCompartilhar(foto)} />
              <Acao icon="star-outline" label="Capa" onPress={() => onCapa(foto)} disabled={foto.id === capaId} />
              <Acao
                icon="chevron-left"
                label="Mover"
                disabled={idx === 0}
                onPress={() => {
                  onMover(foto, -1);
                  irPara(idx - 1);
                }}
              />
              <Acao
                icon="chevron-right"
                label="Mover"
                disabled={idx === fotos.length - 1}
                onPress={() => {
                  onMover(foto, 1);
                  irPara(idx + 1);
                }}
              />
              <Acao icon="delete-outline" label="Excluir" cor={C.danger} onPress={() => onExcluir(foto)} />
            </View>
          </SafeAreaView>
        )}
      </View>
    </Modal>
  );
}

function Acao({ icon, label, onPress, cor = C.text, disabled }) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={({ pressed }) => [s.acao, (pressed || disabled) && { opacity: 0.35 }]}>
      <Icon name={icon} size={24} color={cor} />
      <Text style={[s.acaoTxt, { color: cor }]}>{label}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  topo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingBottom: 8,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  redondo: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  contador: { fontFamily: F.display, fontSize: 22, color: C.text, letterSpacing: 1, marginTop: 8 },
  capa: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: C.lime, borderRadius: 10, paddingHorizontal: 9, paddingVertical: 5, marginTop: 8 },
  capaTxt: { fontFamily: F.bold, fontSize: 12, color: C.onLime },
  base: { backgroundColor: '#0E0E0E', borderTopWidth: 3, borderTopColor: C.lime, paddingTop: 14, paddingHorizontal: 14 },
  chatBtn: { flexDirection: 'row', gap: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: C.lime, borderRadius: 14, paddingVertical: 14 },
  chatTxt: { fontFamily: F.bold, fontSize: 15.5, color: C.onLime },
  acoes: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 10 },
  acao: { alignItems: 'center', gap: 3, minWidth: 58, paddingVertical: 4 },
  acaoTxt: { fontFamily: F.semi, fontSize: 11 },
});
