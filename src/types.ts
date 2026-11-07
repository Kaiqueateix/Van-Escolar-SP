export type UserRole = 'c' | 't' | 'a'; // c = cliente/pai, t = transportador, a = admin

export type SubscriptionTier = 'free' | 'pro' | 'premium';

export interface DocumentItem {
  id: string;
  name: string;
  type: 'cnh' | 'curso' | 'alvara_dtp' | 'vistoria' | 'seguro_app' | 'qr_code_prefeitura';
  fileName?: string;
  fileUrl?: string;
  submittedAt?: string;
  verifiedAt?: string;
  status: 'pendente' | 'aprovado' | 'reprovado' | 'nao_enviado';
  notes?: string;
}

export interface BankAccountInfo {
  accountHolder: string;
  cpfCnpj: string;
  bankName: string;
  bankCode?: string;
  accountType: 'corrente' | 'poupanca';
  agency: string;
  accountNumber: string;
  pixKeyType: 'cpf' | 'cnpj' | 'email' | 'telefone' | 'aleatoria';
  pixKey: string;
}

export interface TransporterVerification {
  status: 'nao_solicitado' | 'pendente' | 'aprovado' | 'reprovado' | 'documentacao_pendente';
  submittedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  cnhNumber?: string;
  cnhCategory?: string; // D ou E com EAR
  hasCourse: boolean;
  dtpNumber?: string;
  qrCodeUrl?: string;
  inspectionDate?: string;
  insurancePolicy?: string;
  documents: DocumentItem[];
}

export interface SchoolScheduleItem {
  schoolName: string;
  morningEntry: string; // Ex: 07:30
  morningExit: string;  // Ex: 12:15
  afternoonEntry: string; // Ex: 13:00
  afternoonExit: string;  // Ex: 17:30
}

export interface TransporterProfile {
  id: string; // matches user email or id
  name: string;
  email: string;
  phone: string;
  nickname?: string;
  photoUrl: string;
  bio: string;
  experienceYears: number;
  vanBrand?: string;
  vanModel: string;
  vanYear: number;
  vanPlate: string;
  seatsTotal: number;
  seatsAvailable: number;
  regions: number[]; // indices of R array
  schools: number[]; // indices of SC array
  schoolSchedules?: SchoolScheduleItem[]; // Specific schools and schedules attended
  serviceTypes?: string[]; // ['Escolar Regular', 'Passeios e Excursões', 'Eventos de Fim de Semana']
  basePrice?: number;
  rating: number;
  reviewsCount: number;
  isVerified: boolean;
  verification: TransporterVerification;
  subscriptionTier: SubscriptionTier;
  isSponsored?: boolean;
  amenities: string[];
  vanPhotos: string[]; // Minimum 4 photos
  bankAccount?: BankAccountInfo;
  schoolsAttended?: string;
  neighborhoodsAttended?: string;
}

export interface AuthorizedReceiver {
  name: string;
  relation: string;
  document: string;
  phone: string;
  isPrimary?: boolean;
}

export type TravelStage = 1 | 2 | 3 | 4 | 5 | 6;

export interface Child {
  id: string;
  n: string; // Nome completo
  i: number | string; // Idade
  birthDate?: string; // Data de nascimento YYYY-MM-DD
  grade?: string; // Série/ano escolar: "1º Ano Fundamental", etc.
  allergies?: string; // Informações sobre alergias
  medicalNotes?: string; // Informações médicas ou outras observações importantes
  e: string; // Escola onde estuda
  d: string; // Endereço de embarque
  dropoffAddress?: string; // Endereço de desembarque (se diferente)
  neighborhood?: string;
  region?: string;
  r: string; // Responsável
  t: string; // Telefone do responsável
  emergencyPhone?: string; // Telefone de emergência secundário
  o: string; // Observações / cuidados
  pg: number; // 1 = pago, 0 = pendente, 2 = abonado, -1 = atrasado
  paymentStatus?: 'pago' | 'pendente' | 'abonado' | 'atrasado';
  valor?: number;
  pgAt?: string | number;
  guardianEmail?: string;
  authorizedReceivers?: AuthorizedReceiver[];
  allowUnaccompaniedDropoff?: boolean; // Permissão para deixar desacompanhado sem responsável
  unaccompaniedNotes?: string;
  isPresentToday?: boolean; // Registro de presença: Veio à escola (true) ou Falta (false)
  absenceReason?: string;
  checkedInMorning?: boolean;
  checkedInSchool?: boolean;
  checkedInAfternoon?: boolean;
  checkedInDelivered?: boolean;
  travelStage?: TravelStage;
  stageUpdatedAt?: string;
}

export interface ContractProposal {
  id: string;
  transporterEmail: string;
  transporterName: string;
  transporterCpfCnpj?: string;
  transporterAddress?: string;
  transporterPhone?: string;
  parentEmail: string;
  parentName: string;
  parentCpf?: string;
  parentAddress?: string;
  parentPhone?: string;
  childName: string;
  childBirthDate?: string;
  childGrade?: string;
  schoolName: string;
  pickupAddress: string;
  dropoffAddress?: string;
  agreedMonthlyValue: number;
  paymentDueDay?: number; // Ex: dia 5 ou dia 10
  paymentMethod?: string;
  period: 'Manhã' | 'Tarde' | 'Integral';
  entryTime?: string;
  exitTime?: string;
  contractTermMonths: number;
  startDate: string;
  endDate?: string;
  lateFeeClause?: string; // Regras de 1 semana juros, 30 dias rescisão/serasa
  cancellationNoticeDays?: number;
  clauses: string[];
  status: 'proposta_enviada' | 'revisado_pelo_pai' | 'assinado_ativo' | 'cancelado' | 'recusado';
  parentSignature?: {
    signedName: string;
    parentCpf: string;
    signedAt: string;
    ipAddress?: string;
    confirmedInUI?: boolean;
  };
  transporterSignature?: {
    signedName: string;
    transporterCpf: string;
    signedAt: string;
  };
  rejectionReason?: string;
  createdAt: string;
}

export interface UserAddress {
  street: string;
  number: string;
  complement?: string;
  cep: string;
  neighborhood: string;
  city: string;
}

export interface User {
  id: string;
  n: string;
  email: string;
  pwHash: string;
  role: UserRole;
  photoUrl?: string;
  phone?: string;
  cpf?: string;
  cpfCnpj?: string;
  birthDate?: string;
  calculatedAge?: number;
  nickname?: string;
  address?: UserAddress;
  referralCode?: string;
  referredBy?: string;
  referralRewardsCount?: number;
  referralsList?: { email: string; name: string; subscribedPro: boolean; rewardClaimed: boolean; date: string }[];
  parentRatingAverage?: number;
  parentRatingCount?: number;
  createdAt: string;
  acceptedLGPD?: boolean;
  acceptedAt?: string;
  acceptedVersion?: string;
  status: 'ativo' | 'suspenso' | 'bloqueado_serasa';
  bankAccount?: BankAccountInfo;
  subscriptionTier?: SubscriptionTier;
  children?: Child[];
  isFirebaseUser?: boolean;
}

export interface ParentReviewByTransporter {
  id: string;
  transporterEmail: string;
  transporterName: string;
  parentEmail: string;
  parentName: string;
  rating?: number;
  punctualityScore?: number;
  paymentScore?: number;
  communicationScore?: number;
  punctualityRating?: number;
  paymentRating?: number;
  communicationRating?: number;
  comment: string;
  date?: string;
  createdAt?: string;
  status: 'pendente_moderacao' | 'aprovado' | 'rejeitado' | 'reprovado';
}

export interface PaymentRecord {
  id: string;
  from: string;
  fromEmail: string;
  to: string;
  toName: string;
  v: number;
  m: 'Pix' | 'Cartão' | 'Dinheiro' | 'Boleto' | 'Abonada';
  d: string;
  dueDate: string;
  status: 'pago' | 'pendente' | 'processando' | 'nao_identificado' | 'recusado' | 'atrasado' | 'abonado' | 'bloqueado_serasa';
  daysOverdue?: number;
  interestAmount?: number;
  pixCode?: string;
  receiptNumber?: string;
  gatewayAuthCode?: string;
  paidAt?: string;
  notes?: string;
}

export interface TransferRecord {
  id: string;
  transporterEmail: string;
  transporterName: string;
  grossAmount: number;
  platformFee: number;
  platformFeePercent: number;
  netAmount: number;
  bankAccount: string;
  pixKey: string;
  transferType: 'Pix' | 'TED';
  status: 'liquidado' | 'processando' | 'agendado';
  clearedAt: string;
  endToEndId: string;
  receiptNumber: string;
  bacenAuthCode?: string;
}

export interface ExpenseRecord {
  id: string;
  transporterEmail: string;
  category: 'Combustível' | 'Manutenção' | 'Seguro' | 'Licenciamento / DTP' | 'Pneus' | 'Pedágio' | 'Estacionamento' | 'Outros';
  amount: number;
  date: string;
  description: string;
  receiptUrl?: string;
}

export interface VanMaintenance {
  transporterEmail: string;
  model: string;
  year: number;
  plate: string;
  currentKm: number;
  lastOilKm: number;
  nextOilKm: number;
  tiresCondition: 'Ótimo' | 'Bom' | 'Atenção' | 'Troca Urgente';
  brakesCondition: 'Revisados' | 'Bom' | 'Desgastados';
  lastInspectionDate: string;
  nextInspectionDate: string;
  dtpExpiryDate: string;
  crlvExpiryDate: string;
  notes?: string;
}

export interface NewStudentOpportunity {
  id: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  childName: string;
  grade?: string;
  school: string;
  pickupAddress?: string;
  dropoffAddress?: string;
  neighborhood: string;
  region: string;
  desiredSchedule: 'Manhã' | 'Tarde' | 'Integral';
  entryTime?: string;
  exitTime?: string;
  childCount: number;
  startDate: string;
  distanceKm?: number;
  notes?: string;
  status: 'aguardando_analise' | 'aprovada' | 'reprovada' | 'aguardando_correcao' | 'aberta' | 'em_atendimento' | 'fechada';
  rejectionReason?: string;
  moderatedAt?: string;
  moderatedBy?: string;
  interestedTransporters: string[];
  createdAt: string;
}

export interface BroadcastNotice {
  id: string;
  transporterEmail: string;
  transporterName: string;
  category: 'Atraso' | 'Mudança de Horário' | 'Feriado' | 'Problema Mecânico' | 'Alteração de Rota' | 'Geral';
  title: string;
  message: string;
  createdAt: string;
  priority: 'normal' | 'alta' | 'urgente';
}

export interface CharterRequest {
  id: string;
  requesterName: string;
  requesterEmail: string;
  requesterPhone: string;
  destination: string;
  departure: string;
  date: string;
  time: string;
  passengersCount: number;
  purpose: 'Passeio Escolar' | 'Excursão' | 'Atividade Extracurricular' | 'Festa / Evento' | 'Outro';
  notes: string;
  createdAt: string;
  status: 'pendente' | 'respondido';
}

export interface VerifiedReview {
  id: string;
  transporterId: string;
  parentName: string;
  parentEmail: string;
  rating: number; // 1 to 5
  comment: string;
  date: string;
  verifiedHire: boolean;
  reply?: string;
  status: 'pendente_moderacao' | 'aprovado' | 'rejeitado';
}

export interface ServicePartnerItem {
  id: string;
  name: string;
  category: 'mecanicos' | 'funileiro' | 'tapeceiros' | 'auto_pecas' | 'vans_locacao' | 'motorista_freelancer';
  region: string;
  specialty: string;
  address: string;
  phone: string;
  rating: number;
  discountDeal?: string;
  isVerifiedPartner: boolean;
  requiresPro?: boolean;
}

export interface PartnerPromotion {
  id: string;
  partnerId?: string;
  partnerName: string;
  category: 'mecanicos' | 'funileiro' | 'tapeceiros' | 'auto_pecas' | 'vans_locacao' | 'pneus';
  title: string;
  discountBadge: string;
  description: string;
  validUntil: string;
  couponCode?: string;
  contactPhone?: string;
  active: boolean;
  isActive?: boolean;
}

export interface FreelanceDriver {
  id: string;
  name: string;
  nickname: string;
  phone: string;
  whatsapp: string;
  photoUrl: string;
  cnhCategory: string; // Ex: D com EAR
  dtpRegistration: string;
  region: string;
  experienceYears: number;
  availableDays: string; // Ex: "Segunda a Sexta (Manhã e Tarde)" ou "Sob aviso prévio"
  dailyRate: number;
  bio: string;
  rating: number;
  verifiedDtp: boolean;
}

export interface School {
  id: string;
  name: string;
  address: string;
  cep: string;
  neighborhood: string;
  city: string;
  type: 'municipal' | 'estadual' | 'creche' | 'particular';
  levels: ('infantil' | 'fundamental' | 'medio')[];
  contactPhone?: string;
}

export interface BoardingStop {
  id: string;
  childId: string;
  childName: string;
  guardianName: string;
  guardianPhone: string;
  type: 'embarque' | 'desembarque';
  address: string;
  neighborhood: string;
  schoolName: string;
  order: number;
  scheduledTime: string;
  estimatedArrival: string;
  actualArrival?: string;
  status: 'pendente' | 'a_caminho' | 'chegou' | 'embarcou' | 'nao_embarcou';
  waitSeconds?: number;
  skippedReason?: string;
  unaccompaniedAuthorized?: boolean;
  notes?: string;
}

export interface BoardingEvent {
  id: string;
  timestamp: string;
  childId: string;
  childName: string;
  guardianPhone: string;
  transporterEmail: string;
  transporterName: string;
  type: 'embarcou' | 'nao_embarcou';
  waitDurationSeconds: number;
  address: string;
  notes?: string;
}

export interface SubscriptionContract {
  id: string;
  transporterEmail: string;
  transporterName: string;
  driverEmail?: string;
  driverName?: string;
  transporterCpfCnpj: string;
  tier: SubscriptionTier;
  monthlyPrice: number;
  cardHolder: string;
  cardLast4: string;
  billingDay: number;
  signedName: string;
  signedCpf: string;
  signedAt: string;
  status: 'ativo' | 'cancelado' | 'atrasado';
}

export interface ReportTicket {
  id: string;
  reporterEmail: string;
  reporterName: string;
  targetTransporterId: string;
  transporterName: string;
  reason: string;
  details: string;
  status: 'pendente' | 'em_analise' | 'resolvido';
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  actorEmail: string;
  actorRole: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface ChatMsg {
  id: string;
  f: 'me' | 't' | 'system';
  senderName?: string;
  x: string;
  imageUrl?: string;
  contractProposalId?: string;
  time: string;
}
