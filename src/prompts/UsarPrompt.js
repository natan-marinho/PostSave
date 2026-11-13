import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Button, Field, Icon, Sheet, T } from '../components';
import { camposDe, exemploCampo, montarPrompt, rotuloCampo, useData } from '../data';
import { compartilhar } from '../fotos';
import { C, F } from '../theme';
import { catDe, tipoDe } from './padrao';

/**
 * Usar um prompt em 2 passos: escolher (se `prompt` não vier pronto) e preencher os campos.
 * Com `foto`, depois de copiar abre a lista de apps para mandar a foto ao chat.
 * `rodape` são botões extras à esquerda (editar/excluir na aba Prompts).
 */
export default function UsarPrompt({ visible, onClose, prompt: fixo, tipo, foto, categoria, rodape }) {
  const { prompts, perfil, perfilIncompleto, chat, abrirChat, copiarPrompt } = useData();
  const [escolhido, setEscolhido] = useState(null);
  const [valores, setValores] = useState({});
  const [verTexto, setVerTexto] = useState(false);

  const prompt = fixo || escolhido;

  useEffect(() => {
    if (!visible) {
      setEscolhido(null);
      setVerTexto(false);
    }
  }, [visible]);

  useEffect(() => {
    if (prompt) setValores(prompt.ultimos || {});
  }, [prompt?.id]);

  const { sugeridos, outros } = useMemo(() => {
    const base = categoria ? prompts.filter((p) => p.categoria === categoria) : prompts;
    const ord = [...base].sort((a, b) => (b.usos || 0) - (a.usos || 0));
    const sug = tipo ? ord.filter((p) => (p.tipos || []).includes(tipo)) : [];
    return { sugeridos: sug, outros: ord.filter((p) => !sug.includes(p)) };
  }, [prompts, tipo, categoria]);

  const campos = prompt ? camposDe(prompt.texto) : [];

  const usar = async () => {
    await copiarPrompt(prompt, valores);
    onClose();
    if (!foto) return abrirChat();
    Alert.alert(
      'Prompt copiado',
      `Na próxima tela, escolha o ${chat.label}.\nQuando a foto aparecer no chat, segure no campo de mensagem e toque em Colar.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Continuar', onPress: () => compartilhar(foto, `Enviar para o ${chat.label}`) },
      ]
    );
  };

  // Passo 1: escolher o prompt
  if (!prompt) {
    return (
      <Sheet visible={visible} title="Escolha o prompt" subtitle={foto ? 'A foto vai junto para o chat' : `Será copiado para o ${chat.label}`} onClose={onClose}>
        {sugeridos.length > 0 && (
          <>
            <T v="label" style={s.grupo}>
              Para {tipoDe(tipo).label.toLowerCase()}
            </T>
            {sugeridos.map((p) => (
              <Linha key={p.id} p={p} destaque onPress={() => setEscolhido(p)} />
            ))}
            <T v="label" style={[s.grupo, { marginTop: 14 }]}>
              Outros
            </T>
          </>
        )}
        {outros.map((p) => (
          <Linha key={p.id} p={p} onPress={() => setEscolhido(p)} />
        ))}
      </Sheet>
    );
  }

  // Passo 2: preencher e usar
  return (
    <Sheet
      visible={visible}
      title={prompt.titulo}
      subtitle={prompt.descricao || catDe(prompt.categoria).label}
      onClose={onClose}
      footer={
        <>
          {!fixo && <Button icon="arrow-left" variant="dark" small onPress={() => setEscolhido(null)} style={{ width: 52 }} />}
          {rodape}
          <Button title={foto ? 'Copiar e enviar foto' : `Copiar e abrir ${chat.label}`} icon={foto ? 'image-move' : 'open-in-new'} onPress={usar} style={{ flex: 1 }} />
        </>
      }
    >
      {campos.length > 0 ? (
        <>
          <T v="small" style={{ marginBottom: 14 }}>
            Preencha o que souber. O que ficar em branco a IA trata como "não informado".
          </T>
          {campos.map((c) => (
            <Field
              key={c}
              label={rotuloCampo(c)}
              value={valores[c] || ''}
              onChangeText={(v) => setValores((x) => ({ ...x, [c]: v }))}
              placeholder={exemploCampo(c) ? `Ex.: ${exemploCampo(c)}` : ''}
              multiline={/coment|pergunta|preços|fotos que/i.test(c)}
            />
          ))}
        </>
      ) : (
        <View style={s.pronto}>
          <Icon name="check-circle-outline" size={20} color={C.lime} />
          <T v="semi" style={{ flex: 1, fontSize: 14 }}>
            Não precisa preencher nada. É só copiar.
          </T>
        </View>
      )}

      {perfilIncompleto && (
        <View style={s.dica}>
          <Icon name="cog-outline" size={18} color={C.warn} />
          <Text style={s.dicaTxt}>Complete o perfil da barbearia na engrenagem do topo. Assim a IA já sabe o bairro, o WhatsApp e o jeito de falar.</Text>
        </View>
      )}

      <Pressable onPress={() => setVerTexto(!verTexto)} style={s.ver}>
        <Icon name={verTexto ? 'chevron-up' : 'chevron-down'} size={20} color={C.muted} />
        <Text style={s.verTxt}>{verTexto ? 'Esconder o prompt completo' : 'Ver o prompt completo'}</Text>
      </Pressable>
      {verTexto && (
        <Text selectable style={s.texto}>
          {montarPrompt(prompt, valores, perfil)}
        </Text>
      )}
    </Sheet>
  );
}

function Linha({ p, onPress, destaque }) {
  const c = catDe(p.categoria);
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [s.item, destaque && s.itemOn, pressed && { opacity: 0.7 }]}>
      <View style={s.ico}>
        <Icon name={c.icon} size={20} color={C.lime} />
      </View>
      <View style={{ flex: 1 }}>
        <T v="title" numberOfLines={1} style={{ fontSize: 15 }}>
          {p.titulo}
        </T>
        <Text style={s.desc} numberOfLines={1}>
          {p.descricao || c.label}
        </Text>
      </View>
      <Icon name="chevron-right" size={22} color={C.faint} />
    </Pressable>
  );
}

const s = StyleSheet.create({
  grupo: { marginBottom: 8 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.surface, borderRadius: 14, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: C.border },
  itemOn: { borderColor: 'rgba(196,220,30,0.35)', backgroundColor: '#171A0C' },
  ico: { width: 38, height: 38, borderRadius: 11, backgroundColor: C.limeSoft, alignItems: 'center', justifyContent: 'center' },
  desc: { fontFamily: F.medium, fontSize: 12.5, color: C.muted, marginTop: 1 },
  pronto: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.surface, borderRadius: 12, padding: 14 },
  dica: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', backgroundColor: C.warnSoft, borderRadius: 12, padding: 12, marginTop: 4 },
  dicaTxt: { flex: 1, fontFamily: F.medium, fontSize: 12.5, color: C.text, lineHeight: 18 },
  ver: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 14 },
  verTxt: { fontFamily: F.semi, fontSize: 13.5, color: C.muted },
  texto: { fontFamily: F.regular, fontSize: 13, color: C.text, lineHeight: 20, backgroundColor: C.surface, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: C.border },
});
