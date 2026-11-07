# Suíte de Testes QA e Auditoria de Segurança - Van Escolar SP (v2.4)
## Guia de Execução para Ferramentas de Teste Automáticas e PenTesting

---

### 1. Casos de Teste Funcionais (QA Test Cases)

#### **Caso de Teste TC-01: Barreira de Limite do Plano Gratuito (Subscription Tier Limit)**
- **Pré-condição**: Transportador logado com `subscriptionTier: 'free'`.
- **Procedimento**:
  1. Navegar até a aba "Alunos".
  2. Adicionar 5 crianças ao cadastro.
  3. Tentar adicionar a 6ª criança.
- **Resultado Esperado**: O sistema impede a inclusão, exibe alerta informativo sobre o limite do plano gratuito e oferece o botão para upgrade para o Plano Profissional (R$ 24,99) ou Premium (R$ 44,99).

#### **Caso de Teste TC-02: Bloqueio do Otimizador de Rotas nos Planos Gratuito e Profissional**
- **Pré-condição**: Transportador logado com `subscriptionTier: 'free'` ou `'pro'`.
- **Procedimento**:
  1. Navegar até a aba "Otimizador de Rotas".
- **Resultado Esperado**: A interface apresenta o banner de bloqueio com instrução para assinar o Plano Premium (R$ 44,99/mês). Os botões de reordenamento por IA permanecem desabilitados.

#### **Caso de Teste TC-03: Botão "Manifestar Interesse" e Notificação Automática**
- **Pré-condição**: Transportador logado visualizando o mural de oportunidades de novos alunos.
- **Procedimento**:
  1. Localizar um card de oportunidade com status de botão "Manifestar Interesse".
  2. Clicar em "Manifestar Interesse".
- **Resultado Esperado**:
  - O texto do botão altera imediatamente no DOM para "Interesse Salvo" na cor verde (`#1b8a52`).
  - É criada automaticamente uma nova mensagem no chat da família correspondente com os dados do veículo do motorista.
  - O array `interestedTransporters` no documento do Firestore passa a conter o e-mail/ID do motorista.

#### **Caso de Teste TC-04: Assinatura Digital do Contrato SmartVan**
- **Pré-condição**: Conversa ativa no chat entre Pai e Transportador com proposta enviada.
- **Procedimento**:
  1. O Pai clica no card do contrato na conversa do chat.
  2. Informa o Nome Completo e CPF para assinar.
  3. Clica em "Assinar Digitalmente".
- **Resultado Esperado**:
  - O status do contrato muda para `assinado_ativo`.
  - Exibe selo verde de autenticidade VESP-AUTH com timestamp exato e IP/CPF registrados.
  - O contrato permanece acessível para consulta por ambas as partes a qualquer momento na conversa.

#### **Caso de Teste TC-05: Seletor de Perfil dos Filhos (Netflix Style)**
- **Pré-condição**: Responsável logado na aplicação.
- **Procedimento**:
  1. Clicar no botão "Trocar Perfil" no topo da página.
  2. Selecionar o perfil de outro filho ou clicar em "Adicionar Perfil de Filho".
- **Resultado Esperado**: O aplicativo ajusta o contexto atual (rotas, pagamentos e escola) para o filho selecionado de forma instantânea sem recarregar a página.

---

### 2. Matriz de Auditoria de Segurança (OWASP Top 10 & LGPD)

| Vetor de Ataque / Teste | Mecanismo de Defesa Implementado | Status de Conformidade |
| :--- | :--- | :---: |
| **A1: Broken Access Control (Elevação de Privilégio)** | Regras do Firestore proíbem que usuários alterem a propriedade `role` no documento `/users/{uid}`. Apenas contas administradoras validadas em `/admins/{uid}` possuem acesso a rotas de moderação. | ✅ APROVADO |
| **A2: Cryptographic Failures (Exposição de Senhas)** | Senhas locais são hashed com SHA-256 e salting antes de persitirem no storage local. Autenticação primária gerenciada via Firebase Auth OAuth 2.0 / TLS 1.3. | ✅ APROVADO |
| **A3: Injection (NoSQL / SQL Injection)** | Uso exclusivo do SDK oficial do Google Cloud Firestore com métodos parametrizados (`doc`, `setDoc`, `getDoc`). Ausência de concatenação bruta de strings em queries. | ✅ APROVADO |
| **A7: Identification & Auth Failures** | Validação de sessão ativa via `onAuthStateChanged`. Usuários com status `suspenso` são bloqueados de realizar chamadas à API e impedidos de efetuar login. | ✅ APROVADO |
| **LGPD: Proteção de Dados Sensíveis de Menores** | Dados de menores de idade (endereço da residência e observações médicas) requerem autorização expressa dos pais e não são expostos publicamente na busca geral. | ✅ APROVADO |

---

### 3. Instruções de Execução do Script de Testes

Os testes podem ser executados utilizando o runner do **Playwright**, **Cypress** ou **Puppeteer**:

```bash
# Para rodar a suíte de testes com Playwright na pasta /prd:
npx playwright test prd/playwright_e2e.spec.ts --headed
```
