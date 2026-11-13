# PostSave

App Android **nativo e open source** (React Native + Expo SDK 58) para a barbearia organizar os posts do Instagram em pastas
e criar legendas e artes com prompts de IA prontos para barbearia.

Sem servidor, sem login e sem anúncios: tudo fica salvo no próprio celular.
Tem a mesma identidade visual do app Clube Studio 8 (verde-limão #C4DC1E, preto #111111 e grafite,
títulos em Bebas Neue e textos em Montserrat).

> Projeto acadêmico, sem fins lucrativos.

## Telas

| Tela | O que faz |
|---|---|
| **Posts** | Pastas separadas em **A fazer**, **Prontos** e **Postados**. Cada pasta tem um tipo (Corte, Barba, Promoção, Equipe, Produto, Aviso) e é feita em 3 etapas: **1 Fotos** (galeria ou câmera, ordem do carrossel, capa), **2 Legenda** (criar com IA e colar a resposta) e **3 Postar** (salvar no álbum da galeria, copiar a legenda, abrir o Instagram e marcar como postado). |
| **Prompts** | 13 prompts prontos para barbearia, separados em Legendas, Fotos e artes, Ideias e Respostas. Cada prompt tem campos para preencher (ex.: nome do corte, preço, validade) e o app pergunta antes de copiar. Dá para criar os seus usando `{Campo}`. |
| **Ajustes** (engrenagem) | Perfil da barbearia (nome, bairro, Instagram, WhatsApp, público, tom de voz, diferenciais), que vai no começo de todo prompt, e o chat usado: ChatGPT, Gemini ou Claude. |

### Fluxo foto + prompt → chat

1. Na etapa **Legenda**, toque em **Criar legenda com IA** (ou abra uma foto e toque em **Mandar para o chat**).
2. Escolha o prompt. Os que combinam com o tipo do post aparecem primeiro.
3. Preencha os campos e toque em **Copiar e enviar foto**.
4. Na lista do Android, escolha o ChatGPT. Quando a foto aparecer, cole o prompt e envie.
5. Copie a resposta, volte ao PostSave e toque em **Colar do chat**.

## Estrutura

```
App.js                         cabeçalho da marca, barra inferior e fontes
src/data.js                    pastas, prompts, perfil da barbearia e chat (contexto compartilhado)
src/fotos.js                   galeria, câmera, cópia para o app, compartilhar e salvar na galeria
src/posts/PostsScreen.js       grade de pastas
src/posts/PastaScreen.js       pasta aberta em 3 etapas (fotos, legenda, postar)
src/posts/Visualizador.js      foto em tela cheia com as ações
src/prompts/PromptsScreen.js
src/prompts/UsarPrompt.js      escolher, preencher os campos e copiar o prompt
src/ajustes/Ajustes.js         perfil da barbearia e chat de IA
src/prompts/padrao.js          tipos de post, prompts de barbearia, perfil inicial e chats
src/theme.js · src/components.js · src/storage.js · src/date.js
plugins/withCmakeVersion.js    corrige o build no Windows (caminhos > 260 caracteres)
```

Chaves no AsyncStorage: `ps:pastas`, `ps:prompts:v2`, `ps:perfil`, `ps:chat`.
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
- [ ] Preencher o perfil da barbearia e conferir que ele aparece em "Ver o prompt completo".
- [ ] Usar um prompt com campos; criar um prompt próprio com `{Campo}`; trocar o chat nos Ajustes.

## Licença

[MIT](LICENSE). Pode usar, estudar, modificar e distribuir.
