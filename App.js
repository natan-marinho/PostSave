import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import {
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  Montserrat_800ExtraBold,
} from '@expo-google-fonts/montserrat';
import { Icon } from './src/components';
import { DataProvider, useData } from './src/data';
import PostsScreen from './src/posts/PostsScreen';
import PromptsScreen from './src/prompts/PromptsScreen';
import { C, F } from './src/theme';

const TELAS = [
  { id: 'posts', label: 'Posts', titulo: 'Pastas de posts', icon: 'folder-image', Tela: PostsScreen },
  { id: 'prompts', label: 'Prompts', titulo: 'Prompts de IA', icon: 'robot-happy-outline', Tela: PromptsScreen },
];

export default function App() {
  const [fontes] = useFonts({
    BebasNeue_400Regular,
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Montserrat_800ExtraBold,
  });

  if (!fontes) return <Carregando />;

  return (
    <SafeAreaProvider>
      <DataProvider>
        <StatusBar style="light" />
        <Conteudo />
      </DataProvider>
    </SafeAreaProvider>
  );
}

const Carregando = () => (
  <View style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }}>
    <ActivityIndicator color={C.lime} size="large" />
  </View>
);

function Conteudo() {
  const { pronto } = useData();
  const [tela, setTela] = useState('posts');
  const atual = TELAS.find((t) => t.id === tela);
  const Tela = atual.Tela;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <SafeAreaView edges={['top']} style={st.header}>
        <View style={st.headerRow}>
          <View style={st.logo}>
            <Icon name="content-save-outline" size={21} color={C.onLime} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={st.marca}>
              POST <Text style={{ color: C.lime }}>SAVE</Text>
            </Text>
            <Text style={st.titulo}>{atual.titulo}</Text>
          </View>
        </View>
      </SafeAreaView>
      <View style={st.faixa} />

      <View style={{ flex: 1 }}>{pronto ? <Tela key={tela} /> : <Carregando />}</View>

      <SafeAreaView edges={['bottom']} style={st.menu}>
        {TELAS.map((t) => {
          const on = t.id === tela;
          return (
            <Pressable key={t.id} onPress={() => setTela(t.id)} style={st.menuItem}>
              <View style={[st.menuIcon, on && st.menuIconOn]}>
                <Icon name={t.icon} size={22} color={on ? C.onLime : C.muted} />
              </View>
              <Text style={[st.menuTxt, on && st.menuTxtOn]} numberOfLines={1}>
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </SafeAreaView>
    </View>
  );
}

const st = StyleSheet.create({
  header: { backgroundColor: '#111111' },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 12 },
  logo: { width: 40, height: 40, borderRadius: 12, backgroundColor: C.lime, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-8deg' }] },
  marca: { fontFamily: F.display, color: C.text, fontSize: 15, letterSpacing: 3 },
  titulo: { fontFamily: F.display, color: C.text, fontSize: 30, letterSpacing: 1, marginTop: -4 },
  faixa: { height: 4, backgroundColor: C.lime },
  menu: { flexDirection: 'row', backgroundColor: '#111111', borderTopWidth: 1, borderTopColor: C.border, paddingTop: 6, paddingHorizontal: 4 },
  menuItem: { flex: 1, alignItems: 'center', paddingBottom: 6 },
  menuIcon: { width: 64, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  menuIconOn: { backgroundColor: C.lime },
  menuTxt: { fontFamily: F.semi, fontSize: 11.5, color: C.muted, marginTop: 3 },
  menuTxtOn: { color: C.lime, fontFamily: F.bold },
});
