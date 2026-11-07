import {
  User,
  TransporterProfile,
  Child,
  PaymentRecord,
  ExpenseRecord,
  VanMaintenance,
  NewStudentOpportunity,
  BroadcastNotice,
  CharterRequest,
  VerifiedReview,
  ReportTicket,
  AuditLogItem,
  ChatMsg,
  ContractProposal,
  ServicePartnerItem,
  PartnerPromotion,
  ParentReviewByTransporter,
  School,
  FreelanceDriver,
  BoardingStop,
  BoardingEvent,
  SubscriptionContract,
  TransferRecord
} from '../types';
import {
  INITIAL_TRANSPORTERS,
  INITIAL_KIDS,
  INITIAL_OPPORTUNITIES,
  SERVICE_PARTNERS,
  INITIAL_PARTNER_PROMOTIONS,
  INITIAL_CONTRACTS,
  OSASCO_SCHOOLS,
  FREELANCE_DRIVERS,
  INITIAL_BOARDING_STOPS
} from '../constants';

const DB_KEY = 'vesp_db_v2';
const LEGACY_KEY = 'vesp';

export interface VespDatabase {
  users: User[];
  currentSession: string | null;
  transporters: TransporterProfile[];
  kids: Record<string, Child[]>; // keyed by transporter email
  payments: PaymentRecord[];
  transfers: TransferRecord[]; // Automated driver bank repasses
  expenses: ExpenseRecord[];
  maintenance: Record<string, VanMaintenance>;
  opportunities: NewStudentOpportunity[];
  notices: BroadcastNotice[];
  charters: CharterRequest[];
  reviews: VerifiedReview[];
  parentReviews: ParentReviewByTransporter[]; // Ratings made by transporters to parents
  contracts: ContractProposal[];
  servicePartners: ServicePartnerItem[];
  partnerPromotions: PartnerPromotion[];
  schools: School[];
  freelanceDrivers: FreelanceDriver[];
  subscriptionContracts: SubscriptionContract[];
  boardingHistory: BoardingEvent[];
  boardingStops: Record<string, BoardingStop[]>;
  reports: ReportTicket[];
  auditLogs: AuditLogItem[];
  chat: Record<string, ChatMsg[]>;
  pick: Record<string, string>; // parent email -> transporter id
}

// Simple deterministic hash for demo passwords so they are never in plain text
export async function hashPassword(password: string): Promise<string> {
  const enc = new TextEncoder().encode(password + 'vesp_salt_2026');
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export function loadDatabase(): VespDatabase {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Ensure new arrays exist
      if (!parsed.contracts) parsed.contracts = INITIAL_CONTRACTS;
      if (!parsed.servicePartners) parsed.servicePartners = SERVICE_PARTNERS;
      if (!parsed.partnerPromotions) parsed.partnerPromotions = INITIAL_PARTNER_PROMOTIONS;
      if (!parsed.parentReviews) parsed.parentReviews = [];
      if (!parsed.schools) parsed.schools = OSASCO_SCHOOLS;
      if (!parsed.freelanceDrivers) parsed.freelanceDrivers = FREELANCE_DRIVERS;
      if (!parsed.subscriptionContracts) parsed.subscriptionContracts = [];
      if (!parsed.boardingHistory) parsed.boardingHistory = [];
      if (!parsed.boardingStops) parsed.boardingStops = { 'joao.batista@vanescolar.sp': INITIAL_BOARDING_STOPS };
      if (!parsed.transfers) {
        parsed.transfers = [
          {
            id: "trf_1",
            transporterEmail: "joao.batista@vanescolar.sp",
            transporterName: "João Batista",
            grossAmount: 420.00,
            platformFee: 18.90,
            platformFeePercent: 4.5,
            netAmount: 401.10,
            bankAccount: "Banco do Brasil (Ag: 1820-X / CC: 40912-3)",
            pixKey: "18.490.231/0001-44",
            transferType: "Pix",
            status: "liquidado",
            clearedAt: "10/10/2026 14:15",
            endToEndId: "E18236125202610101415009823145",
            receiptNumber: "TRF-881290"
          }
        ];
      }
      return parsed;
    }
  } catch (err) {
    console.error('Error loading DB v2:', err);
  }

  // Seed default users if empty
  const defaultUsers: User[] = [
    {
      id: 'u-admin',
      n: 'Administrador DTP / SP',
      email: 'admin@vanescolar.sp',
      pwHash: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', // 'admin123'
      role: 'a',
      phone: '(11) 3120-0000',
      createdAt: '2026-01-01',
      acceptedLGPD: true,
      status: 'ativo'
    },
    {
      id: 'u-t1',
      n: 'João Batista',
      email: 'joao.batista@vanescolar.sp',
      pwHash: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
      role: 't',
      phone: '(11) 98122-3344',
      referralCode: 'TRANSP-JOAO77',
      referralRewardsCount: 1,
      referralsList: [
        { email: 'marcia.souza@vanescolar.sp', name: 'Márcia Souza', subscribedPro: true, rewardClaimed: true, date: '15/09/2026' }
      ],
      createdAt: '2026-01-05',
      acceptedLGPD: true,
      status: 'ativo'
    },
    {
      id: 'u-p1',
      n: 'Marta Almeida',
      email: 'marta.almeida@gmail.com',
      pwHash: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3',
      role: 'c',
      phone: '(11) 98811-2233',
      parentRatingAverage: 5.0,
      parentRatingCount: 3,
      createdAt: '2026-02-01',
      acceptedLGPD: true,
      status: 'ativo'
    }
  ];

  const initialMaintenance: Record<string, VanMaintenance> = {
    'joao.batista@vanescolar.sp': {
      transporterEmail: 'joao.batista@vanescolar.sp',
      model: 'Mercedes Sprinter 415 CDI',
      year: 2020,
      plate: 'BRA-4E20',
      currentKm: 78400,
      lastOilKm: 70000,
      nextOilKm: 80000,
      tiresCondition: 'Bom',
      brakesCondition: 'Revisados',
      lastInspectionDate: '2026-01-15',
      nextInspectionDate: '2026-07-15',
      dtpExpiryDate: '2026-12-31',
      crlvExpiryDate: '2026-10-31',
      notes: 'Tacógrafo aferido pelo Inmetro válido até Novembro/2026.'
    }
  };

  const initialExpenses: ExpenseRecord[] = [
    {
      id: 'exp1',
      transporterEmail: 'joao.batista@vanescolar.sp',
      category: 'Combustível',
      amount: 480.00,
      date: '2026-11-01',
      description: 'Diesel S10 Posto Ipiranga Moema'
    },
    {
      id: 'exp2',
      transporterEmail: 'joao.batista@vanescolar.sp',
      category: 'Manutenção',
      amount: 320.00,
      date: '2026-10-25',
      description: 'Alinhamento e balanceamento 4 rodas'
    },
    {
      id: 'exp3',
      transporterEmail: 'joao.batista@vanescolar.sp',
      category: 'Licenciamento / DTP',
      amount: 195.50,
      date: '2026-10-10',
      description: 'Taxa vistoria semestral DTP'
    }
  ];

  const initialPayments: PaymentRecord[] = [
    {
      id: 'pay-seed-1',
      from: 'Marta Almeida',
      fromEmail: 'marta.almeida@gmail.com',
      to: 't1',
      toName: 'João Batista',
      v: 420.00,
      m: 'Pix',
      d: '05/11/2026',
      dueDate: '10/11/2026',
      status: 'pago',
      pixCode: '00020126580014br.gov.bcb.pix0136joao.batista@vanescolar.sp5204000053039865405420.005802BR5912Joao Batista6009Sao Paulo62070503***6304E8A1',
      receiptNumber: 'REC-2026-88192'
    },
    {
      id: 'pay-seed-2',
      from: 'Marta Almeida',
      fromEmail: 'marta.almeida@gmail.com',
      to: 't1',
      toName: 'João Batista',
      v: 420.00,
      m: 'Pix',
      d: '—',
      dueDate: '10/12/2026',
      status: 'pendente'
    }
  ];

  const initialNotices: BroadcastNotice[] = [
    {
      id: 'not1',
      transporterEmail: 'joao.batista@vanescolar.sp',
      transporterName: 'João Batista',
      category: 'Atraso',
      title: 'Trânsito intenso na Av. 23 de Maio',
      message: 'Devido a obras na pista local, nossa rota está com atraso previsto de aproximadamente 10 a 15 minutos. Todas as crianças estão bem!',
      createdAt: 'Hoje às 07:10',
      priority: 'alta'
    }
  ];

  const initialReviews: VerifiedReview[] = [
    {
      id: 'rev1',
      transporterId: 't1',
      parentName: 'Marta Almeida',
      parentEmail: 'marta.almeida@gmail.com',
      rating: 5,
      comment: 'O tio João é exemplar! A van é super limpa, com ar condicionado ligado e a monitora cuida com todo carinho da Sofia. Super recomendo!',
      date: '15/10/2026',
      verifiedHire: true,
      status: 'aprovado',
      reply: 'Muito obrigado, dona Marta! É sempre um prazer cuidar dos pequenos com máxima responsabilidade.'
    },
    {
      id: 'rev2',
      transporterId: 't1',
      parentName: 'Carlos Eduardo',
      parentEmail: 'carlos.edu@gmail.com',
      rating: 5,
      comment: 'Pontualidade britânica e avisos constantes no app quando está chegando. Não troco por nada.',
      date: '28/09/2026',
      verifiedHire: true,
      status: 'aprovado'
    }
  ];

  const initialParentReviews: ParentReviewByTransporter[] = [
    {
      id: 'prev1',
      transporterEmail: 'joao.batista@vanescolar.sp',
      transporterName: 'João Batista',
      parentEmail: 'marta.almeida@gmail.com',
      parentName: 'Marta Almeida',
      punctualityRating: 5,
      paymentRating: 5,
      communicationRating: 5,
      comment: 'Família exemplar! Lucas sempre pontual no portão e mensalidade rigorosamente em dia.',
      date: '10/10/2026',
      status: 'aprovado'
    }
  ];

  const db: VespDatabase = {
    users: defaultUsers,
    currentSession: defaultUsers[2].email, // default to Marta (parent)
    transporters: INITIAL_TRANSPORTERS,
    kids: {
      'joao.batista@vanescolar.sp': INITIAL_KIDS
    },
    payments: initialPayments,
    transfers: [
      {
        id: "trf_1",
        transporterEmail: "joao.batista@vanescolar.sp",
        transporterName: "João Batista",
        grossAmount: 420.00,
        platformFee: 18.90,
        platformFeePercent: 4.5,
        netAmount: 401.10,
        bankAccount: "Banco do Brasil (Ag: 1820-X / CC: 40912-3)",
        pixKey: "18.490.231/0001-44",
        transferType: "Pix",
        status: "liquidado",
        clearedAt: "10/10/2026 14:15",
        endToEndId: "E18236125202610101415009823145",
        receiptNumber: "TRF-881290"
      }
    ],
    expenses: initialExpenses,
    maintenance: initialMaintenance,
    opportunities: INITIAL_OPPORTUNITIES,
    notices: initialNotices,
    charters: [],
    reviews: initialReviews,
    parentReviews: initialParentReviews,
    contracts: INITIAL_CONTRACTS,
    servicePartners: SERVICE_PARTNERS,
    partnerPromotions: INITIAL_PARTNER_PROMOTIONS,
    schools: OSASCO_SCHOOLS,
    freelanceDrivers: FREELANCE_DRIVERS,
    subscriptionContracts: [],
    boardingHistory: [],
    boardingStops: {
      'joao.batista@vanescolar.sp': INITIAL_BOARDING_STOPS
    },
    reports: [],
    auditLogs: [
      {
        id: 'aud1',
        actorEmail: 'admin@vanescolar.sp',
        actorRole: 'admin',
        action: 'APROVACAO_DOCUMENTO',
        details: 'Aprovado alvará DTP e CNH D de João Batista após validação cadastral.',
        timestamp: '2026-02-12 14:32'
      }
    ],
    chat: {
      'marta.almeida@gmail.comt1': [
        {
          id: 'c1',
          f: 't',
          senderName: 'João Batista',
          x: 'Bom dia, Dona Marta! Segue nossa proposta de contrato com o valor acordado para o transporte do Lucas.',
          contractProposalId: 'cnt_1',
          time: '07:18'
        },
        {
          id: 'c2',
          f: 'me',
          senderName: 'Marta Almeida',
          x: 'Perfeito, João! Analisei todas as cláusulas e assinei digitalmente no app.',
          time: '07:20'
        }
      ]
    },
    pick: {
      'marta.almeida@gmail.com': 't1'
    }
  };

  saveDatabase(db);
  return db;
}

export function saveDatabase(db: VespDatabase): void {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
    const legacy = {
      users: db.users.map(u => ({ n: u.n, email: u.email, pw: u.pwHash, role: u.role })),
      s: db.currentSession,
      kids: db.kids,
      plan: {},
      pays: db.payments,
      chat: db.chat,
      pick: db.pick
    };
    localStorage.setItem(LEGACY_KEY, JSON.stringify(legacy));
  } catch (err) {
    console.error('Error saving DB:', err);
  }
}

export function logAudit(
  db: VespDatabase,
  actorEmail: string,
  actorRole: string,
  action: string,
  details: string
): void {
  const item: AuditLogItem = {
    id: 'aud_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 5),
    actorEmail,
    actorRole,
    action,
    details,
    timestamp: new Date().toLocaleString('pt-BR')
  };
  db.auditLogs.unshift(item);
  saveDatabase(db);
}
