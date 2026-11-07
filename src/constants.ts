import {
  TransporterProfile,
  Child,
  TravelStage,
  ServicePartnerItem,
  PartnerPromotion,
  ContractProposal,
  School,
  FreelanceDriver,
  BoardingStop
} from './types';

export const REGIONS: string[] = [
  "Zona Sul",
  "Zona Norte",
  "Zona Leste",
  "Zona Oeste",
  "Centro",
  "Grande ABC"
];

export const SCHOOLS: string[] = [
  "EMEF Santa Rita",
  "Colégio Objetivo Paulista",
  "Escola Vera Cruz",
  "Colégio São Luís",
  "EE Padre Anchieta",
  "Colégio Anglo Tatuapé",
  "Colégio Santa Cruz",
  "Colégio Marista Arquidiocesano",
  "Colégio Bandeirantes",
  "Colégio Santo Américo"
];

export const TRAVEL_STAGES: { stage: TravelStage; label: string; desc: string; icon: string }[] = [
  { stage: 1, label: "A caminho da criança", desc: "A van iniciou o trajeto até a residência da criança", icon: "🚐" },
  { stage: 2, label: "Chegando ao embarque", desc: "A van está a menos de 5 minutos do portão", icon: "📍" },
  { stage: 3, label: "Criança embarcou", desc: "Embarque concluído com segurança e cinto afivelado", icon: "🎒" },
  { stage: 4, label: "Chegou à escola", desc: "A criança foi entregue à equipe da escola com sucesso", icon: "🏫" },
  { stage: 5, label: "Iniciou o retorno", desc: "Saída da escola em direção ao local de desembarque", icon: "🔄" },
  { stage: 6, label: "Criança desembarcou", desc: "Desembarque confirmado por pessoa autorizada", icon: "🏠" },
];

export const SERVICE_PARTNERS: ServicePartnerItem[] = [
  // 1. Mecânicos
  {
    id: "p_mec1",
    name: "Diesel Center Tatuapé",
    category: "mecanicos",
    region: "Zona Leste",
    specialty: "Injeção eletrônica Common Rail, turbinas e cabeçote Sprinter/Master",
    address: "Rua Tuiuti, 1840 - Tatuapé",
    phone: "(11) 2294-1010",
    rating: 4.9,
    discountDeal: "15% de desconto em mão de obra para transportadores credenciados",
    isVerifiedPartner: true
  },
  {
    id: "p_mec2",
    name: "Mecânica Pé na Estrada",
    category: "mecanicos",
    region: "Zona Sul",
    specialty: "Freios pneumáticos, suspensão reforçada e troca de embreagem",
    address: "Av. Cupecê, 3200 - Cidade Ademar",
    phone: "(11) 5581-2020",
    rating: 4.8,
    discountDeal: "Check-up de freios e suspensão gratuito a cada 6 meses",
    isVerifiedPartner: true
  },
  {
    id: "p_mec3",
    name: "Auto Diesel Santana",
    category: "mecanicos",
    region: "Zona Norte",
    specialty: "Revisão preventiva rápida para não parar a rota escolar",
    address: "Av. Cruzeiro do Sul, 2450 - Santana",
    phone: "(11) 2959-3030",
    rating: 4.7,
    discountDeal: "10% de desconto em peças e filtros originais",
    isVerifiedPartner: true
  },

  // 2. Funileiro
  {
    id: "p_fun1",
    name: "Funilaria & Pintura Van Express SP",
    category: "funileiro",
    region: "Zona Sul",
    specialty: "Pintura padrão DTP faixa amarela escolar, reparo de parachoques e retoques rápidos",
    address: "Av. Washington Luís, 1420 - Santo Amaro",
    phone: "(11) 5523-4040",
    rating: 4.9,
    discountDeal: "Faixa amarela escolar regulamentada DTP por preço tabelado com 20% OFF",
    isVerifiedPartner: true
  },
  {
    id: "p_fun2",
    name: "Centro de Estética & Lataria Ipiranga",
    category: "funileiro",
    region: "Centro",
    specialty: "Martelinho de ouro, alinhamento de chassi e polimento técnico",
    address: "Rua Silva Bueno, 890 - Ipiranga",
    phone: "(11) 2063-7070",
    rating: 4.8,
    discountDeal: "Atendimento prioritário de fim de semana para não perder dia letivo",
    isVerifiedPartner: true
  },

  // 3. Tapeceiros
  {
    id: "p_tap1",
    name: "Tapeçaria Estrela das Vans",
    category: "tapeceiros",
    region: "Zona Leste",
    specialty: "Revestimento de bancos com curvim náutico higienizável e cintos retráteis",
    address: "Av. Radial Leste, altura 4300 - Belenzinho",
    phone: "(11) 2694-8800",
    rating: 5.0,
    discountDeal: "Troca de espumas e reparo de encosto com 15% de desconto",
    isVerifiedPartner: true
  },
  {
    id: "p_tap2",
    name: "Tapeçaria e Acessórios Zona Oeste",
    category: "tapeceiros",
    region: "Zona Oeste",
    specialty: "Forração térmica de teto, cortinas antichamas e capas laváveis",
    address: "Rua Guaicurus, 740 - Lapa",
    phone: "(11) 3871-3322",
    rating: 4.7,
    discountDeal: "Jogo completo de capas reforçadas com 25% de desconto",
    isVerifiedPartner: true
  },

  // 4. Auto Peças
  {
    id: "p_pec1",
    name: "Distribuidora Van Peças SP",
    category: "auto_pecas",
    region: "Centro",
    specialty: "Pastilhas Fras-le, discos Bosch, amortecedores Monroe e embreagens Sachs",
    address: "Rua Duque de Caxias, 510 - Santa Ifigênia",
    phone: "(11) 3331-5050",
    rating: 4.9,
    discountDeal: "Tabela frotista para qualquer compra com CNPJ ou Alvará DTP",
    isVerifiedPartner: true
  },
  {
    id: "p_pec2",
    name: "Pneus & Tacógrafos Paulistano",
    category: "auto_pecas",
    region: "Grande ABC",
    specialty: "Pneus de carga Michelin Agilis e Pirelli Chrono, fitas de tacógrafo e bobinas",
    address: "Av. dos Estados, 6100 - Santo André",
    phone: "(11) 4992-1212",
    rating: 4.8,
    discountDeal: "Montagem, balanceamento e bicos grátis na troca de 4 pneus",
    isVerifiedPartner: true
  },

  // 5. Vans para Locação
  {
    id: "p_loc1",
    name: "Locadora Escolar Paulistana (Van Reserva)",
    category: "vans_locacao",
    region: "Zona Sul",
    specialty: "Vans prontas com faixa amarela DTP e seguro escolar para substituição rápida",
    address: "Av. Interlagos, 2150 - Campo Grande",
    phone: "(11) 5686-9090",
    rating: 4.9,
    discountDeal: "Tarifa de emergência de R$ 160/dia para assinantes do app",
    isVerifiedPartner: true
  },
  {
    id: "p_loc2",
    name: "SP Minibus Rental & Fretamento",
    category: "vans_locacao",
    region: "Zona Norte",
    specialty: "Mercedes Sprinter 415 e Renault Master 16 lugares 2021 revisadas",
    address: "Av. Braz Leme, 1200 - Casa Verde",
    phone: "(11) 2236-4444",
    rating: 4.8,
    discountDeal: "Sem caução abusivo para motoristas cadastrados e verificados",
    isVerifiedPartner: true
  }
];

export const INITIAL_PARTNER_PROMOTIONS: PartnerPromotion[] = [
  {
    id: "promo1",
    partnerName: "Distribuidora Van Peças SP",
    category: "auto_pecas",
    title: "Kit Freio Completo (Pastilhas + Discos) Sprinter & Master",
    discountBadge: "30% OFF",
    description: "Desconto especial de início de semestre escolar para todas as vans cadastradas. Inclui pastilhas cerâmicas e discos ventilados.",
    validUntil: "30/11/2026",
    couponCode: "VANSP30",
    contactPhone: "(11) 3331-5050",
    active: true
  },
  {
    id: "promo2",
    partnerName: "Funilaria & Pintura Van Express SP",
    category: "funileiro",
    title: "Aplicação de Faixa Amarela Regulamentada DTP",
    discountBadge: "R$ 150 OFF",
    description: "Faixa amarela com vinil reflexivo 3M homologado pelo DTP e pintura de inscrição 'ESCOLAR'.",
    validUntil: "15/12/2026",
    couponCode: "FAIXADTP",
    contactPhone: "(11) 5523-4040",
    active: true
  },
  {
    id: "promo3",
    partnerName: "Pneus & Tacógrafos Paulistano",
    category: "pneus",
    title: "Combo 4 Pneus Michelin Agilis 225/75 R16",
    discountBadge: "4x R$ 680 + Montagem Grátis",
    description: "Alta durabilidade e segurança para transporte escolar na chuva. Balanceamento laser incluso.",
    validUntil: "05/12/2026",
    couponCode: "MICHELINVAN",
    contactPhone: "(11) 4992-1212",
    active: true
  }
];

export const INITIAL_TRANSPORTERS: TransporterProfile[] = [
  {
    id: "t1",
    email: "joao.batista@vanescolar.sp",
    name: "João Batista",
    phone: "(11) 98122-3344",
    photoUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80",
    bio: "Mais de 14 anos conduzindo com segurança e carinho as crianças de São Paulo. Veículo novo com monitora escolar credenciada.",
    experienceYears: 14,
    vanModel: "Mercedes Sprinter 415",
    vanYear: 2020,
    vanPlate: "BRA-4E20",
    seatsTotal: 16,
    seatsAvailable: 3,
    regions: [0, 3], // Zona Sul, Zona Oeste
    schools: [0, 1, 3], // EMEF Santa Rita, Colégio Objetivo Paulista, Colégio São Luís
    schoolSchedules: [
      { schoolName: "EMEF Santa Rita", morningEntry: "07:45", morningExit: "12:15", afternoonEntry: "13:00", afternoonExit: "17:30" },
      { schoolName: "Colégio Objetivo Paulista", morningEntry: "07:30", morningExit: "12:30", afternoonEntry: "13:15", afternoonExit: "18:00" },
      { schoolName: "Colégio São Luís", morningEntry: "07:30", morningExit: "12:40", afternoonEntry: "13:15", afternoonExit: "17:45" }
    ],
    basePrice: 420,
    rating: 4.9,
    reviewsCount: 38,
    isVerified: true,
    verification: {
      status: "aprovado",
      submittedAt: "2026-02-10",
      reviewedAt: "2026-02-12",
      reviewedBy: "Admin DTP SP",
      cnhCategory: "D (com EAR)",
      cnhNumber: "04982719231",
      hasCourse: true,
      dtpNumber: "DTP-SP 89.214/2026",
      inspectionDate: "2026-01-15",
      insurancePolicy: "Porto Seguro APP R$ 500.000",
      documents: [
        { id: "d1", name: "CNH Categoria D (com EAR)", type: "cnh", status: "aprovado", verifiedAt: "2026-02-12" },
        { id: "d2", name: "Curso Especial de Transporte Escolar (Res. 789/Contran)", type: "curso", status: "aprovado", verifiedAt: "2026-02-12" },
        { id: "d3", name: "Alvará Escolar DTP / Prefeitura de SP", type: "alvara_dtp", status: "aprovado", verifiedAt: "2026-02-12" },
        { id: "d4", name: "Laudo Vistoria Semestral (ITL/Inmetro)", type: "vistoria", status: "aprovado", verifiedAt: "2026-02-12" },
        { id: "d5", name: "Apólice Seguro APP Passageiros", type: "seguro_app", status: "aprovado", verifiedAt: "2026-02-12" }
      ]
    },
    subscriptionTier: "premium",
    isSponsored: true,
    amenities: ["Ar-condicionado", "Câmera Interna", "Cinto 3 pontos", "Monitor a bordo", "Wi-Fi"],
    vanPhotos: [
      "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=600&auto=format&fit=crop&q=80"
    ]
  },
  {
    id: "t2",
    email: "marcia.souza@vanescolar.sp",
    name: "Márcia Souza",
    phone: "(11) 97233-4455",
    photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    bio: "Pedagoga de formação e transportadora escolar há 8 anos na Zona Norte. Pontualidade rigorosa e acolhimento humanizado.",
    experienceYears: 8,
    vanModel: "Fiat Ducato Minibus",
    vanYear: 2019,
    vanPlate: "SPM-2938",
    seatsTotal: 15,
    seatsAvailable: 1,
    regions: [1], // Zona Norte
    schools: [2, 4],
    schoolSchedules: [
      { schoolName: "Escola Vera Cruz", morningEntry: "07:45", morningExit: "12:15", afternoonEntry: "13:15", afternoonExit: "17:45" },
      { schoolName: "EE Padre Anchieta", morningEntry: "07:00", morningExit: "12:00", afternoonEntry: "13:00", afternoonExit: "18:00" }
    ],
    basePrice: 380,
    rating: 4.8,
    reviewsCount: 29,
    isVerified: true,
    verification: {
      status: "aprovado",
      submittedAt: "2026-03-01",
      reviewedAt: "2026-03-03",
      reviewedBy: "Admin DTP SP",
      cnhCategory: "D",
      hasCourse: true,
      dtpNumber: "DTP-SP 74.312/2026",
      inspectionDate: "2026-01-20",
      documents: [
        { id: "d21", name: "CNH D com EAR", type: "cnh", status: "aprovado" },
        { id: "d22", name: "Curso de Transporte Escolar", type: "curso", status: "aprovado" },
        { id: "d23", name: "Alvará DTP", type: "alvara_dtp", status: "aprovado" },
        { id: "d24", name: "Vistoria Semestral", type: "vistoria", status: "aprovado" }
      ]
    },
    subscriptionTier: "pro",
    isSponsored: false,
    amenities: ["Ar-condicionado", "Cinto 3 pontos", "Monitor a bordo"],
    vanPhotos: []
  },
  {
    id: "t3",
    email: "carlos.pereira@vanescolar.sp",
    name: "Carlos Pereira",
    phone: "(11) 96344-5566",
    photoUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80",
    bio: "Atendendo a Zona Leste e Grande ABC com frota revisada semanalmente. Equipada com som ambiente infantil e ar condicionado.",
    experienceYears: 10,
    vanModel: "Renault Master Minibus",
    vanYear: 2021,
    vanPlate: "RIO-5F12",
    seatsTotal: 16,
    seatsAvailable: 5,
    regions: [2, 5],
    schools: [5, 0],
    schoolSchedules: [
      { schoolName: "Colégio Anglo Tatuapé", morningEntry: "07:30", morningExit: "12:30", afternoonEntry: "13:00", afternoonExit: "17:45" },
      { schoolName: "EMEF Santa Rita", morningEntry: "07:45", morningExit: "12:15", afternoonEntry: "13:00", afternoonExit: "17:30" }
    ],
    basePrice: 450,
    rating: 4.7,
    reviewsCount: 22,
    isVerified: true,
    verification: {
      status: "aprovado",
      submittedAt: "2026-01-25",
      reviewedAt: "2026-01-28",
      reviewedBy: "Admin DTP SP",
      cnhCategory: "D",
      hasCourse: true,
      dtpNumber: "DTP-SP 91.503/2026",
      documents: [
        { id: "d31", name: "CNH D com EAR", type: "cnh", status: "aprovado" },
        { id: "d32", name: "Curso Especializado", type: "curso", status: "aprovado" },
        { id: "d33", name: "Alvará DTP", type: "alvara_dtp", status: "aprovado" }
      ]
    },
    subscriptionTier: "pro",
    isSponsored: false,
    amenities: ["Ar-condicionado", "Câmera Interna", "Cinto 3 pontos", "Monitor a bordo"],
    vanPhotos: []
  },
  {
    id: "t4",
    email: "edna.ribeiro@vanescolar.sp",
    name: "Edna Ribeiro",
    phone: "(11) 95455-6677",
    photoUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    bio: "Condução escolar familiar, cuidadosa e 100% pontual. Monitora dedicada cuidando do embarque até a porta da sala.",
    experienceYears: 18,
    vanModel: "Mercedes Sprinter 415",
    vanYear: 2018,
    vanPlate: "FLA-9B33",
    seatsTotal: 16,
    seatsAvailable: 0,
    regions: [0, 4],
    schools: [1, 3, 4],
    schoolSchedules: [
      { schoolName: "Colégio Objetivo Paulista", morningEntry: "07:30", morningExit: "12:30", afternoonEntry: "13:15", afternoonExit: "18:00" },
      { schoolName: "Colégio São Luís", morningEntry: "07:30", morningExit: "12:40", afternoonEntry: "13:15", afternoonExit: "17:45" },
      { schoolName: "EE Padre Anchieta", morningEntry: "07:00", morningExit: "12:00", afternoonEntry: "13:00", afternoonExit: "18:00" }
    ],
    basePrice: 400,
    rating: 5.0,
    reviewsCount: 45,
    isVerified: true,
    verification: {
      status: "aprovado",
      submittedAt: "2026-01-10",
      reviewedAt: "2026-01-11",
      reviewedBy: "Admin DTP SP",
      cnhCategory: "D",
      hasCourse: true,
      dtpNumber: "DTP-SP 65.419/2026",
      documents: [
        { id: "d41", name: "CNH Categoria D", type: "cnh", status: "aprovado" },
        { id: "d42", name: "Certificado Curso Escolar", type: "curso", status: "aprovado" },
        { id: "d43", name: "Alvará Prefeitura", type: "alvara_dtp", status: "aprovado" }
      ]
    },
    subscriptionTier: "free",
    isSponsored: false,
    amenities: ["Ar-condicionado", "Monitor a bordo", "Cinto 3 pontos"],
    vanPhotos: []
  }
];

export const INITIAL_KIDS: Child[] = [
  {
    id: "k1",
    n: "Lucas Almeida",
    i: 8,
    e: "EMEF Santa Rita",
    d: "Rua das Acácias, 120 - Jabaquara",
    neighborhood: "Jabaquara",
    region: "Zona Sul",
    r: "Marta Almeida",
    t: "(11) 98811-2233",
    o: "Alergia a amendoim. Medicamento antialérgico na mochila.",
    pg: 1,
    paymentStatus: 'pago',
    guardianEmail: "marta.almeida@gmail.com",
    allowUnaccompaniedDropoff: false,
    isPresentToday: true,
    travelStage: 3,
    stageUpdatedAt: "07:35",
    authorizedReceivers: [
      { name: "Marta Almeida (Mãe)", relation: "Mãe", document: "34.891.204-1", phone: "(11) 98811-2233", isPrimary: true },
      { name: "Vó Benedita", relation: "Avó", document: "12.445.890-0", phone: "(11) 97722-1100" }
    ]
  },
  {
    id: "k2",
    n: "Sofia Lima",
    i: 10,
    e: "Colégio São Luís",
    d: "Av. Cupecê, 800 - Cidade Ademar",
    neighborhood: "Cidade Ademar",
    region: "Zona Sul",
    r: "Paulo Lima",
    t: "(11) 97722-3344",
    o: "Tem refluxo matinal. Senta nos bancos dianteiros.",
    pg: 0,
    paymentStatus: 'pendente',
    guardianEmail: "paulo.lima@gmail.com",
    allowUnaccompaniedDropoff: true,
    unaccompaniedNotes: "Criança possui chave da residência e o condomínio tem portaria 24h autorizada.",
    isPresentToday: true,
    travelStage: 1,
    stageUpdatedAt: "07:15",
    authorizedReceivers: [
      { name: "Paulo Lima (Pai)", relation: "Pai", document: "29.301.884-2", phone: "(11) 97722-3344", isPrimary: true },
      { name: "Rosana Lima (Mãe)", relation: "Mãe", document: "31.902.112-9", phone: "(11) 97722-3345" }
    ]
  },
  {
    id: "k3",
    n: "Pedro Rocha",
    i: 7,
    e: "EMEF Santa Rita",
    d: "Rua Gaivota, 55 - Moema",
    neighborhood: "Moema",
    region: "Zona Sul",
    r: "Ana Rocha",
    t: "(11) 96633-4455",
    o: "Usa óculos de grau. Muito comunicativo.",
    pg: 0,
    paymentStatus: 'pendente',
    guardianEmail: "ana.rocha@gmail.com",
    allowUnaccompaniedDropoff: false,
    isPresentToday: false,
    absenceReason: "Consulta médica com pediatra",
    travelStage: 1,
    stageUpdatedAt: "07:15",
    authorizedReceivers: [
      { name: "Ana Rocha", relation: "Mãe", document: "28.490.113-X", phone: "(11) 96633-4455", isPrimary: true },
      { name: "Tio Jorge (Padrinho)", relation: "Tio", document: "25.109.432-8", phone: "(11) 99881-2299" }
    ]
  }
];

export const INITIAL_OPPORTUNITIES = [
  {
    id: "opp1",
    parentName: "Juliana Mendes",
    parentEmail: "juliana.mendes@gmail.com",
    parentPhone: "(11) 98765-4321",
    childName: "Enzo (6 anos)",
    school: "Colégio São Luís",
    neighborhood: "Bela Vista / Consolação",
    region: "Centro",
    desiredSchedule: "Manhã" as const,
    childCount: 1,
    startDate: "Imediato",
    distanceKm: 1.8,
    notes: "Procuramos van com monitora escolar a bordo.",
    status: "aberta" as const,
    interestedTransporters: [],
    createdAt: "Hoje às 08:10"
  },
  {
    id: "opp2",
    parentName: "Rodrigo Toledo",
    parentEmail: "rodrigo.toledo@gmail.com",
    parentPhone: "(11) 97654-3210",
    childName: "Manuela e Gabriel (8 e 10 anos)",
    school: "EMEF Santa Rita",
    neighborhood: "Saúde / Praça da Árvore",
    region: "Zona Sul",
    desiredSchedule: "Tarde" as const,
    childCount: 2,
    startDate: "Próxima segunda",
    distanceKm: 2.4,
    notes: "Necessário ar-condicionado. Horário de entrada 13:00.",
    status: "aberta" as const,
    interestedTransporters: ["joao.batista@vanescolar.sp"],
    createdAt: "Ontem às 17:40"
  },
  {
    id: "opp3",
    parentName: "Camila Nogueira",
    parentEmail: "camila.nog@gmail.com",
    parentPhone: "(11) 96543-2109",
    childName: "Theo (7 anos)",
    school: "Colégio Anglo Tatuapé",
    neighborhood: "Anália Franco",
    region: "Zona Leste",
    desiredSchedule: "Manhã" as const,
    childCount: 1,
    startDate: "Início do próximo mês",
    distanceKm: 3.1,
    notes: "Preferência por van com seguro APP confirmado.",
    status: "aberta" as const,
    interestedTransporters: [],
    createdAt: "Há 2 dias"
  }
];

export const DEFAULT_CONTRACT_CLAUSES = [
  "Cláusula 1ª - DO OBJETO: O presente instrumento tem como objeto a prestação de serviços de transporte escolar diário da criança indicada, no itinerário fixado entre o endereço de residência e o estabelecimento de ensino.",
  "Cláusula 2ª - DA REGULARIDADE: O TRANSPORTADOR declara que o veículo utilizado atende a todas as exigências das normas municipais e do DTP/Detran, estando com vistoria técnica semestral vigente, tacógrafo aferido e seguro de responsabilidade civil/APP com cobertura aos passageiros.",
  "Cláusula 3ª - DOS HORÁRIOS: O CONTRATANTE se compromete a ter a criança pontualmente pronta no horário combinado de embarque na calçada ou portão, respeitando a tolerância máxima estipulada de 3 (três) minutos.",
  "Cláusula 4ª - DA TOLERÂNCIA DE 3 MINUTOS: Decorrido o prazo improrrogável de 3 minutos de espera sem o comparecimento do aluno, o transportador seguirá a rota para não prejudicar os demais passageiros, sendo registrado o não comparecimento.",
  "Cláusula 5ª - DO VALOR E VENCIMENTO: Pela prestação dos serviços, o CONTRATANTE pagará mensalmente o valor acordado até o dia de vencimento estipulado.",
  "Cláusula 6ª - DO ATRASO E ENCARGOS: O atraso superior a 7 (sete) dias acarretará multa moratória de 2% (dois por cento) sobre o valor da mensalidade e juros de 1% (um por cento) ao mês de atraso.",
  "Cláusula 7ª - DA RESCISÃO POR INADIMPLÊNCIA: O atraso superior a 30 (trinta) dias ensejará a rescisão de pleno direito do contrato, suspensão imediata do transporte e autorização para registro de débito nos órgãos de proteção ao crédito (Serasa/SPC).",
  "Cláusula 8ª - DAS FÉRIAS ESCOLARES: Nos meses de recesso escolar (julho e dezembro/janeiro), o pagamento das mensalidades pactuadas permanece integral para a reserva da vaga e cobertura dos custos fixos do veículo.",
  "Cláusula 9ª - DO DESEMBARQUE DESACOMPANHADO: Caso assinalado nos autos, fica o motorista autorizado a desembarcar o aluno sem a presença física de um adulto responsável, eximindo-se de guarda a partir do ingresso no imóvel.",
  "Cláusula 10ª - DA SEGURANÇA A BORDO: O aluno deverá permanecer sentado e com cinto de segurança de três pontos afivelado durante todo o trajeto, sob a supervisão do motorista ou monitor escolar habilitado.",
  "Cláusula 11ª - DOS DIAS LETIVOS: O transporte será prestado exclusivamente nos dias letivos previstos no calendário escolar oficial da instituição de ensino.",
  "Cláusula 12ª - DA SUBSTITUIÇÃO DO VEÍCULO: Em caso de manutenção corretiva ou imprevisto mecânico, o transportador providenciará veículo substituto devidamente vistoriado para cumprimento do trajeto sem prejuízo letivo.",
  "Cláusula 13ª - DO AVISO PRÉVIO DE CANCELAMENTO: Qualquer das partes poderá rescindir o presente contrato mediante aviso prévio por escrito de 30 (trinta) dias de antecedência.",
  "Cláusula 14ª - DA MULTA RESCISÓRIA: A rescisão imotivada antes do término do período contratado sem aviso prévio sujeitará a parte infratora à multa rescisória equivalente a 50% de uma mensalidade.",
  "Cláusula 15ª - DA LEI GERAL DE PROTEÇÃO DE DADOS (LGPD): As partes autorizam o tratamento dos dados pessoais e dados sensíveis de saúde da criança unicamente para fins de execução e segurança do serviço contratado.",
  "Cláusula 16ª - DO FORO: Fica eleito o Foro da Comarca da Capital de São Paulo para dirimir quaisquer dúvidas oriundas deste contrato."
];

export const INITIAL_CONTRACTS: ContractProposal[] = [
  {
    id: "cnt_1",
    transporterEmail: "joao.batista@vanescolar.sp",
    transporterName: "João Batista de Oliveira",
    transporterCpfCnpj: "18.490.231/0001-44",
    transporterAddress: "Rua Domingos de Morais, 1200 - Vila Mariana, São Paulo/SP",
    transporterPhone: "(11) 98765-4321",
    parentEmail: "marta.almeida@gmail.com",
    parentName: "Marta Almeida",
    parentCpf: "349.201.884-12",
    parentAddress: "Rua das Acácias, 120 - Jabaquara, São Paulo/SP",
    parentPhone: "(11) 98811-2233",
    childName: "Lucas Almeida",
    childGrade: "3º Ano Fundamental",
    schoolName: "EMEF Santa Rita",
    pickupAddress: "Rua das Acácias, 120 - Jabaquara",
    dropoffAddress: "Rua das Acácias, 120 - Jabaquara",
    agreedMonthlyValue: 420.00,
    paymentDueDay: 10,
    period: "Manhã",
    entryTime: "07:30",
    exitTime: "12:15",
    contractTermMonths: 12,
    startDate: "01/02/2026",
    status: "proposta_enviada",
    clauses: DEFAULT_CONTRACT_CLAUSES,
    createdAt: "01/02/2026"
  }
];

export const OSASCO_SCHOOLS: School[] = [
  {
    id: "osc_1",
    name: "EMEF Prof. José Blanes",
    address: "Rua Dona Primitiva Vianco, 750",
    cep: "06010-000",
    neighborhood: "Centro",
    city: "Osasco",
    type: "municipal",
    levels: ["fundamental"],
    contactPhone: "(11) 3681-1244"
  },
  {
    id: "osc_2",
    name: "EMEF Deputado Alfredo Farhat",
    address: "Av. Santo Antônio, 1420",
    cep: "06086-065",
    neighborhood: "Vila Campesina",
    city: "Osasco",
    type: "municipal",
    levels: ["fundamental"],
    contactPhone: "(11) 3683-9910"
  },
  {
    id: "osc_3",
    name: "EMEF Ananias Emídio dos Santos",
    address: "Rua Salem Bechara, 310",
    cep: "06018-180",
    neighborhood: "Bela Vista",
    city: "Osasco",
    type: "municipal",
    levels: ["fundamental"],
    contactPhone: "(11) 3682-4500"
  },
  {
    id: "osc_4",
    name: "EMEF Marechal Bittencourt",
    address: "Rua Águas da Prata, 240",
    cep: "06290-110",
    neighborhood: "Rochdale",
    city: "Osasco",
    type: "municipal",
    levels: ["fundamental"],
    contactPhone: "(11) 3686-2180"
  },
  {
    id: "osc_5",
    name: "EMEF Quintino Bocaiuva",
    address: "Rua Erasmo Braga, 500",
    cep: "06213-005",
    neighborhood: "Presidente Altino",
    city: "Osasco",
    type: "municipal",
    levels: ["fundamental"],
    contactPhone: "(11) 3685-3211"
  },
  {
    id: "osc_6",
    name: "EMEI Profª Zuleika Gonçalves Gomide",
    address: "Rua Mariano Jatobá, 85",
    cep: "06016-010",
    neighborhood: "Centro",
    city: "Osasco",
    type: "municipal",
    levels: ["infantil"],
    contactPhone: "(11) 3682-8822"
  },
  {
    id: "osc_7",
    name: "EMEI Helena Vasconcellos Ramos",
    address: "Av. Yara, 620",
    cep: "06028-010",
    neighborhood: "Vila Yara",
    city: "Osasco",
    type: "municipal",
    levels: ["infantil"],
    contactPhone: "(11) 3684-1002"
  },
  {
    id: "osc_8",
    name: "EMEI Omar O'Grady",
    address: "Rua Laranjeira, 180",
    cep: "06053-120",
    neighborhood: "City Bussocaba",
    city: "Osasco",
    type: "municipal",
    levels: ["infantil"],
    contactPhone: "(11) 3698-5541"
  },
  {
    id: "osc_9",
    name: "CEMEI Maria Alves Dantas",
    address: "Rua Alberto Lameu, 110",
    cep: "06152-240",
    neighborhood: "Jardim Veloso",
    city: "Osasco",
    type: "creche",
    levels: ["infantil"],
    contactPhone: "(11) 3692-4114"
  },
  {
    id: "osc_10",
    name: "CEMEI Mário Quintana",
    address: "Rua Piacatu, 80",
    cep: "06246-090",
    neighborhood: "Munhoz Júnior",
    city: "Osasco",
    type: "creche",
    levels: ["infantil"],
    contactPhone: "(11) 3687-9002"
  },
  {
    id: "osc_11",
    name: "EE Prof. José Giorgi",
    address: "Rua Deputado Emílio Carlos, 450",
    cep: "06020-025",
    neighborhood: "Vila Campesina",
    city: "Osasco",
    type: "estadual",
    levels: ["fundamental", "medio"],
    contactPhone: "(11) 3681-3090"
  },
  {
    id: "osc_12",
    name: "EE Dr. Antônio Braz Gambarini",
    address: "Av. Cruzeiro do Sul, 1200",
    cep: "06290-000",
    neighborhood: "Rochdale",
    city: "Osasco",
    type: "estadual",
    levels: ["fundamental", "medio"],
    contactPhone: "(11) 3687-1422"
  },
  {
    id: "osc_13",
    name: "EE Coronel Paulino Carlos",
    address: "Rua Narciso Sturlini, 250",
    cep: "06018-090",
    neighborhood: "Centro",
    city: "Osasco",
    type: "estadual",
    levels: ["fundamental", "medio"],
    contactPhone: "(11) 3683-2210"
  },
  {
    id: "osc_14",
    name: "Colégio Misericórdia de Osasco",
    address: "Rua Antônio Agu, 1020",
    cep: "06018-002",
    neighborhood: "Centro",
    city: "Osasco",
    type: "particular",
    levels: ["infantil", "fundamental", "medio"],
    contactPhone: "(11) 3682-1022"
  },
  {
    id: "osc_15",
    name: "Colégio Star Osasco",
    address: "Rua General Bitencourt, 380",
    cep: "06016-040",
    neighborhood: "Centro",
    city: "Osasco",
    type: "particular",
    levels: ["infantil", "fundamental", "medio"],
    contactPhone: "(11) 3681-8000"
  },
  {
    id: "osc_16",
    name: "Colégio COC Vila Yara",
    address: "Av. Franz Voegeli, 550",
    cep: "06020-190",
    neighborhood: "Vila Yara",
    city: "Osasco",
    type: "particular",
    levels: ["fundamental", "medio"],
    contactPhone: "(11) 3684-2030"
  },
  {
    id: "osc_17",
    name: "Colégio Albert Einstein",
    address: "Rua Crisântemo, 310",
    cep: "06110-090",
    neighborhood: "Jardim das Flores",
    city: "Osasco",
    type: "particular",
    levels: ["infantil", "fundamental", "medio"],
    contactPhone: "(11) 3685-9920"
  },
  {
    id: "osc_18",
    name: "Colégio Anglo Osasco",
    address: "Av. Santo Antônio, 1920",
    cep: "06086-070",
    neighborhood: "Bela Vista",
    city: "Osasco",
    type: "particular",
    levels: ["fundamental", "medio"],
    contactPhone: "(11) 3683-1199"
  }
];

export const FREELANCE_DRIVERS: FreelanceDriver[] = [
  {
    id: "fl_1",
    name: "Carlos Eduardo da Silva",
    nickname: "Carlinhos da Van",
    phone: "(11) 98123-4567",
    whatsapp: "5511981234567",
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    cnhCategory: "Categoria D com EAR",
    dtpRegistration: "DTP-SP 77.412-B",
    region: "Zona Sul / Centro",
    experienceYears: 14,
    availableDays: "Segunda a Sexta (Manhã e Tarde)",
    dailyRate: 220.00,
    bio: "Motorista experiente com curso de transporte de escolares atualizado. Disponível para cobrir férias, atestados ou viagens extras.",
    rating: 4.9,
    verifiedDtp: true
  },
  {
    id: "fl_2",
    name: "Marcos Rogério Pereira",
    nickname: "Marcão do Escolar",
    phone: "(11) 97234-8901",
    whatsapp: "5511972348901",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    cnhCategory: "Categoria D com EAR",
    dtpRegistration: "DTP-SP 89.204-A",
    region: "Zona Leste / Grande ABC",
    experienceYears: 9,
    availableDays: "Terça a Sexta (Horário flexível)",
    dailyRate: 200.00,
    bio: "Profissional pontual, conhece muito bem rotas da Penha, Tatuapé, Mooca e Anália Franco. Pronto socorro para frotistas.",
    rating: 4.8,
    verifiedDtp: true
  },
  {
    id: "fl_3",
    name: "Gilberto Andrade dos Santos",
    nickname: "Tio Beto",
    phone: "(11) 96345-6789",
    whatsapp: "5511963456789",
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    cnhCategory: "Categoria E com EAR",
    dtpRegistration: "DTP-SP 63.811-C",
    region: "Zona Oeste / Osasco / Butantã",
    experienceYears: 18,
    availableDays: "Segunda a Sábado (Disponibilidade imediata)",
    dailyRate: 240.00,
    bio: "Mais de 18 anos conduzindo vans Mercedes Sprinter e Renault Master. Excelente condução defensiva e paciência com crianças.",
    rating: 5.0,
    verifiedDtp: true
  }
];

export const INITIAL_BOARDING_STOPS: BoardingStop[] = [
  {
    id: "stop_1",
    childId: "k1",
    childName: "Lucas Almeida",
    guardianName: "Marta Almeida",
    guardianPhone: "(11) 98811-2233",
    type: "embarque",
    address: "Rua das Acácias, 120",
    neighborhood: "Jabaquara",
    schoolName: "EMEF Santa Rita",
    order: 1,
    scheduledTime: "06:45",
    estimatedArrival: "06:45",
    status: "embarcou",
    unaccompaniedAuthorized: false,
    notes: "Portão cinza, tocar interfone 12."
  },
  {
    id: "stop_2",
    childId: "k2",
    childName: "Beatriz Lima",
    guardianName: "Paulo Lima",
    guardianPhone: "(11) 97722-3344",
    type: "embarque",
    address: "Av. Fagundes Filho, 450",
    neighborhood: "São Judas",
    schoolName: "EMEF Santa Rita",
    order: 2,
    scheduledTime: "06:55",
    estimatedArrival: "06:56",
    status: "a_caminho",
    unaccompaniedAuthorized: true,
    notes: "Aguardar em frente à guarita do condomínio."
  },
  {
    id: "stop_3",
    childId: "k3",
    childName: "Pedro Rocha",
    guardianName: "Ana Rocha",
    guardianPhone: "(11) 96633-4455",
    type: "embarque",
    address: "Rua Gaivota, 55",
    neighborhood: "Moema",
    schoolName: "EMEF Santa Rita",
    order: 3,
    scheduledTime: "07:10",
    estimatedArrival: "07:12",
    status: "pendente",
    unaccompaniedAuthorized: false,
    notes: "Tio Pedro avisou que faltará hoje (consulta médica)."
  },
  {
    id: "stop_4",
    childId: "school_1",
    childName: "Desembarque Geral na Escola",
    guardianName: "Coordenação Escolar",
    guardianPhone: "(11) 5051-2233",
    type: "desembarque",
    address: "Rua Vergueiro, 3000",
    neighborhood: "Vila Mariana",
    schoolName: "EMEF Santa Rita",
    order: 4,
    scheduledTime: "07:25",
    estimatedArrival: "07:25",
    status: "pendente",
    notes: "Entrada pelo portão 2 dos transportadores escolares."
  }
];

