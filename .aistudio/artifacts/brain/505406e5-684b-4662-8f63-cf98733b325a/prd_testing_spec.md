# PRD & Especificação para Testes Automatizados (QA & Segurança)
**Aplicativo:** Van Escolar SP  
**Versão:** 2.4.0 (Production-Ready)  
**Arquitetura:** React + Vite + Tailwind CSS + Firebase Auth & Firestore (Enterprise) + Service Worker (PWA)  
**Ambiente de Execução:** Web / Mobile Web / Progressive Web App (PWA)  

---

## 1. Visão Geral do Produto & Papéis (RBAC)

O **Van Escolar SP** é uma plataforma profissional de transporte escolar que conecta pais e responsáveis a transportadores credenciados pelo DTP (Departamento de Transportes Públicos da Prefeitura de São Paulo).

### Matrix de Papéis e Permissões (Role-Based Access Control)
| Papel | Código RBAC | Escopo de Acesso | Funcionalidades Principais |
| :--- | :---: | :--- | :--- |
| **Cliente / Responsável** | `c` | Somente dados próprios e de seus dependentes | Busca e comparação de vans, contratação, assinatura digital de contratos, rastreamento GPS em tempo real, pagamento Pix/Cartão, troca de perfil dos filhos estilo Netflix. |
| **Transportador / Motorista** | `t` | Somente sua van, seus alunos contratados e oportunidades públicas | Gestão de alunos, lista de embarque/presença, otimização de rotas por IA, lançamento de despesas, envio de propostas de contrato, manifestação de interesse, renovação de verificação DTP. |
| **Administrador / DTP SP** | `a` | Acesso global de regulação | Validação e aprovação de alvarás DTP/CNH D, moderação de avaliações da rede, auditoria de segurança LGPD, bloqueio de usuários inadimplentes/regulatórios. |

---

## 2. Especificação Módulo a Módulo para Testes Automatizados

### Módulo 1: Autenticação & Gestão de Sessão (Auth & IAM)
- **Requisitos Funcionais:**
  - Login via E-mail/Senha com suporte ao Firebase Auth `signInWithEmailAndPassword`.
  - Login social via **Google OAuth** (`signInWithPopup`).
  - Redirecionamento imediato para a tela inicial (`tab === 'b'` para pais, `tab === 'opp'` para transportadores) ao concluir cadastro ou login.
  - Sincronização automática do token de sessão com Firestore na coleção `/users/{userId}`.
- **Cenários de Testes Automatizados (E2E):**
  1. `TEST_AUTH_01`: Cadastro de Responsável com validação de CPF e dependentes. Verificar criação do documento em `/users/{uid}`.
  2. `TEST_AUTH_02`: Cadastro de Motorista com inserção de CNH D, Alvará DTP e placa da van. Verificar criação do documento em `/transporters/{tid}`.
  3. `TEST_AUTH_03`: Tentativa de login com conta suspensa pelo DTP (`status: 'suspenso'`). O app deve exibir a mensagem de erro e impedir o acesso.
  4. `TEST_AUTH_04`: Redirecionamento imediato pós-login sem recargas de página.

---

### Módulo 2: Matriz de Limites por Plano de Assinatura (Subscription Tiers)
- **Regras de Negócio & Regras de Acesso:**
  - **Plano Gratuito (`free`)**:
    - Limite máximo: **5 crianças**.
    - Otimizador de rotas inteligentes por IA: **Bloqueado** (deve exibir modal de upgrade).
    - Lançamento de despesas veiculares: **Bloqueado**.
  - **Plano Profissional (`pro` - R$ 24,99/mês)**:
    - Limite máximo: **40 crianças**.
    - Otimizador de rotas inteligentes por IA: **Bloqueado**.
    - Lançamento de despesas veiculares: **Liberado**.
  - **Plano Premium (`premium` - R$ 44,99/mês)**:
    - Crianças: **Ilimitadas**.
    - Otimizador de rotas por IA e trânsito em tempo real: **Liberado**.
    - Gestão financeira completa: **Liberada**.

- **Cenários de Testes Automatizados (E2E):**
  1. `TEST_TIER_01`: Transportador no plano `free` tenta adicionar a 6ª criança. Verificar que o sistema bloqueia e aciona o alerta de limite atingido.
  2. `TEST_TIER_02`: Transportador no plano `pro` tenta adicionar a 41ª criança. Verificar bloqueio.
  3. `TEST_TIER_03`: Transportador no plano `free` clica na aba "Otimizador de Rotas Inteligentes". Verificar presença do banner de bloqueio e CTA de upgrade para Premium.

---

### Módulo 3: Oportunidades & Notificação de "Manifestar Interesse"
- **Requisitos Funcionais:**
  - O motorista visualiza cotações de transporte publicadas pelos pais em suas regiões.
  - Ao clicar em **"Manifestar Interesse"**:
    1. O botão deve mudar **imediatamente no DOM** para `<button disabled>✓ Interesse Salvo</button>` (cor verde `#1b8a52`).
    2. O sistema deve emitir automaticamente uma mensagem de notificação no chat da família (`chats/{chatId}`).
    3. Uma notificação com prioridade alta deve ser registrada em `notices`.
  - Ao clicar no card da criança ou nome do pai, o modal de reputação `ParentProfileModal` deve abrir exibindo métricas de pontualidade, pagamentos e comunicação.

- **Cenários de Testes Automatizados (E2E):**
  1. `TEST_OPP_01`: Clique no botão "Manifestar Interesse". Validar que a classe CSS do botão altera para verde e que o texto muda para "Interesse Salvo".
  2. `TEST_OPP_02`: Verificar inserção da mensagem de notificação automática no chat com o pai.
  3. `TEST_OPP_03`: Clique no card do aluno. Assertar visibilidade dos elementos do `ParentProfileModal` (Nota em estrelas, botão de ligação e histórico de avaliações).

---

### Módulo 4: Contratos Digitais (SmartVan Contract) & Assinatura VESP-AUTH
- **Requisitos Funcionais:**
  - Emissão de contratos escolares com 16 cláusulas legais em conformidade com o Código de Defesa do Consumidor e DTP-SP.
  - Assinatura digital com carimbo de IP, data/hora e CPF (`parentSignature`).
  - Transição de status do contrato: `proposta_enviada` -> `revisado_pelo_pai` -> `assinado_ativo`.
  - Regra de Inadimplência: 1 semana de atraso gera juros/multa; 30 dias de inadimplência gera cancelamento automático e notificação para inclusão nos órgãos de proteção ao crédito.

- **Cenários de Testes Automatizados (E2E):**
  1. `TEST_CONTRACT_01`: Motorista gera proposta de contrato com valor mensal de R$ 420,00.
  2. `TEST_CONTRACT_02`: Responsável abre o contrato recebido no chat, preenche CPF e confirma a assinatura digital.
  3. `TEST_CONTRACT_03`: Validar alteração de status do contrato para `assinado_ativo` no Firestore e na UI.

---

### Módulo 5: Gestão Financeira, Pagamentos & Pix Webhook
- **Requisitos Funcionais:**
  - Registro de mensalidades com status: `pago`, `pendente`, `abonado`, `atrasado`.
  - Cálculo de repasses com taxa de intermediação de 4,5%.
  - Funcionalidade "Abonar Mensalidade" altera status para `abonado` sem cobrança de juros.

- **Cenários de Testes Automatizados (E2E):**
  1. `TEST_FIN_01`: Execução de webhook Pix simulado (`processIncomingPixWebhook`). Verificar confirmação da mensalidade.
  2. `TEST_FIN_02`: Testar cálculo de retenção da taxa de plataforma (4.5%).

---

## 3. Matriz de Testes de Segurança (Vulnerability & Security Testing)

Ferramentas recomendadas: **OWASP ZAP**, **Burp Suite**, **Playwright Security Audit**, **ESLint Security Plugin**.

### 3.1. Controle de Acesso Quebrado (Broken Access Control - OWASP A01:2021)
- **Vetor de Ataque:** Um usuário autenticado com papel de cliente (`c`) tenta chamar diretamente funções de administração ou alterar documentos de outros usuários no Firestore.
- **Teste Automatizado de Regras do Firestore:**
  - Executar suíte `firestore.rules.test.ts` simulando requisições não autorizadas:
    - Tentar ler `/users/{outroUserId}` com UID diferente de admin -> **PERMISSION_DENIED**.
    - Tentar atualizar `/contracts/{contractId}` de terceiros -> **PERMISSION_DENIED**.
    - Tentar alterar o campo `role` no próprio documento para `'a'` (Admin) -> **PERMISSION_DENIED**.

### 3.2. Injeção & Sanitização de Dados (XSS / Script Injection - OWASP A03:2021)
- **Vetor de Ataque:** Injeção de scripts maliciosos em campos de formulários (`<script>alert('xss')</script>`).
- **Campos a Testar:**
  - Observações médicas da criança (`o`)
  - Descrição da cotação de transporte (`notes`)
  - Mensagens de chat (`x`)
  - Comentários de avaliação do responsável (`comment`)
- **Asserção Esperada:** O aplicativo deve escapar todos os caracteres HTML e renderizar texto puro no DOM via React JSX sem execução de código JS.

### 3.3. Proteção de Dados Pessoais & LGPD (PII Exposure - OWASP A04:2021)
- **Vetor de Ataque:** Raspagem não autorizada de dados de crianças, endereços de embarque e contatos telefônicos.
- **Teste de Vazamento de Dados:**
  - Assegurar que consultas não autenticadas na coleção `/students` retorne erro de permissão.
  - Verificar que o compartilhamento de coordenadas GPS é interrompido fora dos horários ativos das viagens escolares.

### 3.4. Sobrecarga Volumétrica (Denial of Wallet / Resource Exhaustion)
- **Vetor de Ataque:** Envio de payloads gigantescos (ex: strings de 1MB em IDs ou mensagens).
- **Validação de Limites de Tamanho:**
  - `isValidId(id)` deve restringir IDs a até 128 caracteres `[a-zA-Z0-9_\-\.:@]`.
  - Nomes de usuários e crianças limitados a 100 caracteres.
  - Mensagens de chat limitadas a 1.000 caracteres.

---

## 4. Guia de Configuração para Scripts Automatizados (Playwright / Cypress)

```typescript
// Exemplo de Script Playwright para Validação do Botão "Manifestar Interesse"
import { test, expect } from '@playwright/test';

test.describe('Van Escolar SP - Automated QA Suite', () => {
  test('Deve manifestar interesse e alterar botão para Interesse Salvo instantaneamente', async ({ page }) => {
    // 1. Acessar app
    await page.goto('http://localhost:3000');

    // 2. Realizar login como Transportador
    await page.click('text=Motorista de Van');
    await page.fill('input[type="email"]', 'joao.batista@vanescolar.sp');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button:has-text("Entrar")');

    // 3. Aguardar carregamento da aba Oportunidades
    await expect(page.locator('h2')).toContainText('Oportunidades de Novos Alunos');

    // 4. Localizar primeiro card e clicar em Manifestar Interesse
    const interestBtn = page.locator('button:has-text("Manifestar Interesse")').first();
    await interestBtn.click();

    // 5. Assertar mudança do botão para "Interesse Salvo"
    const savedBtn = page.locator('button:has-text("Interesse Salvo")').first();
    await expect(savedBtn).toBeVisible();
    await expect(savedBtn).toHaveClass(/bg-\[\#1b8a52\]/);
  });

  test('Deve abrir modal de perfil e avaliação do pai ao clicar no card da criança', async ({ page }) => {
    await page.goto('http://localhost:3000');
    // Simular clique no card da criança
    await page.click('text=Clique para ver perfil completo & avaliação da família');
    
    // Assertar visibilidade do modal ParentProfileModal
    await expect(page.locator('text=Reputação na Comunidade de Motoristas')).toBeVisible();
    await expect(page.locator('text=Selo Família Nota 10')).toBeVisible();
  });
});
```

---

## 5. Resumo da Cobertura de QA & Checklist de Aprovação

- [x] **Autenticação & Sessão:** Login E-mail, Google OAuth e LGPD.
- [x] **Planos & Limites:** Regras de 5 alunos (Gratuito) e 40 alunos (Profissional).
- [x] **Segurança Firestore:** `firestore.rules` validadas contra elevação de privilégios.
- [x] **Reatividade UI:** Botão "Interesse Salvo" com notificação em tempo real.
- [x] **Contratos VESP-AUTH:** Assinatura digital com hash e 16 cláusulas legais.
