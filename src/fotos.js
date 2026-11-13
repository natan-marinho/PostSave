import { Alert } from 'react-native';
import { Directory, File, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import { Album, Asset, requestPermissionsAsync } from 'expo-media-library';
import { uid } from './date';

/*
As fotos escolhidas são copiadas para a pasta interna do app (Documentos/fotos).
Assim elas continuam no PostSave mesmo se forem apagadas da galeria.
*/

const pastaFotos = () => {
  const dir = new Directory(Paths.document, 'fotos');
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
  return dir;
};

const extensao = (uri) => {
  const m = /\.(jpe?g|png|webp|heic|gif)(\?|$)/i.exec(uri || '');
  return m ? m[1].toLowerCase().replace('jpeg', 'jpg') : 'jpg';
};

function guardar(assets) {
  const dir = pastaFotos();
  const agora = new Date().toISOString();
  const fotos = [];
  for (const a of assets) {
    try {
      const id = uid();
      const destino = new File(dir, `${id}.${extensao(a.fileName || a.uri)}`);
      new File(a.uri).copySync(destino);
      fotos.push({ id, uri: destino.uri, largura: a.width || 0, altura: a.height || 0, criadaEm: agora });
    } catch (e) {
      // Uma foto com problema não impede as outras.
    }
  }
  if (assets.length && !fotos.length) Alert.alert('Não deu para salvar', 'Tente escolher as fotos de novo.');
  return fotos;
}

/** Abre a galeria (várias fotos de uma vez). Retorna as fotos já salvas no app. */
export async function escolherDaGaleria() {
  const r = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: true,
    orderedSelection: true,
    selectionLimit: 20,
    quality: 1,
  });
  if (r.canceled) return [];
  return guardar(r.assets);
}

/** Tira uma foto com a câmera. */
export async function tirarFoto() {
  const perm = await ImagePicker.requestCameraPermissionsAsync();
  if (!perm.granted) {
    Alert.alert('Sem acesso à câmera', 'Libere a câmera para o PostSave nas configurações do Android.');
    return [];
  }
  const r = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 1 });
  if (r.canceled) return [];
  return guardar(r.assets);
}

export function apagarArquivos(fotos) {
  for (const f of fotos || []) {
    try {
      const arq = new File(f.uri);
      if (arq.exists) arq.delete();
    } catch (e) {}
  }
}

const mime = (uri) => {
  const ext = extensao(uri);
  return ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
};

/** Abre a lista de apps do Android (ChatGPT, Instagram, WhatsApp...) com a foto. */
export async function compartilhar(foto, titulo = 'Enviar foto para...') {
  if (!(await Sharing.isAvailableAsync())) return Alert.alert('Indisponível', 'Este aparelho não permite compartilhar arquivos.');
  try {
    await Sharing.shareAsync(foto.uri, { mimeType: mime(foto.uri), dialogTitle: titulo });
  } catch (e) {
    Alert.alert('Não deu para compartilhar', 'Tente de novo.');
  }
}

const nomeAlbum = (nome) =>
  ('PostSave ' + (nome || ''))
    .replace(/[\\/:*?"<>|]/g, '')
    .trim()
    .slice(0, 60);

/** Salva as fotos na galeria do celular, num álbum com o nome da pasta. Retorna o nome do álbum. */
export async function exportarParaGaleria(fotos, nomePasta) {
  const perm = await requestPermissionsAsync(false, ['photo']);
  if (!perm.granted) {
    Alert.alert('Sem acesso à galeria', 'Libere o acesso às fotos para o PostSave nas configurações do Android.');
    return null;
  }
  const titulo = nomeAlbum(nomePasta);
  const criados = [];
  for (const f of fotos) criados.push(await Asset.create(f.uri));
  const album = await Album.get(titulo);
  if (album) await album.add(criados);
  else await Album.create(titulo, criados, true);
  return titulo;
}
