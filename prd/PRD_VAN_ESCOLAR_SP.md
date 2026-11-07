# PRD - Van Escolar SP (v2.4 Atualizado)
## Especificação de Requisitos do Produto & Arquitetura do Sistema

---

### 1. Visão Geral do Produto

**Nome do Produto**: Van Escolar SP (VESP)  
**Público-Alvo**: Pais/Responsáveis, Transportadores Escolares Credenciados (DTP/SP) e Administradores Reguladores.  
**Propósito**: Plataforma de mobilidade e gestão para transporte escolar na Região Metropolitana de São Paulo, integrando busca geográfica de percursos, emissão de contratos jurídicos com assinatura digital, cobrança via Pix com repasse automático, acompanhamento de embarque/desembarque em tempo real e verificação oficial junto ao Departamento de Transportes Públicos (DTP).

---

### 2. Papéis e Controle de Acesso (RBAC)

1. **Responsável / Família (`role: 'c'`)**:
   - Cadastro detalhado com validação de CPF, endereço e filhos.
   - Alternador de perfis no estilo Netflix para cada filho cadastrado.
   - Busca e comparação de transportadores por escola, bairro e avaliações.
   - Chat direto com motorista e solicitação de propostas de contrato.
   - Assinatura digital do contrato SmartVan (16 cláusulas DTP).
   - Acompanhamento de rota em tempo real e confirmação de embarque.
   - Gestão de pagamentos das mensalidades e geração de comprovante Pix.

2. **Transportador / Motorista (`role: 't'`)**:
   - Perfil profissional com cadastro da Van (marca, modelo, placa, capacidade e DTP).
   - Mural de oportunidades de novos alunos com botão **"Manifestar Interesse"** que dispara notificação instantânea e atualiza o estado do botão para **"Interesse Salvo"**.
   - Acesso às avaliações e reputação do responsável ao clicar no card da criança.
   - Gestão de alunos, presenças e registros de pagamentos/contratos em substituição à chamada simples.
   - Otimizador de rotas com IA e ordem geográfica de embarque (conforme o plano de assinatura).
   - Lançamento de despesas e relatórios financeiros (conforme o plano de assinatura).

3. **Administrador / DTP Regulador (`role: 'a'`)**:
   - Aprovação/reprovação de cadastros e documentos DTP dos transportadores.
   - Moderação de avaliações e denúncias da comunidade.
   - Gestão de usuários (ativação e suspensão por irregularidades).
   - Auditoria de logs do sistema e relatórios de conformidade regulatória.

---

### 3. Matriz de Planos de Assinatura do Transportador

| Funcionalidade / Recurso | Plano Gratuito (`free`) | Plano Profissional (`pro` - R$ 24,99/mês) | Plano Premium (`premium` - R$ 44,99/mês) |
| :--- | :---: | :---: | :---: |
| **Limite de Crianças/Alunos** | Até 5 Crianças | Até 40 Crianças | Crianças Ilimitadas |
| **Otimizador de Rotas Inteligentes por IA** | ❌ Bloqueado | ❌ Bloqueado | ✅ Liberado (Com trânsito em tempo real) |
| **Lançamento de Despesas Veiculares** | ❌ Bloqueado | ✅ Liberado | ✅ Liberado |
| **Emissão de Contratos Digitais DTP** | ✅ Liberado | ✅ Liberado | ✅ Liberado |
| **Notificações Instantâneas "Manifestar Interesse"** | ✅ Liberado | ✅ Liberado | ✅ Liberado |
| **Recebimento de Mensalidades por Pix** | ✅ Liberado | ✅ Liberado | ✅ Liberado |

---

### 4. Fluxos Críticos de Negócio

#### Fluxo 4.1: Cadastro e Direcionamento sem Dados Iniciais (Clean Slate)
- Ao finalizar o cadastro (Pai ou Motorista), o usuário é direcionado para a página inicial zerada (0 dados pré-populados de rascunho), permitindo que ele insira e construa seu próprio histórico no aplicativo.
- Dados salvos são persistidos no Firebase Firestore na coleção de seu respectivo e-mail/UID.

#### Fluxo 4.2: Manifestação de Interesse e Notificação Instantânea
1. O transportador visualiza uma oportunidade no mural de novos alunos.
2. Clica no botão **"Manifestar Interesse"**.
3. **Comportamento Esperado**:
   - O botão muda imediatamente no DOM para a cor verde com o texto **"Interesse Salvo"**.
   - O sistema gera automaticamente uma notificação no chat da família e no mural do responsável avisando que o motorista atende aquela região.
   - O Firestore atualiza o array `interestedTransporters` no documento da oportunidade.

#### Fluxo 4.3: Perfil do Responsável & Avaliações no Card da Criança
1. O transportador clica no card da criança no mural ou na lista.
2. Abre o modal de detalhes do responsável (`ParentProfileModal`).
3. O transportador pode visualizar a avaliação da família (pontualidade, respeito e histórico de pagamentos) enviada por outros motoristas da rede.

#### Fluxo 4.4: Emissão e Assinatura Digital do Contrato SmartVan (16 Cláusulas)
1. Transportador e Pai negociam no chat.
2. O transportador envia a proposta de contrato com valores, vencimento e vigência.
3. O contrato se torna um arquivo interativo no chat e na aba de contratos.
4. O pai e o transportador assinam digitalmente informando Nome e CPF.
5. O contrato assinado fica salvo permanentemente na conversa com selo de autenticidade VESP-AUTH.

---

### 5. Arquitetura de Dados & Firestore Collections

- `/users/{email}`: Perfis de usuários, papel (`role`), LGPD consent e credenciais.
- `/transporters/{id}`: Dados do veículo, capacidade, plano (`subscriptionTier`), selo DTP e bairros atendidos.
- `/students/{id}`: Alunos cadastrados, endereço, escola, status de presença e pagamento.
- `/contracts/{id}`: Propostas e contratos assinados digitalmente (16 cláusulas jurídicas).
- `/opportunities/{id}`: Pedidos de cotação dos pais e lista de transportadores interessados.
- `/chats/{chatKey}/messages`: Histórico de mensagens do chat no formato WhatsApp.

---

### 6. Conformidade LGPD & Requisitos Não-Funcionais

- **Proteção de Dados de Menores**: Acesso restrito a fotos e endereços completos de alunos apenas para pais vinculados e transportadores contratados.
- **Geolocalização Ética**: Rastreamento GPS ativo apenas durante o horário das rotas escolares de ida e volta.
- **Tempo de Resposta**: Transições de tela menores que 100ms e sincronização offline com LocalStorage + Firestore Realtime.
