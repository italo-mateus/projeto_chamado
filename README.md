# ResolveOS - Sistema de Gerenciamento de Chamados

Sistema completo de Service Desk e Gerenciamento de Chamados desenvolvido com base no layout e design do **ResolveOS** (`template.jpg`).

---

## 🚀 Como Iniciar

O servidor já foi iniciado e está rodando em segundo plano:
- **URL de Acesso:** [http://localhost:3000](http://localhost:3000)

Se precisar reiniciar manualmente:
```bash
npm start
```

---

## 🔑 Credenciais do Super Admin (Pré-configurado)

O sistema já vem pré-configurado com o usuário Super Administrador solicitado:

| Campo | Valor |
|---|---|
| **Usuário** | `admin` (ou `admin@resolveos.com`) |
| **Senha** | `123` |
| **Nível de Acesso** | **Super Admin** (Poder Total) |

> 💡 **Dica de Acesso Rápido:** Na tela de login existe um botão que preenche automaticamente as credenciais do Super Admin com 1 clique!

---

## 🛠️ Recursos Implementados

### 1. Tela Inicial de Autenticação
- **Fazer Login:** Acesso com usuário/e-mail e senha, com opção de "Lembrar neste navegador".
- **Cadastro de Usuário:** Registro com Nome, E-mail, Departamento e Senha.
- **Esqueci Minha Senha:** Fluxo assistido de recuperação e redefinição imediata de senha.

### 2. Painel de Chamados (Fiel ao `template.jpg`)
- **4 Cards de Métricas em Tempo Real:**
  - Total de Chamados
  - Em Aberto
  - Em Atendimento
  - Resolvidos (Hoje)
- **Abas de Filtragem:** *Todos*, *Meus Chamados*, *Não Atribuídos* e *Aguardando Resposta*.
- **Dropdowns de Filtros:** Prioridade (*CRÍTICA*, *ALTA*, *MÉDIA*, *BAIXA*), Status (*Em Aberto*, *Em Progresso*, *Aguardando*, *Resolvido*) e Ordenação por Data.
- **Busca em Tempo Real:** Filtra por assunto, solicitante, departamento ou ID.
- **Tabela de Chamados com Ações:**
  - 👁️ **Visualizar Detalhes:** Histórico, linha do tempo, respostas, troca de status e transferência de atendente.
  - ✏️ **Edição Rápida:** Modificar assunto, prioridade e responsável.
  - ⋯ **Mais Opções:** Atribuir a mim, resolver com 1 clique ou excluir (Super Admin).
- **Paginação Completa:** Navegação entre páginas de chamados.
- **+ Novo Chamado:** Modal completo para registro de novos chamados com departamento, categoria e descrição.
- **Exportação:** Botão de exportação instantânea para arquivo CSV compatível com Excel.

### 3. Poderes do Super Admin
- **Console de Gerenciamento de Usuários:** Aba *Configurações* com poderes para:
  - Promover ou alterar cargos de usuários (*Super Admin*, *Supervisor*, *Atendente*, *Cliente*).
  - Redefinir senha de qualquer usuário diretamente.
  - Excluir contas de usuários.
- **Exclusão de Chamados:** Exclusividade do Super Admin para remover chamados de forma segura.
- **Parâmetros do Sistema:** Ajuste de SLAs operacionais e e-mail central da organização.

### 4. Módulos Adicionais
- **Painel (Dashboard):** Métricas de tempo médio de primeira resposta, SLA e ranking de atendentes.
- **Atendentes:** Grid com a equipe técnica e status de disponibilidade.
- **Clientes:** Cadastro e relação de clientes/solicitantes com total de chamados abertos.
- **Relatórios:** Auditoria de sistema e distribuição de chamados por criticidade.
- **Notificações:** Sino no topo com notificações de novos chamados e atualizações.

