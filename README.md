# Gastos PWA - Captura no Momento da Compra

App web instalavel no celular Android para registrar gastos no momento da compra.
Funciona offline; sincroniza com Google Drive quando ha internet.

## O que ele faz

1. Voce abre o app no celular logo apos pagar.
2. Lanca em ~8 segundos: valor, item, categoria, metodo, data.
3. App salva localmente (funciona sem internet).
4. Quando quiser, voce sincroniza com Google Drive (`lancamentos_manuais.csv`).
5. Em casa, o `gerar_dados.py` puxa esse CSV (manual: download do Drive) e
   atualiza o dashboard.

## Configuracao inicial (uma vez so)

Voce precisa fazer 3 coisas:

1. **Hospedar a pasta `pwa/` na internet** (GitHub Pages, gratis).
2. **Criar Client ID OAuth no Google Cloud** para o app conseguir salvar no
   seu Google Drive.
3. **Instalar o PWA no celular** Android.

### 1. Hospedar no GitHub Pages

GitHub Pages e gratis e perfeito pra isso. Passos:

1. Cria uma conta em github.com se ainda nao tem.
2. Cria um repositorio NOVO chamado `gastos-pwa` (publico).
3. No seu PC, terminal na pasta `gestao_financeira/pwa/`:
   ```
   git init
   git add .
   git commit -m "primeira versao"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/gastos-pwa.git
   git push -u origin main
   ```
   (Substitua SEU_USUARIO pelo seu nome no GitHub.)
4. No site do GitHub, vai no repositorio → Settings → Pages.
5. Em "Source", escolha "Deploy from a branch", branch `main`, pasta `/ (root)`.
6. Aguarde ~1 minuto. O endereco final sera:
   `https://SEU_USUARIO.github.io/gastos-pwa/`

Anote esse endereco. E nele que voce vai acessar pelo celular.

### 2. Criar Google OAuth Client ID

Sem isso, o PWA so funciona com "Exportar CSV" manual (WhatsApp/Drive/email).
Com isso, sincroniza direto.

Passos (~20 minutos, gratuito permanente):

1. Acesse https://console.cloud.google.com/
2. Logue com a mesma conta Google onde voce quer salvar o CSV.
3. Aceite os termos se aparecer.
4. Em cima, clica em "Selecionar projeto" -> "Novo projeto".
   - Nome: `gastos-pwa`
   - Cria.
5. Aguarde criar e selecione o projeto.
6. No menu lateral (≡), va em "APIs e servicos" -> "Biblioteca".
7. Busque "Google Drive API", clica nela, clica em "Ativar".
8. Volte ao menu (≡) "APIs e servicos" -> "Tela de permissao OAuth".
9. Escolha "Externo" e clica em "Criar".
10. Preencha:
    - Nome do app: `Gastos PWA`
    - Email de suporte: seu email
    - Logotipo: pode deixar vazio
    - Dominio do app: pode deixar vazio
    - Email do desenvolvedor: seu email
    - Clica "Salvar e continuar"
11. Escopos: clica "Adicionar ou remover escopos".
    - Procure "drive.file" (`.../auth/drive.file`)
    - Marque ele (escopo "Veja e gerencie arquivos do Drive que voce abriu ou
      criou com este app")
    - "Atualizar" -> "Salvar e continuar"
12. Usuarios de teste: clica "+ Adicionar usuarios".
    - Adicione seu proprio email (o Google obriga isso enquanto o app esta em
      modo de teste; e tudo bem)
    - "Salvar e continuar"
13. Voltar ao menu "APIs e servicos" -> "Credenciais".
14. "+ Criar credenciais" -> "ID do cliente OAuth".
15. Tipo de aplicativo: "Aplicativo da Web"
16. Nome: `gastos-pwa-web`
17. **Origens JavaScript autorizadas**: cole o endereco do GitHub Pages
    (exemplo: `https://hugo123.github.io`)
    - Sem barra no final.
    - So o dominio, sem o `/gastos-pwa/`.
18. "Criar".
19. Aparece o Client ID. **Copie esse codigo** (algo como `1234567...apps.googleusercontent.com`).

### 3. Instalar no celular

1. Abra o Chrome no Android.
2. Acesse o endereco do GitHub Pages.
3. Apos carregar, no menu (3 pontos) do Chrome, toque em "Adicionar a tela inicial".
4. Confirme. O icone do app aparece na tela inicial como qualquer app.
5. Abra pelo icone (nao pelo Chrome).
6. Va em "Ajustes" -> "Conectar Google Drive".
7. Cole o Client ID que voce copiou.
8. Vai abrir a tela de login do Google -> autorize.
9. Pronto. O indicador no canto superior fica verde "sincronizado".

## Uso diario

**Apos cada compra:**
1. Abre o app no icone.
2. Digita o valor.
3. Digita o item (autocomplete sugere - clica na sugestao).
4. Toque na categoria.
5. (Default: CC Bradesco. So muda se outro metodo.)
6. (Default: data hoje. So muda se outra data.)
7. "Salvar". Tempo total: ~8 segundos.

**No fim do dia ou semana:**
1. Abre "Ajustes" no app.
2. Toca "Sincronizar agora".
3. O CSV no Google Drive e atualizado.

**Quando for atualizar o dashboard no PC:**
1. Baixe `lancamentos_manuais.csv` do seu Google Drive.
2. Coloque na raiz da pasta `gestao_financeira/` (substituindo se existir).
3. Rode `python gerar_dados.py`.
4. Recarregue o dashboard.

## Funcionamento offline

- Lancamentos salvos no celular (LocalStorage).
- Funcionam sem internet.
- Cambio fica em cache (atualizado quando ha sinal).
- Marcador vermelho/amarelo no canto superior indica pendencias.

## Reconciliacao com a fatura

Quando voce sobe a fatura no fim do mes, o `gerar_dados.py` faz match
automatico entre lancamentos do PWA e linhas da fatura:

- **BRL puro**: match por valor exato (tolerancia R$ 0,50) e data ±3 dias.
- **USD/EUR/GBP**: match pelo valor original em moeda estrangeira (se a fatura
  tiver coluna USD) ou por BRL aproximado (5% de tolerancia, janela ±7 dias).
- Quando casa, o sistema **adota a categoria do PWA** (mais confiavel que
  categorizacao automatica) e **adota o valor BRL real da fatura** (o que voce
  vai pagar, incluindo IOF).
- Para compras internacionais, calcula a **diferenca entre o cambio do preview
  e o cambio real** cobrado pelo Bradesco (info util pra prever futuras).

## Solucao de problemas

**"sem drive" no canto superior**
- Voce ainda nao conectou. Va em Ajustes -> Conectar Google Drive.

**Token expirou (precisa reconectar a cada hora)**
- Comportamento normal do Google OAuth. Tokens vivem 1 hora.
- A reconexao e rapida (1 toque no botao).

**"Origem nao autorizada" ao conectar**
- Voce esqueceu de adicionar o dominio do GitHub Pages nas
  "Origens JavaScript autorizadas" do Console Google Cloud.

**App nao aparece como instalavel no Chrome**
- Verifique que esta acessando via HTTPS (GitHub Pages e https).
- Limpe cache do Chrome para o dominio e tente de novo.

**Quero usar offline / sem Google**
- "Ajustes" -> "Exportar CSV (manual)" gera um arquivo que voce manda pelo
  WhatsApp/email pra si mesmo.
- Funciona como sincronizacao manual.

## Limites

- LocalStorage do navegador tem ~5MB. Suficiente para anos de lancamentos.
- O CSV no Drive cresce sem limpeza automatica. A cada sync, o app adiciona
  apenas lancamentos com IDs novos, entao nao duplica.
- O dashboard PC le o CSV inteiro - performance otima ate ~10.000 linhas.

## Privacidade

- Dados ficam no seu celular e no seu Google Drive pessoal.
- O Client ID OAuth e seu, ninguem mais tem acesso.
- O PWA so pede o escopo `drive.file`: ele so consegue acessar arquivos
  que o proprio PWA criou. Nao tem acesso aos outros arquivos do seu Drive.
