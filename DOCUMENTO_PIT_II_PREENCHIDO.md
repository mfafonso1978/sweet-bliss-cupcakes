# PROJETO INTEGRADOR TRANSDISCIPLINAR EM SISTEMAS DE INFORMAÇÃO II (PIT II)
## PROJETO DE INTERVENÇÃO — CRUZEIRO DO SUL VIRTUAL

**Nome:** Marcio de Freitas Afonso  
**RGM:** 33805113  
**Curso:** Bacharelado em Sistemas de Informação  
**Disciplina:** Projeto Integrador Transdisciplinar em Sistemas de Informação II (PIT II)  

---

### Qual situação-problema você escolheu para criar o seu projeto de intervenção?
[ ] Situação-problema 1  
[ **X** ] **Situação-problema 2**  
[ ] Situação-problema 3  

---

### A Situação-Problema escolhida:
**Sobre o que é a situação-problema escolhida por você? Descreva em até 5 linhas.**

> A Situação-Problema escolhida trata da transposição prática da solução planejada no PIT-I para a confeitaria artesanal "Sweet Bliss Cupcakes" em Matozinhos-MG e região. O projeto abrange o desenvolvimento de uma interface web interativa e responsiva (front-end) integrada a uma estrutura de regras de negócio e persistência de dados (back-end), rigorosamente fundamentada no padrão arquitetural MVC (Model-View-Controller) e boas práticas de IHC.

*(4 linhas | Limite: até 5 linhas)*

---

### Objetivo:
**Qual o principal objetivo a ser solucionado a partir da situação-problema escolhida? Descreva em até 3 linhas.**

> Objetivo: Transformar os requisitos, protótipos e diagramas de classes do PIT-I em uma aplicação web funcional sob o padrão arquitetural MVC, viabilizando o catálogo interativo de cupcakes com transparência de alérgenos e o fluxo completo de checkout e rastreamento de pedidos online.

*(3 linhas | Limite: até 3 linhas)*

---

### Revisão de Conceito:
**Quais os conhecimentos aprendidos no curso foram utilizados como base de estudo? Descreva em até 5 linhas.**

> Revisão de Conceito: Foram mobilizados conhecimentos de Engenharia de Software (metodologias ágeis, modelagem de requisitos e ciclo de vida de desenvolvimento), Interação Humano-Computador — IHC (usabilidade e as 10 Heurísticas de Jakob Nielsen), Padrões de Arquitetura de Software (separação estrita em Model, View e Controller) e Banco de Dados Relacional (modelagem física, normalização, integridade referencial e scripts DDL/DML em SQL ANSI).

*(5 linhas | Limite: até 5 linhas)*

---

### Metodologia:
**Qual abordagem, técnica ou processo utilizado para resolver a situação-problema escolhida? Descreva em até 5 linhas.**

> Metodologia: Adotou-se o desenvolvimento ágil iterativo orientado a histórias de usuário e prototipagem contínua. Aplicou-se o padrão arquitetural MVC para garantir baixo acoplamento e alta coesão entre os componentes visuais em React/TypeScript e os controladores de negócio, associando validações de domínio na camada Model, persistência com recarga (F5) e projeto de banco de dados relacional.

*(5 linhas | Limite: até 5 linhas)*

---

### Tempo:
**Quanto tempo levará para que a situação-problema possa ser resolvida? Aponte tempos específicos para cada ação e o tempo total para a resolução.**

#### Tempo e Cronograma de Execução:

| Ação / Etapa do Projeto | Tempo Estimado |
|---|:---:|
| 1. Revisão do escopo, requisitos e diagramas de classes do PIT-I | 6 horas |
| 2. Modelagem física e criação do banco de dados relacional (SQL/DDL) | 8 horas |
| 3. Implementação da camada Model (tipos e validadores) e Controllers de negócio | 14 horas |
| 4. Codificação da interface web responsiva (Front-End / Views e estilos com Tailwind) | 12 horas |
| 5. Integração entre camadas, testes funcionais de ponta a ponta e homologação | 8 horas |

**Tempo total para a resolução:** 48 horas.

---

### Procedimento e material utilizado:
**Como você pretende solucionar a situação-problema escolhida? Descreva as etapas e as ferramentas utilizadas nessa resolução. Descreva em até 12 linhas.**

> Procedimento e material utilizado: O procedimento iniciou-se pela transposição dos diagramas do PIT-I no projeto físico de banco de dados relacional (`database/schema.sql`), estruturando as tabelas `users`, `cupcakes`, `allergens`, `cupcake_allergens` (N:M), `orders` e `order_items` com constraints e índices. Em seguida, a aplicação foi organizada no padrão MVC: na camada Model (`src/models/`), definiram-se as entidades e validadores de negócio (`OrderValidator`, `AuthValidator`, `CupcakeValidator`); na camada Controller (`src/controllers/`), implementaram-se `CartController`, `OrderController`, `AuthController` e `CatalogController`, gerenciando regras e persistência em `localStorage`; na camada View (`src/components/`), construíram-se interfaces responsivas em React 19, TypeScript e Tailwind CSS para vitrine, carrinho, login e checkout, aplicando princípios de IHC. Utilizaram-se Visual Studio Code como IDE, Git/GitHub para controle de versão, Node.js e Vite como ambiente de desenvolvimento e Postman/Browser para validação funcional.

*(11 linhas | Limite: até 12 linhas)*

---

### Resultado e discussão:
**Qual foi a resolução da situação-problema após a aplicação do procedimento? Faça também comentários finais sobre o projeto. Descreva em até 15 linhas.**

> Resultado e discussão: A aplicação do procedimento resultou na entrega de uma aplicação web completa e totalmente operacional para a Sweet Bliss Cupcakes em Matozinhos-MG. Os usuários navegam pelo catálogo gourmet, filtram produtos por restrições alimentares (sem glúten e sem lactose), autenticam-se com segurança (proteção contra força bruta), realizam pedidos via PIX/Cartão e acompanham o rastreamento em tempo real com baixa automática de estoque. A separação em camadas sob o padrão MVC garantiu modularidade, facilidade de manutenção e independência entre a interface visual e a lógica de processamento. A persistência de dados garantiu a manutenção de estado mesmo após recarga da página (F5), e o script relacional assegurou conformidade para implantação em SGBDs corporativos (MySQL/PostgreSQL). O projeto consolidou de forma prática as competências em engenharia de requisitos, design de interfaces, padrões de projeto e banco de dados. O código-fonte completo e o script SQL encontram-se disponíveis publicamente em: https://github.com/mfafonso1978/sweet-bliss-cupcakes.

*(14 linhas | Limite: até 15 linhas)*
