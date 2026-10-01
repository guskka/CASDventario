<div align="center">

<h1>
  <img src="src/assets/brand/casdventario-blue-logo.svg" alt="Logo CASDventario" width="48" align="absmiddle" />
  CASDventario
</h1>

**Sistema web de gestão de estoque, kits e empréstimo de notebooks da ONG CASD**

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white)
![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-000000?logo=shadcnui&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-v24.14.1-339933?logo=nodedotjs&logoColor=white)
![Licença](https://img.shields.io/badge/licen%C3%A7a-MIT-green)

</div>

---

O **CASDventário** é um sistema de gestão de inventário desenvolvido como **Trabalho de Conclusão de Curso (TCC)** na **ETEC Profa. Ilza Nascimento Pintus**, em parceria com a ONG **CASD**, de São José dos Campos – SP.

A ONG distribui **kits** e realiza o **empréstimo de notebooks** a alunos, e esse controle era feito manualmente. O sistema automatiza o processo, registrando entradas de remessas, entregas de kits, empréstimos e devoluções de notebooks, além de gerenciar os usuários que operam a plataforma.

> ⚠️ **Este repositório contém apenas o frontend.** A API e o banco de dados ficam em um repositório privado separado, o `CASDventario-Backend`. Veja a seção [Arquitetura](#️-arquitetura).

## 📑 Sumário

- [Funcionalidades](#-funcionalidades)
- [Arquitetura](#️-arquitetura)
- [Começando](#-começando)
  - [Pré-requisitos](#-pré-requisitos)
  - [Instalação](#-instalação)
- [Como o sistema funciona](#-como-o-sistema-funciona)
- [Estrutura de pastas](#-estrutura-de-pastas)
- [Scripts disponíveis](#-scripts-disponíveis)
- [Implantação](#-implantação)
- [Construído com](#️-construído-com)
- [Colaborando](#️-colaborando)
- [Autores](#️-autores)
- [Licença](#-licença)

## ✨ Funcionalidades

- 🔐 **Autenticação**: cadastro (*sign-up*) e login (*sign-in*) de usuários.
- 👥 **Gerenciamento de usuários**: listagem em tabela com busca (rota `/usermanagement`).
- 🎓 **Alunos**: cadastro dos alunos atendidos pela ONG.
- 📦 **Remessas e estoque**: controle da entrada e do estoque de kits.
- 🎁 **Entrega de kits** aos alunos.
- 💻 **Notebooks**: cadastro, empréstimos e devoluções.
- 🌗 **Tema claro/escuro** (*theme switcher*).

## 🏗️ Arquitetura

```text
Navegador (React + Vite)  ──HTTP/JSON──▶  API (Fastify)  ──Prisma──▶  MariaDB (db_casdventario)
└────── este repositório ──────┘          └────────── CASDventario-Backend (privado) ──────────┘
```

O backend é responsável por expor a **API REST** consumida por este frontend, acessar o banco de dados **MariaDB** e aplicar as regras de negócio, como a baixa automática do estoque na entrega de kits e a atualização do status do notebook em empréstimos e devoluções.

**Stack do backend:** Fastify · Prisma ORM · MariaDB.

## 🚀 Começando

Estas instruções permitirão que você obtenha uma cópia do frontend em operação na sua máquina local, para fins de desenvolvimento e teste.

Consulte [Implantação](#-implantação) para saber como gerar a versão de produção.

### 📋 Pré-requisitos

- **[Node.js](https://nodejs.org/) v24.14.1** (versão utilizada no desenvolvimento) e **npm**. Confira a sua com:

  ```bash
  node -v
  # v24.14.1
  ```

- **[XAMPP](https://www.apachefriends.org/)** (ou LAMPP, no Linux), pois o **MariaDB** usado pelo sistema roda por ele.
- O **backend** (`CASDventario-Backend`) em execução, para que login, cadastro e listagens funcionem.
- **[Git](https://git-scm.com/)** *(opcional: necessário apenas para clonar o repositório e contribuir; também é possível baixar o ZIP pelo GitHub)*.

### 🔧 Instalação

Siga os passos abaixo na ordem indicada.

> ⚠️ **O XAMPP precisa estar rodando para o sistema funcionar.** Sem o MariaDB ativo, o backend não consegue acessar o banco e o login, o cadastro e as listagens do frontend deixam de funcionar.

**1. Inicie o XAMPP (MariaDB)**

Linux (LAMPP):

```bash
sudo /opt/lampp/lampp start
```

Ou, para iniciar apenas o banco de dados:

```bash
sudo /opt/lampp/lampp startmysql
```

Windows: abra o **XAMPP Control Panel** e clique em **Start** no módulo **MySQL** (no XAMPP, esse módulo executa o MariaDB).

**2. Inicie o backend**

Com o MariaDB ativo, inicie o `CASDventario-Backend` seguindo o README dele (requer acesso ao repositório).

**3. Clone o repositório do frontend**

```bash
git clone https://github.com/guskka/CASDventario.git
cd CASDventario
```

**4. Instale as dependências**

```bash
npm install
```

**5. Inicie o servidor de desenvolvimento**

```bash
npm run dev
```

Acesse o endereço exibido no terminal (por padrão, `http://localhost:5173`).

**Ordem de inicialização:**

```text
XAMPP (MariaDB)  →  Backend (API)  →  Frontend (npm run dev)
```

## 🧭 Como o sistema funciona

1. **Cadastro e login**: o usuário cria a conta na página de *sign-up* e entra pela página de *sign-in*. Após autenticar, a sessão fica guardada no `sessionStorage` e o usuário é redirecionado para `/usermanagement`.
2. **Gerenciamento de usuários**: a página administrativa lista os usuários vindos da API em uma tabela com campo de busca.
3. **Remessas e estoque**: as remessas recebidas alimentam o estoque de kits.
4. **Entrega de kits**: ao registrar uma entrega para um aluno, o estoque é atualizado automaticamente pelo backend.
5. **Empréstimo de notebooks**: ao emprestar um notebook, seu status muda; na devolução, o checklist de estado é registrado e o status é atualizado novamente.

## 🗂️ Estrutura de pastas

```text
CASDventario/
├── .github/
│   └── ISSUE_TEMPLATE/     # Templates de issues (macro issues)
├── .vscode/                # Configurações do editor
├── public/                 # Arquivos estáticos (logo, logotipo, favicon)
├── src/                    # Código-fonte da aplicação React
├── .gitignore
├── .prettierignore
├── .prettierrc
├── components.json         # Configuração do shadcn/ui
├── eslint.config.js
├── index.html
├── jsconfig.json
├── package.json
├── vite.config.js
├── LICENSE
└── README.md
```

## 📜 Scripts disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor de desenvolvimento (Vite) |
| `npm run build` | Gera a build de produção |

## 📦 Implantação

Para gerar a versão de produção do frontend:

```bash
npm run build
```

Os arquivos estáticos otimizados são gerados na pasta `dist/` e podem ser publicados em qualquer servidor web. Em produção, o frontend precisa conseguir acessar a API do `CASDventario-Backend`, que por sua vez depende do banco de dados MariaDB em execução.

## 🛠️ Construído com

- [React 19](https://react.dev/) - Biblioteca de interface
- [Vite](https://vitejs.dev/) - Bundler e servidor de desenvolvimento
- [React Router DOM](https://reactrouter.com/) - Roteamento das páginas
- [Tailwind CSS](https://tailwindcss.com/) - Estilização
- [shadcn/ui](https://ui.shadcn.com/) - Componentes de interface
- [TanStack Table](https://tanstack.com/table) - Tabelas com busca e ordenação
- [ESLint](https://eslint.org/) e [Prettier](https://prettier.io/) - Padronização e formatação do código

## 🖇️ Colaborando

Contribuições da equipe seguem este fluxo:

1. Crie uma *branch* a partir da `main` para a sua tarefa (ex.: `feature/nome-da-tarefa` ou `refactor/nome-da-refatoracao`).
2. Faça commits seguindo o padrão **Conventional Commits** com emojis (gitmoji):

   ```text
   feat(table): altera tamanho da coluna id e estilo do avatar
   fix: corrige erro de hidratação no theme-switcher
   chore(package): atualiza dependências do shadcnui
   docs: atualiza documentação
   refactor(server): remove server/API/server.js
   ```

3. Abra um **Pull Request** para a `main` e aguarde a revisão de outro integrante.

Tarefas maiores são registradas por meio dos templates de *issue* disponíveis em `.github/ISSUE_TEMPLATE`.

## ✒️ Autores

- **Gustavo Henrique de Oliveira Gonçalves** - [@guskka](https://github.com/guskka)
- **Caio Rodrigo Nunes Silva** - [@Knockout25](https://github.com/Knockout25)
- **Rafael Tobias Jesus de Campos** - [@Fells](https://github.com/rafael-tjc)
- **Guilherme Fabian Braga** - [@Itsguiaround](https://github.com/Itsguiaround)

Você também pode ver a lista de todos os [colaboradores](https://github.com/guskka/CASDventario/graphs/contributors) que participaram deste projeto.

## 📄 Licença

Este projeto está sob a licença **MIT** - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

Desenvolvido pela equipe do TCC da **ETEC Profa. Ilza Nascimento Pintus** para a **ONG CASD**.
