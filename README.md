# Consulta Bíblica Local
Aplicação web para pesquisar e consultar o texto bíblico, com foco na localização de passagens e na preservação do contexto textual.
🔗 **Acesso público:** https://jhonmax75.github.io/Consulta-B-blica-Local-UX-Case-Study/
## Sobre o Projeto
O Consulta Bíblica Local é uma aplicação leve, desenvolvida para facilitar a consulta de passagens bíblicas por referência, palavra ou expressão. A interface permite explorar os resultados em seu contexto, reduzindo o risco de interpretar versículos isoladamente.
## Funcionalidades
 * Pesquisa por referências: Busca por citações diretas, como João 3:16, Salmos 23 e Romanos 8:28-39.
 * Pesquisa por palavras ou expressões: Busca por termos diretos, como sabedoria e não temas.
 * Pesquisa por palavras-chave alternativas: Localização via temas correlatos, como perdão e justiça.
 * Exibição de contexto: Apresenta automaticamente os dois versículos anteriores e dois posteriores ao trecho consultado.
 * Leitura de capítulo completo: Consulta integral do capítulo selecionado.
 * Identificação de passagens parciais: Suporte a trechos fracionados, como o segmento associado a Números 33:48.
## Tecnologias e Estrutura
O projeto utiliza tecnologias web para funcionar diretamente no navegador, com arquivos estáticos e sem necessidade de um servidor de aplicação próprio.
### Arquivos Principais
 * index.html — Estrutura da interface.
 * styles.css — Apresentação visual e estilização.
 * app.js — Lógica de pesquisa e interação do usuário.
 * biblia-data.js — Dados bíblicos utilizados pela aplicação.
 * README.md — Documentação oficial do projeto.
## Como Executar Localmente
Com o Python instalado na sua máquina, abra o terminal na pasta raiz do projeto (onde está o index.html) e execute o comando:
python -m http.server 8000

Após iniciar o servidor, abra o seu navegador e acesse:
👉 http://localhost:8000
## Testes e Limitações
 * A aplicação foi validada em navegador desktop/mobile e testada em uma rede Wi-Fi local sem acesso à internet, onde o computador principal serviu os arquivos estáticos para os demais dispositivos conectados.
 * Nota: O teste em rede local não significa que o endereço público via GitHub Pages funcione sem conexão à internet, nem que a aplicação possua recursos avançados de instalação PWA ou sincronização offline automatizada.
## Objetivo
Facilitar o acesso e a consulta contextual do texto bíblico por meio de uma interface simples, leve e acessível.
## Fonte Textual e Licença
A origem, a edição e as condições de distribuição do texto bíblico devem ser verificadas e documentadas conforme a tradução utilizada. A publicação deste projeto não implica, por si só, que o texto incorporado esteja em domínio público ou tenha autorização irrestrita de redistribuição.
