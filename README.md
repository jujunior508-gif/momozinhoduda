# Site para GitHub Pages

Este é um site estático, sem etapa de compilação ou dependências externas. O arquivo `index.html` está na raiz do projeto para que o repositório possa ser publicado diretamente pelo GitHub Pages.

## Publicar pelo GitHub Pages

1. Crie um repositório no GitHub.
2. Envie todos os arquivos deste diretório para a raiz do repositório.
3. No GitHub, abra **Settings → Pages**.
4. Em **Build and deployment**, selecione **Deploy from a branch**.
5. Escolha a branch principal, normalmente `main`, e a pasta `/ (root)`.
6. Salve e aguarde a publicação do endereço exibido pelo GitHub.

O arquivo `.nojekyll` informa ao GitHub Pages que o projeto não precisa ser processado pelo Jekyll. Os caminhos dos arquivos são relativos, portanto o site funciona tanto em um repositório de projeto quanto em um domínio personalizado.

## Estrutura

- `index.html`: página principal.
- `style.css`: estilos originais.
- `script.js`: interações originais.
- `images/`: fotografias utilizadas pelo site.
- `.nojekyll`: configuração para publicação estática direta.
