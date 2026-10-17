# Roteiro de Apresentação em Vídeo — PIT II
## Projeto: Sweet Bliss Cupcakes — Confeitaria Artesanal & Delivery
**Estudante:** Marcio de Freitas Afonso  
**RGM:** 33805113  
**Curso:** Bacharelado em Sistemas de Informação  
**Disciplina:** Projeto Integrador Transdisciplinar em Sistemas de Informação II (PIT II)  
**Situação-Problema:** Situação-Problema 2 (Arquitetura MVC, Persistência Relacional e IHC)  
**Tempo Sugerido de Vídeo:** 4 a 6 minutos  

---

### Dicas Gerais Antes de Gravar:
* **Ferramenta de Gravação Sugerida:** OBS Studio, Loom, Clipchamp ou gravação de tela do próprio Windows (`Win + G` ou `Win + Alt + R`).
* **Janelas preparadas e abertas antes de iniciar:**
  1. O navegador aberto em `http://localhost:3000` (com o comando `npm run dev` rodando no terminal).
  2. O Visual Studio Code aberto no projeto mostrando a árvore de pastas de `src/` e o arquivo `database/schema.sql`.
  3. O repositório aberto no GitHub: `https://github.com/mfafonso1978/sweet-bliss-cupcakes`.

---

## 🎬 Bloco 1: Abertura e Identificação (Tempo estimado: ~30 a 45 segundos)

**O que mostrar na tela:** Câmera do estudante com a página inicial da aplicação no navegador ao fundo.

**O que falar:**
> "Olá, professores e avaliadores! Meu nome é Marcio de Freitas Afonso, RGM 33805113, estudante do curso de Bacharelado em Sistemas de Informação.  
> Venho apresentar o meu Projeto de Intervenção para o PIT II, focado na Situação-Problema 2.  
> O objetivo principal deste projeto foi transformar o planejamento e os requisitos desenvolvidos no PIT-I em uma aplicação web totalmente funcional para a confeitaria e delivery Sweet Bliss Cupcakes, atuante na cidade de Matozinhos e região.  
> A solução foi construída com foco rigoroso no padrão arquitetural MVC (Model-View-Controller), persistência de dados relacional e aplicação das Heurísticas de Usabilidade de Nielsen em IHC."

---

## 🎬 Bloco 2: Demonstração da Aplicação e Princípios de IHC (Tempo estimado: ~1m30s a 2 minutos)

**O que mostrar na tela:** Navegador em tela cheia na página da aplicação (`http://localhost:3000`).

**Ações e Fala do Estudante:**
1. **Vitrine e Alérgenos (IHC):**
   * *Ação:* Navegar pela vitrine mostrando os cartões de cupcakes e os filtros.
   * *Fala:*  
     > "Aqui temos a vitrine de produtos. Um dos focos centrais de IHC foi a segurança alimentar e a transparência de informações: cada cupcake exibe badges claros de calorias e advertência de alérgenos, como glúten, lactose e ovos. O cliente pode filtrar instantaneamente por categorias como Gourmet, Vegano, Zero Açúcar e Sazonais, além de filtros de exclusão de alérgenos."

2. **Fluxo de Login e Autenticação:**
   * *Ação:* Clicar em "Entrar", digitar `cliente@sweetbliss.com` / `senha123` e entrar.
   * *Fala:*  
     > "Para garantir a integridade dos pedidos, o sistema exige identificação do cliente. Vou realizar o login com a conta de teste da Maria Silva. Observem que a interface responde imediatamente com feedback visual e exibe a saudação com o nome da cliente no cabeçalho."

3. **Carrinho e Checkout:**
   * *Ação:* Adicionar 1 Red Velvet (notar estoque: 18) e 1 Chocolate Belga (notar estoque: 12). Abrir o carrinho e avançar para o checkout.
   * *Fala:*  
     > "Vou adicionar uma unidade do Red Velvet Clássico Gourmet e uma do Chocolate Belga Trufado. Ao abrir o carrinho, temos o cálculo automático de subtotais e validação de pedido mínimo de vinte reais. No checkout, os dados de entrega para Matozinhos são preenchidos automaticamente. Vou escolher a opção de pagamento via PIX e confirmar o pedido."

4. **Rastreamento em Tempo Real:**
   * *Ação:* Concluir o pedido e mostrar a modal de acompanhamento com o código `PED-XXXXXX` e status *Em Produção*.
   * *Fala:*  
     > "O pedido foi registrado com sucesso sob o código de rastreamento oficial e status Em Produção, com tempo estimado de entrega, atendendo à heurística de visibilidade do status do sistema."

5. **Baixa Automática de Estoque e Painel Administrativo:**
   * *Ação:* Fechar a modal, clicar em "Área Administrativa", entrar (`admin` / `admin123`) e abrir a aba "Cardápio & Estoque".
   * *Fala:*  
     > "Agora, acessando o Back-Office administrativo, podemos constatar que o sistema efetuou a baixa automática no estoque: o Red Velvet passou de 18 para 17 unidades e o Chocolate Belga de 12 para 11 unidades. Além disso, todos os dados persistem no navegador através do localStorage, mesmo ao atualizar a página com F5."

---

## 🎬 Bloco 3: Arquitetura de Software — Padrão MVC (Tempo estimado: ~1m a 1m30s)

**O que mostrar na tela:** Janela do Visual Studio Code destacando a pasta `src/`.

**Ações e Fala do Estudante:**
* *Ação:* Expandir a pasta `src/` e apontar para as pastas `models/`, `controllers/` e `components/`.
* *Fala:*  
  > "Passando para a arquitetura do software, a aplicação foi rigorosamente estruturada no padrão MVC:  
  > 
  > 1. Na camada **Model**, localizada em `src/models/`, temos os contratos tipados em `types.ts`, os dados sementes em `seedData.ts` e as validações puras de regras de negócio em `validators.ts`, como checagem de pedido mínimo, validação de e-mail e regras de alérgenos.  
  > 
  > 2. Na camada **Controller**, em `src/controllers/`, extraímos toda a inteligência e controle da aplicação: temos o `CartController` para cálculos financeiros e taxas, o `OrderController` para ciclo de vida dos pedidos, o `AuthController` para controle de sessão e segurança contra força bruta, e o `CatalogController` para busca, filtros e baixa de estoque.  
  > 
  > 3. Na camada **View**, representada pelos componentes em `src/components/`, os componentes React atuam de maneira 100% desacoplada, servindo apenas para renderizar a interface e delegar as ações do usuário diretamente aos métodos dos Controllers, garantindo alto reuso e manutenibilidade."

---

## 🎬 Bloco 4: Banco de Dados Relacional (`schema.sql`) (Tempo estimado: ~45 segundos a 1 minuto)

**O que mostrar na tela:** Visual Studio Code exibindo o arquivo `database/schema.sql`.

**Ações e Fala do Estudante:**
* *Ação:* Rolar pelo arquivo `database/schema.sql`, mostrando as tabelas e o DML.
* *Fala:*  
  > "Para atender às diretrizes de persistência relacional do PIT II, foi desenvolvido o script `database/schema.sql` em padrão ANSI SQL compatível com MySQL e PostgreSQL.  
  > Ele cria o banco `sweet_bliss_db` com seis tabelas relacionais: `users`, `cupcakes`, `allergens`, a tabela associativa de muitos-para-muitos `cupcake_allergens`, `orders` e `order_items`.  
  > Foram aplicadas chaves primárias, chaves estrangeiras com integridade referencial em cascata, índices de busca e constraints de validação, além da carga inicial com todos os cupcakes e usuários da vitrine."

---

## 🎬 Bloco 5: Conclusão e Encerramento (Tempo estimado: ~30 segundos)

**O que mostrar na tela:** Página do repositório no GitHub (`https://github.com/mfafonso1978/sweet-bliss-cupcakes`) ou câmera do estudante.

**O que falar:**
> "Para finalizar, todo o código-fonte, a documentação com os diagramas de arquitetura MVC e o modelo relacional DER estão disponíveis publicamente no meu repositório do GitHub.  
> A experiência do PIT II foi fundamental para consolidar a integração entre Engenharia de Requisitos, Padrões de Projeto, IHC e Banco de Dados.  
> Agradeço a atenção de todos os professores avaliadores!"

---
*Fim da Apresentação.*
