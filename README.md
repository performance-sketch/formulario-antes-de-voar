# Vertical Rio — Antes de voar

Formulário do terminal de chegada: o cliente responde **antes do voo**, em PT, EN ou ES, só tocando em botões.
As respostas vão para uma aba **"Antes de voar"** no Google Sheets.

## Arquivos

| Arquivo | Para quê |
|---|---|
| `index.html`, `app.js` | A página do terminal (sem build, sem dependências) |
| `perguntas.js` | As 24 perguntas e traduções |
| `config.js` | Link da planilha (`ENDPOINT`), nome do terminal e tempos |
| `apps-script/receber_respostas.gs` | Recebe as respostas e grava na planilha |
| `apps-script/criar_google_forms.gs` | Alternativa: cria a mesma pesquisa no Google Forms |

## Ligar à planilha (uma vez)

1. Abra a planilha → **Extensões → Apps Script** → cole `apps-script/receber_respostas.gs` → salve.
2. **Implantar → Nova implantação → App da Web**: executar como *Eu*, acesso *Qualquer pessoa*.
3. Copie o link que termina em `/exec` e coloque em `config.js` → `ENDPOINT`.

Sem `ENDPOINT` a página roda em **modo de teste** (faixa preta embaixo): as respostas ficam só no aparelho.

## No terminal

- Abrir o link em tela cheia (modo quiosque). Para identificar o aparelho: `...?terminal=Balcão`.
- 90 s sem toque → volta para a tela inicial. Depois do envio, volta sozinho em 8 s.
- Sem internet, as respostas ficam guardadas no aparelho e são enviadas quando a conexão volta (contador ⏳ no canto).

## Regras de exibição

- "Moro no Rio" (3) pula as perguntas 4–6.
- Pergunta 10 abre: Instagram/TikTok → 11 · Influenciador (ou 11 = vídeo de influenciador) → 12 e 12b · Indicação/Hotel → 13 · Google → 14 · IA → 15.
- "Considerou outras empresas" = Sim (17) abre 18, 18b e 19.
