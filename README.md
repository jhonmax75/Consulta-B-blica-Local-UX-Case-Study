# Bíblia-Pesquisa

Consulta local do texto bíblico do projeto, sem servidor ou dependências.

## Usar

Abra `app\index.html` no navegador. Pesquise por:

- Referência: `João 3:16`, `Salmos 23` ou `Romanos 8:28-39`.
- Palavra ou frase: `sabedoria` ou `não temas`.
- Palavras-chave alternativas: `perdão, justiça`.

Cada resultado oferece contexto de dois versículos antes e depois, ou o
capítulo completo. Números 33:48 aparece identificado como trecho parcial.

## Atualizar os dados da página

Após atualizar o índice do projeto, execute:

```powershell
.\scripts\exportar-dados-app.ps1
```

O script gera `app\biblia-data.js` a partir dos versículos com texto na base
local. Recuperações externas sem linha correspondente na base não são incluídas.

O texto de origem fica em `base\biblia.txt`; os scripts de processamento e
consulta anteriores estão em `scripts\`.
