# PostSave

App Android **nativo e open source** (React Native + Expo SDK 58) para organizar os posts das redes sociais em pastas
e guardar os prompts de IA usados para criar legendas e artes.

Sem servidor, sem login e sem anúncios: tudo fica salvo no próprio celular.
Tem a mesma identidade visual do app Clube Studio 8 (verde-limão #C4DC1E, preto #111111 e grafite,
títulos em Bebas Neue e textos em Montserrat).

> Projeto acadêmico, sem fins lucrativos.

## Telas

| Tela | O que faz |
|---|---|
| **Posts** | Uma pasta para cada post, com capa, status (Rascunho, Pronto, Postado) e filtro por status. Dentro da pasta: subir fotos da galeria ou da câmera, mudar a ordem do carrossel, escolher a capa, escrever ou colar a legenda, **enviar a foto com um prompt para o chat de IA** e salvar tudo num álbum da galeria na hora de postar. |
| **Prompts** | Biblioteca de prompts com categorias (Legenda, Imagem, Ideias, Outros), busca, contador de uso e os botões **Copiar** e **Abrir chat**. Já vem com 6 prompts prontos. Escolha o chat usado: ChatGPT, Gemini ou Claude. |

### Fluxo foto + prompt → chat

1. Abra a pasta e toque numa foto (ou use **Criar com IA → Foto + prompt**, que usa a capa).
2. Escolha o prompt. Ele é copiado.
3. A lista de compartilhamento do Android abre: escolha o ChatGPT (ou outro chat).
4. No chat, segure no campo de mensagem e toque em **Colar**.
5. Copie a resposta, volte ao PostSave e toque em **Colar do chat** na legenda.

## Estrutura

```
App.js                         cabeçalho da marca, barra inferior e fontes
src/data.js                    pastas, prompts e chat escolhido (contexto compartilhado)
src/fotos.js                   galeria, câmera, cópia para o app, compartilhar e salvar na galeria
src/posts/PostsScreen.js       grade de pastas
src/posts/PastaScreen.js       pasta aberta (fotos, IA, legenda, status)
src/posts/Visualizador.js      foto em tela cheia com as ações
src/posts/EscolherPrompt.js    lista para escolher o prompt
src/prompts/PromptsScreen.js
src/prompts/padrao.js          prompts que vêm no app, categorias e chats
src/theme.js · src/components.js · src/storage.js · src/date.js
plugins/withCmakeVersion.js    corrige o build no Windows (caminhos > 260 caracteres)
```

Chaves no AsyncStorage: `ps:pastas`, `ps:prompts`, `ps:chat`.
As fotos são copiadas para `Documentos/fotos` dentro do app, então continuam no PostSave mesmo se forem apagadas da galeria.

## Rodar e gerar o APK (local, sem conta Expo)

Requisitos: Node, JDK 17+ e Android SDK (`ANDROID_HOME`).

```bash
npm install
npx expo prebuild --platform android
cd android
./gradlew assembleRelease "-PreactNativeArchitectures=arm64-v8a,armeabi-v7a,x86_64"
```

O APK sai em `android/app/build/outputs/apk/release/app-release.apk`.
(O release usa a chave de debug, o que basta para instalar direto no celular, mas não para a Play Store.)

Alternativa na nuvem: `npx eas-cli@latest build -p android --profile preview`.

## Permissões

- **Fotos**: escolher as fotos (pelo seletor do Android) e salvar o álbum na galeria.
- **Câmera**: só quando você toca em "Câmera".

Nada é enviado para a internet pelo app. O chat de IA só recebe o que você mesmo compartilha.

## Checklist de testes

- [ ] Criar, renomear e excluir pasta; fechar o app e abrir de novo: tudo continua lá.
- [ ] Subir várias fotos da galeria e uma da câmera; mudar a ordem e a capa.
- [ ] Foto + prompt: o prompt é copiado e a lista de apps abre com o ChatGPT.
- [ ] "Colar do chat" e "Copiar legenda".
- [ ] "Salvar fotos na galeria" cria o álbum com as fotos na ordem certa.
- [ ] Criar, editar, buscar e excluir prompts; trocar o chat (ChatGPT, Gemini, Claude).

## Licença

[MIT](LICENSE). Pode usar, estudar, modificar e distribuir.
