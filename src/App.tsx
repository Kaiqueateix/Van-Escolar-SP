import React, { useState, useEffect } from 'react';
import {
  User,
  TransporterProfile,
  Child,
  PaymentRecord,
  ExpenseRecord,
  NewStudentOpportunity,
  BroadcastNotice,
  CharterRequest,
  VerifiedReview,
  UserRole,
  SubscriptionTier,
  DocumentItem,
  ContractProposal,
  ParentReviewByTransporter,
  ServicePartnerItem,
  PartnerPromotion,
  BoardingStop,
  BoardingEvent,
  SubscriptionContract,
  FreelanceDriver
} from './types';
import {
  loadDatabase,
  saveDatabase,
  hashPassword,
  logAudit,
  VespDatabase
} from './services/storage';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { AuthView, ParentRegistrationData, DriverRegistrationData } from './components/AuthView';
import { InstallModal } from './components/InstallModal';
import { LGPDModal } from './components/LGPDModal';
import { RequestOpportunityModal } from './components/RequestOpportunityModal';
import { DevicePermissionsModal } from './components/DevicePermissionsModal';
import { registerServiceWorker } from './services/notificationService';
import { processIncomingPixWebhook, PixWebhookEvent } from './services/paymentGatewayService';

// Parent Views
import { SearchCompareView } from './views/parents/SearchCompareView';
import { TrackingView } from './views/parents/TrackingView';
import { BoardingConfirmationView } from './views/parents/BoardingConfirmationView';
import { ParentFinancialView } from './views/parents/ParentFinancialView';

// Transporter Views
import { NewStudentOpportunitiesView } from './views/transporter/NewStudentOpportunitiesView';
import { StudentsManagementView } from './views/transporter/StudentsManagementView';
import { RouteOptimizerView } from './views/transporter/RouteOptimizerView';
import { TransporterFinancialDashboard } from './views/transporter/TransporterFinancialDashboard';
import { MyVanMaintenanceView } from './views/transporter/MyVanMaintenanceView';
import { TransporterProfileView } from './views/transporter/TransporterProfileView';
import { TransporterReferralView } from './views/transporter/TransporterReferralView';

// Shared Views
import { ChatView } from './views/shared/ChatView';
import { BroadcastNoticeView } from './views/shared/BroadcastNoticeView';
import { CharterRequestView } from './views/shared/CharterRequestView';
import { ReferralProgramView } from './views/shared/ReferralProgramView';
import { SubscriptionsView } from './views/shared/SubscriptionsView';
import { ServicesPartnersView } from './views/shared/ServicesPartnersView';
import { VerifiedReviewsView } from './views/shared/VerifiedReviewsView';
import { SupportView } from './views/shared/SupportView';
import { NetflixProfileSelector } from './views/parents/NetflixProfileSelector';
import { ConversationsListView, ChatConversationItem } from './views/shared/ConversationsListView';

// Firebase
import { auth, db as firestoreDb } from './firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import {
  saveUserToFirestore,
  saveTransporterToFirestore,
  saveStudentToFirestore,
  deleteStudentFromFirestore,
  saveContractToFirestore,
  saveChatMessageToFirestore,
  saveOpportunityToFirestore,
  saveExpenseToFirestore,
  setupFirestoreListeners
} from './services/firebaseSyncService';

// Admin Views
import { AdminDashboardView } from './views/admin/AdminDashboardView';
import { PRDTestingView } from './views/admin/PRDTestingView';

import {
  Megaphone,
  Gift,
  Bus,
  Star,
  FileCheck,
  Wrench,
  Award,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
  Handshake,
  Layers,
  HelpCircle,
  Users2
} from 'lucide-react';

export default function App() {
  const [db, setDb] = useState<VespDatabase>(() => loadDatabase());
  const [tab, setTab] = useState<string>('b');
  const [tabHistory, setTabHistory] = useState<string[]>(['b']);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('vesp_dark') === 'true';
  });

  // Netflix child profile state for parents
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [isNetflixSelectorOpen, setIsNetflixSelectorOpen] = useState<boolean>(false);

  // WhatsApp-style Chat conversation list state
  const [selectedChatConvo, setSelectedChatConvo] = useState<ChatConversationItem | null>(null);

  // Modals state
  const [isStoreModalOpen, setIsStoreModalOpen] = useState<boolean>(false);
  const [isLGPDModalOpen, setIsLGPDModalOpen] = useState<boolean>(false);
  const [isRequestOppModalOpen, setIsRequestOppModalOpen] = useState<boolean>(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>('');

  // Register PWA Service Worker on mount
  useEffect(() => {
    registerServiceWorker();
    const unsubFirestore = setupFirestoreListeners(setDb);
    return () => unsubFirestore();
  }, []);

  // Listen to Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser && fbUser.email) {
        const email = fbUser.email.toLowerCase();
        setDb(prevDb => {
          let user = prevDb.users.find(u => u.email === email);
          if (!user) {
            const newUser: User = {
              id: 'u_' + fbUser.uid.slice(0, 8),
              n: fbUser.displayName || email.split('@')[0],
              email,
              pwHash: 'FIREBASE_AUTH_USER',
              role: 'c',
              createdAt: new Date().toLocaleDateString('pt-BR'),
              acceptedLGPD: true,
              status: 'ativo',
              isFirebaseUser: true
            };
            const updatedUsers = [...prevDb.users, newUser];
            const updatedKids = { ...prevDb.kids, [email]: prevDb.kids[email] || [] };
            const nextDb = { ...prevDb, users: updatedUsers, kids: updatedKids, currentSession: email };
            saveDatabase(nextDb);
            return nextDb;
          }
          if (prevDb.currentSession !== email) {
            const nextDb = { ...prevDb, currentSession: email };
            saveDatabase(nextDb);
            return nextDb;
          }
          return prevDb;
        });
      }
    });
    return () => unsubscribe();
  }, []);

  // Navigation helpers
  const navigateToTab = (nextTab: string) => {
    if (nextTab === tab) return;
    setTabHistory(prev => [...prev, nextTab]);
    setTab(nextTab);
  };

  const handleGoBack = () => {
    if (tabHistory.length > 1) {
      const updated = [...tabHistory];
      updated.pop();
      const prevTab = updated[updated.length - 1];
      setTabHistory(updated);
      setTab(prevTab);
    }
  };

  // Persist dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('vesp_dark', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('vesp_dark', 'false');
    }
  }, [darkMode]);

  const currentUser = db.users.find(u => u.email === db.currentSession) || null;

  // Set default tab when user changes
  useEffect(() => {
    if (!currentUser) {
      setTab('b');
      setTabHistory(['b']);
      return;
    }
    const initialTab = currentUser.role === 't' ? 'opp' : currentUser.role === 'a' ? 'adm_dash' : 'b';
    setTab(initialTab);
    setTabHistory([initialTab]);
  }, [currentUser?.email, currentUser?.role]);

  // Sync state helper
  const updateDb = (newDb: VespDatabase) => {
    setDb(newDb);
    saveDatabase(newDb);
  };

  // Auth actions
  const handleLogin = async (email: string, pass: string): Promise<boolean> => {
    setAuthError('');
    const cleanEmail = email.trim().toLowerCase();

    // 1. Try Firebase Auth with Email & Password
    try {
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, pass);
      if (userCredential && userCredential.user && userCredential.user.email) {
        const fbEmail = userCredential.user.email.toLowerCase();
        let user = db.users.find(u => u.email === fbEmail);
        let currentUsers = [...db.users];
        let currentKids = { ...db.kids };

        if (!user) {
          user = {
            id: 'u_' + userCredential.user.uid.slice(0, 8),
            n: userCredential.user.displayName || fbEmail.split('@')[0],
            email: fbEmail,
            pwHash: 'FIREBASE_AUTH_USER',
            role: 'c',
            createdAt: new Date().toLocaleDateString('pt-BR'),
            acceptedLGPD: true,
            status: 'ativo',
            isFirebaseUser: true
          };
          currentUsers.push(user);
          currentKids[fbEmail] = [];
        }

        if (user.status === 'suspenso') {
          setAuthError('Esta conta está temporariamente suspensa pelo órgão regulador DTP.');
          return false;
        }

        const nextDb = { ...db, users: currentUsers, kids: currentKids, currentSession: fbEmail };
        updateDb(nextDb);
        return true;
      }
    } catch (firebaseErr: any) {
      console.warn('Firebase login attempt:', firebaseErr?.code || firebaseErr?.message);
    }

    // 2. Fallback to local user DB credentials match
    const hash = await hashPassword(pass);
    const user = db.users.find(
      u => u.email === cleanEmail && (u.pwHash === hash || u.pwHash === pass)
    );
    if (!user) return false;
    if (user.status === 'suspenso') {
      setAuthError('Esta conta está temporariamente suspensa pelo órgão regulador DTP.');
      return false;
    }

    const nextDb = { ...db, currentSession: user.email };
    updateDb(nextDb);
    return true;
  };

  const handleRegister = async (
    name: string,
    email: string,
    pass: string,
    role: UserRole
  ): Promise<boolean> => {
    const cleanEmail = email.trim().toLowerCase();
    if (db.users.some(u => u.email === cleanEmail)) {
      return false;
    }

    try {
      await createUserWithEmailAndPassword(auth, cleanEmail, pass);
    } catch (e: any) {
      if (e?.code !== 'auth/email-already-in-use') {
        console.warn('Firebase user creation note:', e?.message);
      }
    }

    const hash = await hashPassword(pass);
    const newUser: User = {
      id: 'u_' + Date.now().toString(36),
      n: name,
      email: cleanEmail,
      pwHash: hash,
      role,
      referralCode: `VAN-${name.split(' ')[0].toUpperCase()}${Math.floor(100 + Math.random() * 900)}`,
      createdAt: new Date().toLocaleDateString('pt-BR'),
      acceptedLGPD: true,
      status: 'ativo',
      isFirebaseUser: true
    };

    let updatedTransporters = [...db.transporters];
    let updatedKids = { ...db.kids };

    if (role === 't') {
      // Create empty profile for transporter
      const newProfile: TransporterProfile = {
        id: 't_' + Date.now().toString(36),
        name,
        email: cleanEmail,
        phone: '(11) 99999-0000',
        photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        bio: 'Transportador credenciado iniciando operação com a plataforma Van Escolar SP.',
        experienceYears: 1,
        vanModel: 'Van Escolar',
        vanYear: 2022,
        vanPlate: 'BRA-2026',
        seatsTotal: 15,
        seatsAvailable: 5,
        regions: [0],
        schools: [0],
        basePrice: 420,
        rating: 5.0,
        reviewsCount: 0,
        isVerified: false,
        verification: {
          status: 'nao_solicitado',
          hasCourse: false,
          documents: []
        },
        subscriptionTier: 'free',
        amenities: ['Cinto 3 pontos', 'Monitor a bordo'],
        vanPhotos: []
      };
      updatedTransporters.push(newProfile);
      updatedKids[cleanEmail] = [];
    } else {
      updatedKids[cleanEmail] = [];
    }

    const nextDb: VespDatabase = {
      ...db,
      users: [...db.users, newUser],
      transporters: updatedTransporters,
      kids: updatedKids,
      currentSession: cleanEmail
    };

    updateDb(nextDb);
    return true;
  };

  const handleRegisterParentDetailed = async (data: ParentRegistrationData): Promise<boolean> => {
    const cleanEmail = data.email.trim().toLowerCase();
    if (db.users.some(u => u.email === cleanEmail)) {
      return false;
    }

    // Attempt Firebase Auth user account creation
    try {
      await createUserWithEmailAndPassword(auth, cleanEmail, data.pass);
    } catch (e: any) {
      if (e?.code !== 'auth/email-already-in-use') {
        console.warn('Firebase parent creation note:', e?.message);
      }
    }

    const hash = await hashPassword(data.pass);
    const newUser: User = {
      id: 'u_' + Date.now().toString(36),
      n: data.name,
      email: cleanEmail,
      pwHash: hash,
      role: 'c',
      phone: data.phone,
      cpf: data.cpf,
      address: data.address,
      referralCode: `VAN-${data.name.split(' ')[0].toUpperCase()}${Math.floor(100 + Math.random() * 900)}`,
      createdAt: new Date().toLocaleDateString('pt-BR'),
      acceptedLGPD: data.termsAccepted,
      acceptedAt: data.acceptedAt,
      acceptedVersion: data.acceptedVersion,
      status: 'ativo',
      isFirebaseUser: true
    };

    const newChildren: Child[] = data.children.map((c, idx) => ({
      id: `kid_${Date.now()}_${idx}`,
      n: c.name,
      i: c.calculatedAge,
      o: c.medicalNotes || c.allergies || 'Sem observações médicas',
      d: `${data.address.street}, ${data.address.number}${data.address.complement ? ' - ' + data.address.complement : ''}`,
      neighborhood: data.address.neighborhood,
      e: c.school,
      r: data.name,
      t: data.phone,
      pg: 0,
      pgAt: 10,
      valor: 420,
      birthDate: c.birthDate,
      calculatedAge: c.calculatedAge,
      grade: c.grade,
      allergies: c.allergies,
      medicalNotes: c.medicalNotes,
      allowUnaccompaniedDropoff: false
    }));

    const updatedKids = {
      ...db.kids,
      [cleanEmail]: newChildren
    };

    const nextDb: VespDatabase = {
      ...db,
      users: [...db.users, newUser],
      kids: updatedKids,
      currentSession: cleanEmail
    };
    updateDb(nextDb);

    saveUserToFirestore(newUser).catch(err => console.warn('Firestore user save:', err));
    newChildren.forEach(kid => {
      saveStudentToFirestore(kid, 'joao.batista@vanescolar.sp').catch(err => console.warn('Firestore kid save:', err));
    });

    return true;
  };

  const handleRegisterDriverDetailed = async (data: DriverRegistrationData): Promise<boolean> => {
    const cleanEmail = data.email.trim().toLowerCase();
    if (db.users.some(u => u.email === cleanEmail)) {
      return false;
    }

    // Attempt Firebase Auth driver account creation
    try {
      await createUserWithEmailAndPassword(auth, cleanEmail, data.pass);
    } catch (e: any) {
      if (e?.code !== 'auth/email-already-in-use') {
        console.warn('Firebase driver creation note:', e?.message);
      }
    }

    const hash = await hashPassword(data.pass);
    const newUser: User = {
      id: 'u_' + Date.now().toString(36),
      n: data.name,
      email: cleanEmail,
      pwHash: hash,
      role: 't',
      phone: data.phone,
      cpf: data.cpfCnpj,
      birthDate: data.birthDate,
      calculatedAge: data.calculatedAge,
      referralCode: `VAN-${data.name.split(' ')[0].toUpperCase()}${Math.floor(100 + Math.random() * 900)}`,
      createdAt: new Date().toLocaleDateString('pt-BR'),
      acceptedLGPD: data.permissionsAccepted,
      acceptedAt: data.acceptedAt,
      acceptedVersion: data.acceptedVersion,
      status: 'ativo',
      isFirebaseUser: true
    };

    const newProfile: TransporterProfile = {
      id: 't_' + Date.now().toString(36),
      name: data.name,
      nickname: data.nickname || data.name.split(' ')[0],
      email: cleanEmail,
      phone: data.phone,
      photoUrl: data.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      bio: `Transportador credenciado DTP. Atendendo: ${data.schoolsAttended}. Bairros: ${data.neighborhoodsAttended}.`,
      experienceYears: 1,
      vanBrand: data.vanBrand,
      vanModel: data.vanModel,
      vanYear: data.vanYear,
      vanPlate: data.vanPlate,
      seatsTotal: data.vanCapacity,
      seatsAvailable: data.vanCapacity,
      regions: [0],
      schools: [0],
      basePrice: 420,
      rating: 5.0,
      reviewsCount: 0,
      isVerified: false,
      verification: {
        status: 'pendente',
        hasCourse: true,
        cnhCategory: data.cnhCategory,
        cnhNumber: data.cnhNumber,
        dtpNumber: data.dtpNumber,
        qrCodeUrl: data.qrCodeUrl,
        documents: []
      },
      subscriptionTier: 'free',
      amenities: ['Cinto 3 pontos', 'Monitor a bordo', 'Câmera veicular'],
      vanPhotos: data.vanPhotos || [],
      schoolsAttended: data.schoolsAttended,
      neighborhoodsAttended: data.neighborhoodsAttended,
      serviceTypes: data.serviceTypes || ['ida_e_volta'],
      bankAccount: data.bankAccount
    };

    const updatedTransporters = [...db.transporters, newProfile];
    const updatedKids = { ...db.kids, [cleanEmail]: [] };

    const nextDb: VespDatabase = {
      ...db,
      users: [...db.users, newUser],
      transporters: updatedTransporters,
      kids: updatedKids,
      currentSession: cleanEmail
    };
    updateDb(nextDb);

    saveUserToFirestore(newUser).catch(err => console.warn('Firestore user save:', err));
    saveTransporterToFirestore(newProfile).catch(err => console.warn('Firestore transporter save:', err));

    return true;
  };

  const handleFastLogin = (email: string) => {
    const nextDb = { ...db, currentSession: email };
    updateDb(nextDb);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      // ignore
    }
    const nextDb = { ...db, currentSession: null };
    updateDb(nextDb);
  };

  const handleGoogleLogin = async (desiredRole?: UserRole, googleUser?: any): Promise<boolean> => {
    const gUser = googleUser || auth.currentUser;
    if (!gUser || !gUser.email) return false;
    const email = gUser.email.toLowerCase();
    const name = gUser.displayName || email.split('@')[0];
    const role: UserRole = desiredRole || 'c';

    let currentUsers = [...db.users];
    let user = currentUsers.find(u => u.email === email);

    if (!user) {
      // Create fresh user profile with 0 pre-populated mock data
      const newUser: User = {
        id: 'u_' + gUser.uid.slice(0, 8),
        n: name,
        email,
        pwHash: 'GOOGLE_OAUTH_USER',
        role,
        photoUrl: gUser.photoURL || undefined,
        referralCode: `VAN-${name.split(' ')[0].toUpperCase()}${Math.floor(100 + Math.random() * 900)}`,
        createdAt: new Date().toLocaleDateString('pt-BR'),
        acceptedLGPD: true,
        status: 'ativo',
        isFirebaseUser: true
      };
      currentUsers.push(newUser);

      let updatedTransporters = [...db.transporters];
      let updatedKids = { ...db.kids };

      if (role === 't') {
        const newProfile: TransporterProfile = {
          id: 't_' + Date.now().toString(36),
          name,
          email,
          phone: '(11) 99999-0000',
          photoUrl: gUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          bio: 'Transportador credenciado iniciando operação na plataforma Van Escolar SP.',
          experienceYears: 1,
          vanModel: 'Van Escolar',
          vanYear: 2022,
          vanPlate: 'BRA-2026',
          seatsTotal: 15,
          seatsAvailable: 5,
          regions: [0],
          schools: [0],
          basePrice: 420,
          rating: 5.0,
          reviewsCount: 0,
          isVerified: false,
          verification: {
            status: 'pendente',
            hasCourse: false,
            documents: []
          },
          subscriptionTier: 'free',
          amenities: ['Cinto 3 pontos', 'Monitor a bordo'],
          vanPhotos: []
        };
        updatedTransporters.push(newProfile);
        updatedKids[email] = [];
      } else {
        updatedKids[email] = [];
      }

      const nextDb: VespDatabase = {
        ...db,
        users: currentUsers,
        transporters: updatedTransporters,
        kids: updatedKids,
        currentSession: email
      };
      updateDb(nextDb);

      saveUserToFirestore(newUser).catch(err => console.warn('Firestore Google user save:', err));
      if (role === 't' && updatedTransporters.length > 0) {
        const newlyAddedTransporter = updatedTransporters[updatedTransporters.length - 1];
        saveTransporterToFirestore(newlyAddedTransporter).catch(err => console.warn('Firestore Google transporter save:', err));
      }
      return true;
    }

    const nextDb = { ...db, currentSession: email };
    updateDb(nextDb);
    return true;
  };

  // Transporter profile
  const currentTransporter = db.transporters.find(
    t => t.email === currentUser?.email || t.id === 't1'
  ) || db.transporters[0];

  // Selected transporter for parents
  const selectedTransporterId = currentUser ? db.pick[currentUser.email] || 't1' : 't1';
  const selectedTransporter = db.transporters.find(t => t.id === selectedTransporterId) || db.transporters[0];

  // Context-aware kids:
  // For demo users (Marta and Joao), load pre-populated demo data
  // For newly registered users, start with their own clean slate (0 mock students)
  const isDemoParent = currentUser?.email === 'marta.almeida@gmail.com';
  const isDemoTransporter = currentUser?.email === 'joao.batista@vanescolar.sp';

  const parentKids: Child[] = currentUser?.role === 'c'
    ? (db.kids[currentUser.email] || (isDemoParent ? [db.kids['joao.batista@vanescolar.sp'][0]] : []))
    : [];

  const activeChild = parentKids.find(k => k.id === selectedChildId) || parentKids[0] || null;

  const transporterKidsList: Child[] = currentUser?.role === 't'
    ? (db.kids[currentUser.email] || (isDemoTransporter ? db.kids['joao.batista@vanescolar.sp'] : []))
    : [];

  const handleAddChildProfile = (newChild: Child) => {
    if (!currentUser) return;
    const existing = db.kids[currentUser.email] || [];
    const updated = [...existing, newChild];
    const nextDb = {
      ...db,
      kids: {
        ...db.kids,
        [currentUser.email]: updated
      }
    };
    updateDb(nextDb);
    setSelectedChildId(newChild.id);
    setIsNetflixSelectorOpen(false);

    saveUserToFirestore({
      ...currentUser,
      children: updated
    }).catch(err => console.warn('Firestore user child save:', err));
    saveStudentToFirestore(newChild, 'joao.batista@vanescolar.sp').catch(err => console.warn('Firestore student save:', err));
  };

  // Chat key for current view
  const chatKey = currentUser
    ? `${currentUser.email}_${selectedTransporter.id}`
    : `default_chat`;
  const chatMessages = db.chat[chatKey] || [
    {
      id: 'c_init',
      f: 't' as const,
      senderName: selectedTransporter.name,
      x: `Olá! Sou ${selectedTransporter.name.split(' ')[0]}. Estou à disposição para tirar qualquer dúvida sobre horários e vagas.`,
      time: '07:00'
    }
  ];

  // WhatsApp-style conversations list generator
  const conversationsList: ChatConversationItem[] = currentUser?.role === 't'
    ? [
        {
          id: `${currentUser.email}_marta.almeida@gmail.com`,
          partnerName: 'Marta Almeida',
          partnerEmail: 'marta.almeida@gmail.com',
          partnerPhone: '(11) 98811-2233',
          partnerRole: 'c',
          childName: 'Lucas Almeida',
          schoolName: 'EMEF Santa Rita',
          lastMessage: db.chat[chatKey]?.slice(-1)[0]?.x || 'Olá! Gostaria de saber sobre vagas para meu filho neste semestre.',
          lastMessageTime: db.chat[chatKey]?.slice(-1)[0]?.time || '08:30',
          unreadCount: 1,
          contract: db.contracts?.find(c => c.parentEmail === 'marta.almeida@gmail.com') || null
        },
        {
          id: `${currentUser.email}_roberta.santos@gmail.com`,
          partnerName: 'Roberta Santos',
          partnerEmail: 'roberta.santos@gmail.com',
          partnerPhone: '(11) 97722-1144',
          partnerRole: 'c',
          childName: 'Mariana Santos',
          schoolName: 'Colégio Santo Américo',
          lastMessage: 'A van passa no portão às 07:15 amanhã?',
          lastMessageTime: 'Ontem',
          unreadCount: 0,
          contract: null
        },
        {
          id: `${currentUser.email}_fernando.costa@hotmail.com`,
          partnerName: 'Fernando Costa',
          partnerEmail: 'fernando.costa@hotmail.com',
          partnerPhone: '(11) 99188-4455',
          partnerRole: 'c',
          childName: 'Enzo Costa',
          schoolName: 'Colégio São Luís',
          lastMessage: 'Proposta aceita! Vou aguardar a emissão do contrato.',
          lastMessageTime: '04/11',
          unreadCount: 0,
          contract: null
        }
      ]
    : [
        {
          id: chatKey,
          partnerName: selectedTransporter.name,
          partnerEmail: selectedTransporter.email,
          partnerPhone: selectedTransporter.phone,
          partnerRole: 't',
          childName: activeChild?.n || 'Lucas Almeida',
          schoolName: activeChild?.e || 'EMEF Santa Rita',
          lastMessage: db.chat[chatKey]?.slice(-1)[0]?.x || `Olá! Sou ${selectedTransporter.name.split(' ')[0]}. Estou à disposição para tirar qualquer dúvida sobre horários e vagas.`,
          lastMessageTime: db.chat[chatKey]?.slice(-1)[0]?.time || '07:00',
          unreadCount: 0,
          contract: db.contracts?.find(c => c.transporterEmail === selectedTransporter.email) || null
        }
      ];

  // Handler: Select Transporter (by Parent)
  const handleSelectTransporter = (id: string) => {
    if (!currentUser) return;
    const nextPick = { ...db.pick, [currentUser.email]: id };
    const nextDb = { ...db, pick: nextPick };
    updateDb(nextDb);
    navigateToTab('l'); // Navigate to tracking
  };

  // Handler: Express Interest in New Student Opportunity
  const handleExpressInterest = (oppId: string) => {
    if (!currentUser) return;
    const userEmailClean = currentUser.email.toLowerCase();
    const transporterEmailClean = (currentTransporter?.email || '').toLowerCase();

    const updatedOpps = db.opportunities.map(opp => {
      if (opp.id === oppId) {
        const list = opp.interestedTransporters || [];
        const hasEmail = list.some(
          e => e.toLowerCase() === userEmailClean || (transporterEmailClean && e.toLowerCase() === transporterEmailClean)
        );
        if (!hasEmail) {
          return {
            ...opp,
            interestedTransporters: [...list, userEmailClean, transporterEmailClean]
          };
        }
      }
      return opp;
    });

    const targetOpp = updatedOpps.find(o => o.id === oppId);
    if (!targetOpp) return;

    // Automatic notification message for the parent
    const notificationChatKey = `${targetOpp.parentEmail}_${currentTransporter.id}`;
    const currentMsgs = db.chat[notificationChatKey] || [];
    const notifMsg = {
      id: 'm_notif_' + Date.now().toString(36),
      f: 't' as const,
      senderName: currentTransporter.name,
      x: `🔔 NOTIFICAÇÃO DE INTERESSE: O transportador credenciado ${currentTransporter.name} (Van ${currentTransporter.vanModel}, Placa ${currentTransporter.vanPlate}) manifestou interesse no transporte escolar de ${targetOpp.childName} para a escola ${targetOpp.school}! Entrem em contato no chat para negociar valores e emitir o contrato.`,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    const newNotice: BroadcastNotice = {
      id: 'notif_' + Date.now().toString(36),
      transporterEmail: currentTransporter.email,
      transporterName: currentTransporter.name,
      category: 'Geral',
      title: `Interesse demonstrado por ${currentTransporter.name}!`,
      message: `O motorista ${currentTransporter.name} atende a escola ${targetOpp.school} e deseja transportar ${targetOpp.childName}.`,
      createdAt: 'Agora',
      priority: 'alta'
    };

    const nextDb = {
      ...db,
      opportunities: updatedOpps,
      notices: [newNotice, ...(db.notices || [])],
      chat: {
        ...db.chat,
        [notificationChatKey]: [...currentMsgs, notifMsg]
      }
    };
    updateDb(nextDb);

    saveOpportunityToFirestore(targetOpp).catch(err => console.warn('Firestore opp interest save:', err));
    saveChatMessageToFirestore(notificationChatKey, notifMsg).catch(err => console.warn('Firestore notif chat save:', err));
  };

  // Handler: Chat Send Message
  const handleSendMessage = (chatKey: string, text: string, imageUrl?: string, contractProposalId?: string) => {
    if (!currentUser) return;
    const currentMsgs = db.chat[chatKey] || [];
    const newMsg = {
      id: 'm_' + Date.now().toString(36),
      f: 'me' as const,
      senderName: currentUser.n,
      x: text,
      imageUrl,
      contractProposalId,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    const nextDb = {
      ...db,
      chat: {
        ...db.chat,
        [chatKey]: [...currentMsgs, newMsg]
      }
    };
    updateDb(nextDb);

    saveChatMessageToFirestore(chatKey, newMsg).catch(err => console.warn('Firestore chat msg save:', err));

    // Simulated quick reply after 1.5 seconds if sender was parent and not a contract
    if (currentUser.role === 'c' && !contractProposalId) {
      setTimeout(() => {
        const lowerText = text.toLowerCase();
        const isPricingQuestion =
          lowerText.includes('valor') ||
          lowerText.includes('preço') ||
          lowerText.includes('preco') ||
          lowerText.includes('mensalidade') ||
          lowerText.includes('quanto') ||
          lowerText.includes('desconto') ||
          lowerText.includes('orçamento') ||
          lowerText.includes('orcamento') ||
          lowerText.includes('custo');

        let replyContent = 'Olá! Recebi sua mensagem e já estou acompanhando os detalhes do transporte.';
        if (isPricingQuestion) {
          replyContent = `Olá! O valor padrão de mensalidade para transporte ida e volta nesta região é de R$ 420,00/mês (com vencimento todo dia 10). Para pagamento antecipado até o dia 5, consigo fazer uma proposta com desconto por R$ 390,00/mês! Podemos fechar a proposta contratual com as 16 cláusulas pelo botão de Gerar Contrato no topo da conversa?`;
        }

        const replyMsg = {
          id: 'm_rep_' + Date.now().toString(36),
          f: 't' as const,
          senderName: selectedTransporter.name,
          x: replyContent,
          time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        };
        const replyDb: VespDatabase = {
          ...nextDb,
          chat: {
            ...nextDb.chat,
            [chatKey]: [...(nextDb.chat[chatKey] || []), replyMsg]
          }
        };
        updateDb(replyDb);
        saveChatMessageToFirestore(chatKey, replyMsg).catch(err => console.warn('Firestore chat reply save:', err));
      }, 1500);
    }
  };

  // Handler: Create Contract in Chat
  const handleCreateContract = (contractData: Omit<ContractProposal, 'id' | 'createdAt' | 'status'>): string => {
    const newId = 'ct_' + Date.now().toString(36);
    const newContract: ContractProposal = {
      ...contractData,
      id: newId,
      createdAt: new Date().toLocaleDateString('pt-BR'),
      status: 'proposta_enviada'
    };
    updateDb({
      ...db,
      contracts: [newContract, ...(db.contracts || [])]
    });

    saveContractToFirestore(newContract).catch(err => console.warn('Firestore contract save:', err));
    return newId;
  };

  // Handler: Digital Signature of Contract
  const handleSignContract = (contractId: string, signerName: string, cpf: string) => {
    let signedContractObj: ContractProposal | null = null;
    const updatedContracts = (db.contracts || []).map(ct => {
      if (ct.id === contractId) {
        const updated = {
          ...ct,
          status: 'assinado_ativo' as const,
          parentSignature: {
            signedName: signerName,
            parentCpf: cpf,
            signedAt: new Date().toLocaleString('pt-BR')
          }
        };
        signedContractObj = updated;
        return updated;
      }
      return ct;
    });
    updateDb({ ...db, contracts: updatedContracts });

    if (signedContractObj) {
      saveContractToFirestore(signedContractObj).catch(err => console.warn('Firestore contract sign save:', err));
    }
    alert('Contrato assinado digitalmente com sucesso! Válido perante a DTP e Prefeitura de SP.');
  };

  // Handler: Payment Confirmation
  const handleConfirmPayment = (payment: Omit<PaymentRecord, 'id'>) => {
    const newPayment: PaymentRecord = {
      ...payment,
      id: 'pay_' + Date.now().toString(36)
    };

    // Mark child as paid
    const updatedKids = { ...db.kids };
    for (const key of Object.keys(updatedKids)) {
      updatedKids[key] = updatedKids[key].map(k => {
        if (k.n.includes('Lucas') || k.r.includes(currentUser?.n || '')) {
          return { ...k, pg: 1 };
        }
        return k;
      });
    }

    const nextDb = {
      ...db,
      payments: [newPayment, ...db.payments],
      kids: updatedKids
    };
    updateDb(nextDb);
  };

  // Handler: Add Child
  const handleAddChild = (child: Child) => {
    if (!currentUser) return;
    const currentList = db.kids[currentUser.email] || [];
    const nextDb = {
      ...db,
      kids: {
        ...db.kids,
        [currentUser.email]: [...currentList, child]
      }
    };
    updateDb(nextDb);

    const transporterEmail = currentUser.role === 't' ? currentUser.email : 'joao.batista@vanescolar.sp';
    saveStudentToFirestore(child, transporterEmail).catch(err => console.warn('Firestore student add save:', err));
  };

  // Handler: Delete Child
  const handleDeleteChild = (index: number) => {
    if (!currentUser) return;
    const currentList = [...(db.kids[currentUser.email] || [])];
    const targetChild = currentList[index];
    currentList.splice(index, 1);
    const nextDb = {
      ...db,
      kids: {
        ...db.kids,
        [currentUser.email]: currentList
      }
    };
    updateDb(nextDb);

    if (targetChild) {
      deleteStudentFromFirestore(targetChild.id).catch(err => console.warn('Firestore student delete save:', err));
    }
  };

  // Handler: Toggle attendance / step for child
  const handleUpdateAttendance = (
    index: number,
    field: 'checkedInMorning' | 'checkedInSchool' | 'checkedInAfternoon' | 'checkedInDelivered'
  ) => {
    if (!currentUser) return;
    const transporterKey = currentUser.role === 't' ? currentUser.email : 'joao.batista@vanescolar.sp';
    const list = [...(db.kids[transporterKey] || [])];
    if (list[index]) {
      list[index] = {
        ...list[index],
        [field]: !list[index][field]
      };
      const nextDb = {
        ...db,
        kids: {
          ...db.kids,
          [transporterKey]: list
        }
      };
      updateDb(nextDb);

      saveStudentToFirestore(list[index], transporterKey).catch(err => console.warn('Firestore student attendance save:', err));
    }
  };

  // Handler: Add Expense
  const handleAddExpense = (expense: Omit<ExpenseRecord, 'id'>) => {
    const newExp: ExpenseRecord = {
      ...expense,
      id: 'exp_' + Date.now().toString(36)
    };
    const nextDb = {
      ...db,
      expenses: [newExp, ...db.expenses]
    };
    updateDb(nextDb);

    saveExpenseToFirestore(newExp).catch(err => console.warn('Firestore expense save:', err));
  };

  // Handler: Delete Expense
  const handleDeleteExpense = (id: string) => {
    const nextDb = {
      ...db,
      expenses: db.expenses.filter(e => e.id !== id)
    };
    updateDb(nextDb);
  };

  // Handler: Post Opportunity from Parent
  const handleCreateOpportunity = (opp: Omit<NewStudentOpportunity, 'id' | 'createdAt' | 'status' | 'interestedTransporters'>) => {
    const newOpp: NewStudentOpportunity = {
      ...opp,
      id: 'opp_' + Date.now().toString(36),
      createdAt: 'Hoje',
      status: 'aguardando_analise',
      interestedTransporters: []
    };
    const nextDb = {
      ...db,
      opportunities: [newOpp, ...db.opportunities]
    };
    updateDb(nextDb);
    saveOpportunityToFirestore(newOpp).catch(err => console.warn('Firestore opp create save:', err));
    alert('Sua solicitação de transporte foi enviada para análise da moderação DTP!');
  };

  // Handler: Send Broadcast Notice
  const handleSendNotice = (notice: Omit<BroadcastNotice, 'id' | 'createdAt'>) => {
    const newNotice: BroadcastNotice = {
      ...notice,
      id: 'not_' + Date.now().toString(36),
      createdAt: 'Agora'
    };
    const nextDb = {
      ...db,
      notices: [newNotice, ...db.notices]
    };
    updateDb(nextDb);
  };

  // Handler: Submit Charter Request
  const handleCharterRequest = (charter: Omit<CharterRequest, 'id' | 'createdAt' | 'status'>) => {
    const newCharter: CharterRequest = {
      ...charter,
      id: 'chart_' + Date.now().toString(36),
      createdAt: new Date().toLocaleDateString('pt-BR'),
      status: 'pendente'
    };
    const nextDb = {
      ...db,
      charters: [newCharter, ...db.charters]
    };
    updateDb(nextDb);
  };

  // Handler: Add Review
  const handleAddReview = (review: Omit<VerifiedReview, 'id' | 'date'>) => {
    const newReview: VerifiedReview = {
      ...review,
      id: 'rev_' + Date.now().toString(36),
      date: new Date().toLocaleDateString('pt-BR'),
      status: 'pendente_moderacao'
    };
    const nextDb = {
      ...db,
      reviews: [newReview, ...db.reviews]
    };
    updateDb(nextDb);
    alert('Sua avaliação foi enviada e será publicada após moderação do DTP!');
  };

  // Admin Handler: Approve Verification
  const handleAdminApproveTransporter = (transporterId: string) => {
    if (!currentUser) return;
    const updatedTransporters = db.transporters.map(t => {
      if (t.id === transporterId) {
        return {
          ...t,
          isVerified: true,
          verification: {
            ...t.verification,
            status: 'aprovado' as const,
            reviewedAt: new Date().toLocaleDateString('pt-BR'),
            reviewedBy: currentUser.n
          }
        };
      }
      return t;
    });

    logAudit(
      db,
      currentUser.email,
      'admin',
      'APROVACAO_DTP',
      `Aprovado credenciamento e selo oficial do transportador ${transporterId}.`
    );

    const nextDb = {
      ...db,
      transporters: updatedTransporters
    };
    updateDb(nextDb);
    alert('Transportador aprovado com sucesso! O selo verde já está ativo nas buscas.');
  };

  // Admin Handler: Reject Verification
  const handleAdminRejectTransporter = (transporterId: string, reason: string) => {
    if (!currentUser) return;
    const updatedTransporters = db.transporters.map(t => {
      if (t.id === transporterId) {
        return {
          ...t,
          isVerified: false,
          verification: {
            ...t.verification,
            status: 'reprovado' as const,
            rejectionReason: reason,
            reviewedAt: new Date().toLocaleDateString('pt-BR'),
            reviewedBy: currentUser.n
          }
        };
      }
      return t;
    });

    logAudit(
      db,
      currentUser.email,
      'admin',
      'REPROVACAO_DTP',
      `Reprovada verificação de ${transporterId}: ${reason}`
    );

    const nextDb = {
      ...db,
      transporters: updatedTransporters
    };
    updateDb(nextDb);
  };

  // Admin Handler: Toggle User Active/Suspended
  const handleToggleUserStatus = (userId: string) => {
    if (!currentUser) return;
    const updatedUsers = db.users.map(u => {
      if (u.id === userId) {
        const nextStatus = u.status === 'ativo' ? 'suspenso' : 'ativo';
        logAudit(
          db,
          currentUser.email,
          'admin',
          'ALTERACAO_STATUS_USUARIO',
          `Usuário ${u.email} alterado para status ${nextStatus}.`
        );
        return { ...u, status: nextStatus as any };
      }
      return u;
    });

    const nextDb = { ...db, users: updatedUsers };
    updateDb(nextDb);
  };

  // Handler: Toggle child presence (Veio à Escola vs Falta)
  const handleTogglePresence = (index: number, isPresent: boolean) => {
    if (!currentUser) return;
    const transporterKey = currentUser.role === 't' ? currentUser.email : 'joao.batista@vanescolar.sp';
    const list = [...(db.kids[transporterKey] || [])];
    if (list[index]) {
      list[index] = {
        ...list[index],
        isPresentToday: isPresent
      };
      updateDb({
        ...db,
        kids: {
          ...db.kids,
          [transporterKey]: list
        }
      });
    }
  };

  // Handler: Set payment status including (Abonar Mensalidade)
  const handleSetChildPaymentStatus = (index: number, status: 'pago' | 'pendente' | 'abonado') => {
    if (!currentUser) return;
    const transporterKey = currentUser.role === 't' ? currentUser.email : 'joao.batista@vanescolar.sp';
    const list = [...(db.kids[transporterKey] || [])];
    if (list[index]) {
      list[index] = {
        ...list[index],
        pg: status === 'pago' ? 1 : status === 'abonado' ? 2 : 0,
        paymentStatus: status
      };
      updateDb({
        ...db,
        kids: {
          ...db.kids,
          [transporterKey]: list
        }
      });
    }
  };

  // Handler: Transporter evaluates parent
  const handleRateParent = (review: Omit<ParentReviewByTransporter, 'id' | 'createdAt' | 'status'>) => {
    const newRev: ParentReviewByTransporter = {
      ...review,
      id: 'prev_' + Date.now().toString(36),
      createdAt: new Date().toLocaleDateString('pt-BR'),
      status: 'pendente_moderacao'
    };
    updateDb({
      ...db,
      parentReviews: [newRev, ...(db.parentReviews || [])]
    });
  };

  // Admin Review Moderation Handlers
  const handleApproveReview = (reviewId: string) => {
    const updated = db.reviews.map(r => r.id === reviewId ? { ...r, status: 'aprovado' as const } : r);
    updateDb({ ...db, reviews: updated });
    alert('Avaliação aprovada e publicada!');
  };

  const handleRejectReview = (reviewId: string) => {
    const updated = db.reviews.map(r => r.id === reviewId ? { ...r, status: 'rejeitado' as const } : r);
    updateDb({ ...db, reviews: updated });
    alert('Avaliação reprovada.');
  };

  const handleApproveParentReview = (reviewId: string) => {
    const updated = (db.parentReviews || []).map(r => r.id === reviewId ? { ...r, status: 'aprovado' as const } : r);
    updateDb({ ...db, parentReviews: updated });
    alert('Avaliação do responsável aprovada e publicada para os transportadores!');
  };

  const handleRejectParentReview = (reviewId: string) => {
    const updated = (db.parentReviews || []).map(r => r.id === reviewId ? { ...r, status: 'reprovado' as const } : r);
    updateDb({ ...db, parentReviews: updated });
    alert('Avaliação do responsável reprovada.');
  };

  // Admin Promotions Handlers
  const handleAddPromotion = (promo: Omit<PartnerPromotion, 'id'>) => {
    const newPromo: PartnerPromotion = {
      ...promo,
      id: 'promo_' + Date.now().toString(36)
    };
    updateDb({
      ...db,
      partnerPromotions: [newPromo, ...(db.partnerPromotions || [])]
    });
    alert('Nova promoção parceira publicada para os transportadores!');
  };

  const handleTogglePromotionActive = (promoId: string) => {
    const updated = (db.partnerPromotions || []).map(p => p.id === promoId ? { ...p, isActive: !p.isActive } : p);
    updateDb({ ...db, partnerPromotions: updated });
  };

  const handleDeletePromotion = (promoId: string) => {
    const updated = (db.partnerPromotions || []).filter(p => p.id !== promoId);
    updateDb({ ...db, partnerPromotions: updated });
  };

  // Admin Service Partners Handlers
  const handleAddPartner = (partner: Omit<ServicePartnerItem, 'id'>) => {
    const newPartner: ServicePartnerItem = {
      ...partner,
      id: 'sp_' + Date.now().toString(36)
    };
    updateDb({
      ...db,
      servicePartners: [newPartner, ...(db.servicePartners || [])]
    });
    alert('Novo parceiro credenciado com sucesso!');
  };

  const handleDeletePartner = (partnerId: string) => {
    const updated = (db.servicePartners || []).filter(p => p.id !== partnerId);
    updateDb({ ...db, servicePartners: updated });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#eef2f5] dark:bg-[#0e1822] text-[#10263b] dark:text-[#eaf0f5] selection:bg-[#ffc400] selection:text-[#10263b]">
      {/* Top Header */}
      <Header
        user={currentUser}
        onLogout={handleLogout}
        onSwitchUser={handleFastLogin}
        onOpenStoreModal={() => setIsStoreModalOpen(true)}
        onOpenPermissions={() => setIsPermissionsModalOpen(true)}
        onOpenLGPD={() => setIsLGPDModalOpen(true)}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        subscriptionTier={currentTransporter.subscriptionTier}
        isVerified={currentTransporter.isVerified}
        canGoBack={tabHistory.length > 1}
        onGoBack={handleGoBack}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-md sm:max-w-3xl md:max-w-5xl lg:max-w-7xl w-full mx-auto p-3 sm:p-5 md:p-6 pt-4 pb-20">
        {!currentUser ? (
          <AuthView
            onLogin={handleLogin}
            onRegister={handleRegister}
            onRegisterParentDetailed={handleRegisterParentDetailed}
            onRegisterDriverDetailed={handleRegisterDriverDetailed}
            onFastLogin={handleFastLogin}
            onGoogleLogin={handleGoogleLogin}
            errorMessage={authError}
          />
        ) : (
          <>
            {/* PARENT VIEWS */}
            {currentUser.role === 'c' && (
              <>
                {/* Netflix Child Profile Quick Switcher Pill */}
                {parentKids.length > 0 && activeChild && (
                  <div className="mb-3.5 flex items-center justify-between bg-white dark:bg-[#16232f] p-2.5 px-3 rounded-2xl border border-[#d6dee6] dark:border-[#26384a] shadow-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#10263b] to-[#1c3044] text-[#ffc400] flex items-center justify-center font-black text-sm shadow-inner">
                        👦
                      </div>
                      <div>
                        <div className="text-[10px] text-[#5d6f80] dark:text-[#93a5b5] font-bold uppercase tracking-wider">
                          Perfil do Aluno Selecionado:
                        </div>
                        <div className="font-black text-xs text-[#10263b] dark:text-white flex items-center gap-1.5">
                          <span>{activeChild.n}</span>
                          <span className="text-[11px] font-bold text-[#0f7f8c] dark:text-[#4cc3d1]">
                            · {activeChild.grade || activeChild.e}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsNetflixSelectorOpen(true)}
                      className="px-2.5 py-1.5 bg-[#ffc400] hover:brightness-105 active:scale-95 text-[#10263b] font-black rounded-xl text-xs transition cursor-pointer shadow-xs flex items-center gap-1"
                    >
                      <Users2 className="w-3.5 h-3.5" />
                      <span>Trocar Perfil</span>
                    </button>
                  </div>
                )}

                {/* If parent has zero kids registered, show raw clean Netflix Profile Creator view */}
                {parentKids.length === 0 && (
                  <div className="mb-4">
                    <NetflixProfileSelector
                      childrenList={parentKids}
                      activeChildId={undefined}
                      onSelectChild={(childId) => setSelectedChildId(childId)}
                      onAddChild={handleAddChildProfile}
                    />
                  </div>
                )}

                {/* Netflix Profile Modal */}
                {isNetflixSelectorOpen && (
                  <NetflixProfileSelector
                    childrenList={parentKids}
                    activeChildId={activeChild?.id}
                    onSelectChild={(childId) => {
                      setSelectedChildId(childId);
                      setIsNetflixSelectorOpen(false);
                    }}
                    onAddChild={handleAddChildProfile}
                    onClose={() => setIsNetflixSelectorOpen(false)}
                    isModal={true}
                  />
                )}

                {tab === 'b' && (
                  <div className="space-y-3.5">
                    {/* Guardian Profile & Family Reputation Quick Access Bar */}
                    <div
                      onClick={() => navigateToTab('p')}
                      className="bg-gradient-to-r from-[#10263b] via-[#1c3044] to-[#26384a] text-white p-3.5 rounded-2xl shadow-sm flex items-center justify-between cursor-pointer group hover:brightness-105 transition border border-[#ffc400]/30"
                      title="Clique para acessar seu perfil de responsável e reputação familiar"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#ffc400] text-[#10263b] font-black flex items-center justify-center text-sm shadow-md shrink-0">
                          {currentUser.n.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="bg-[#1b8a52] text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" /> Responsável Verificado
                            </span>
                            <span className="bg-[#ffc400] text-[#10263b] text-[9px] font-black px-2 py-0.5 rounded-full">
                              Família Nota 10 🌟
                            </span>
                          </div>
                          <h3 className="font-black text-sm text-white mt-0.5 group-hover:text-[#ffc400] transition">
                            {currentUser.n} (Perfil & Reputação Familiar)
                          </h3>
                        </div>
                      </div>
                      <div className="text-right text-xs">
                        <span className="text-[#ffc400] font-black text-sm">5.0 ★★★★★</span>
                        <span className="text-[10px] text-[#93a5b5] block">Ver Área Financeira</span>
                      </div>
                    </div>

                    <SearchCompareView
                      transporters={db.transporters}
                      selectedTransporterId={selectedTransporterId}
                      onSelectTransporter={handleSelectTransporter}
                      onOpenChat={(id) => {
                        handleSelectTransporter(id);
                        navigateToTab('c');
                      }}
                      onRequestOpportunity={() => setIsRequestOppModalOpen(true)}
                    />
                  </div>
                )}

                {tab === 'l' && (
                  <TrackingView
                    transporter={selectedTransporter}
                    child={activeChild}
                    onGoToSearch={() => navigateToTab('b')}
                  />
                )}

                {tab === 'k' && activeChild && (
                  <BoardingConfirmationView
                    child={activeChild}
                    onUpdateChild={(updatedChild) => {
                      const updatedKids = { ...db.kids };
                      const tKey = isDemoParent ? 'joao.batista@vanescolar.sp' : currentUser.email;
                      updatedKids[tKey] = (updatedKids[tKey] || []).map(k =>
                        k.id === updatedChild.id ? updatedChild : k
                      );
                      updateDb({ ...db, kids: updatedKids });
                    }}
                  />
                )}

                {tab === 'p' && (
                  <ParentFinancialView
                    user={currentUser}
                    transporter={selectedTransporter}
                    payments={db.payments}
                    onConfirmPayment={handleConfirmPayment}
                    onGoToSearch={() => navigateToTab('b')}
                  />
                )}

                {tab === 'c' && (
                  !selectedChatConvo ? (
                    <ConversationsListView
                      currentUser={currentUser}
                      conversations={conversationsList}
                      onSelectConversation={(convo) => setSelectedChatConvo(convo)}
                    />
                  ) : (
                    <ChatView
                      chatId={selectedChatConvo.id}
                      chatPartnerName={selectedChatConvo.partnerName}
                      chatPartnerRole="Transportador Escolar"
                      currentUser={currentUser}
                      messages={db.chat[selectedChatConvo.id] || chatMessages}
                      contracts={db.contracts || []}
                      onSendMessage={(text, img, contractProposalId) => handleSendMessage(selectedChatConvo.id, text, img, contractProposalId)}
                      onCreateContract={handleCreateContract}
                      onSignContract={handleSignContract}
                      phoneToCall={selectedChatConvo.partnerPhone || selectedTransporter.phone}
                      defaultChildName={selectedChatConvo.childName || activeChild?.n}
                      onBack={() => setSelectedChatConvo(null)}
                    />
                  )
                )}

                {/* PARENT "MAIS" MENU */}
                {tab === 'o' && (
                  <div className="space-y-3 pb-20">
                    <h2 className="text-xl font-black text-[#10263b] dark:text-white">
                      Mais Recursos para a Família
                    </h2>

                    <div className="grid grid-cols-1 gap-2.5">
                      <button
                        onClick={() => navigateToTab('o_notices')}
                        className="p-4 bg-white dark:bg-[#16232f] rounded-2xl border border-[#d6dee6] dark:border-[#26384a] shadow-xs flex items-center justify-between hover:border-[#ffc400] transition text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-[#0f7f8c]/20 text-[#0f7f8c] rounded-xl font-bold">
                            <Megaphone className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-black text-sm text-[#10263b] dark:text-white">
                              Mural de Comunicados Coletivos
                            </h3>
                            <p className="text-xs text-[#5d6f80]">Avisos de trânsito, imprevistos e recessos</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#5d6f80]" />
                      </button>

                      <button
                        onClick={() => navigateToTab('o_charter')}
                        className="p-4 bg-white dark:bg-[#16232f] rounded-2xl border border-[#d6dee6] dark:border-[#26384a] shadow-xs flex items-center justify-between hover:border-[#ffc400] transition text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-[#1b8a52]/20 text-[#1b8a52] rounded-xl font-bold">
                            <Bus className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-black text-sm text-[#10263b] dark:text-white">
                              Transporte Eventual & Passeios
                            </h3>
                            <p className="text-xs text-[#5d6f80]">Orçamento para excursões e festas escolares</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#5d6f80]" />
                      </button>

                      <button
                        onClick={() => navigateToTab('o_reviews')}
                        className="p-4 bg-white dark:bg-[#16232f] rounded-2xl border border-[#d6dee6] dark:border-[#26384a] shadow-xs flex items-center justify-between hover:border-[#ffc400] transition text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-[#ffc400]/20 text-[#ffc400] rounded-xl font-bold">
                            <Star className="w-5 h-5 fill-[#ffc400]" />
                          </div>
                          <div>
                            <h3 className="font-black text-sm text-[#10263b] dark:text-white">
                              Avaliações Verificadas da Van
                            </h3>
                            <p className="text-xs text-[#5d6f80]">Depoimentos reais de outros pais</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#5d6f80]" />
                      </button>

                      <button
                        onClick={() => navigateToTab('o_support')}
                        className="p-4 bg-white dark:bg-[#16232f] rounded-2xl border border-[#d6dee6] dark:border-[#26384a] shadow-xs flex items-center justify-between hover:border-[#ffc400] transition text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-[#10263b] text-[#ffc400] rounded-xl font-bold">
                            <HelpCircle className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-black text-sm text-[#10263b] dark:text-white">
                              Suporte & Atendimento Oficial
                            </h3>
                            <p className="text-xs text-[#5d6f80]">Central de ajuda, WhatsApp 24h e abertura de chamados</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#5d6f80]" />
                      </button>

                      <button
                        onClick={() => setIsLGPDModalOpen(true)}
                        className="p-4 bg-white dark:bg-[#16232f] rounded-2xl border border-[#d6dee6] dark:border-[#26384a] shadow-xs flex items-center justify-between hover:border-[#ffc400] transition text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-[#0f7f8c]/20 text-[#0f7f8c] rounded-xl font-bold">
                            <ShieldCheck className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-black text-sm text-[#10263b] dark:text-white">
                              Privacidade & Proteção de Crianças (LGPD)
                            </h3>
                            <p className="text-xs text-[#5d6f80]">Termos de segurança de dados de menores</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#5d6f80]" />
                      </button>
                    </div>
                  </div>
                )}

                {tab === 'o_notices' && (
                  <BroadcastNoticeView
                    role={currentUser.role}
                    notices={db.notices}
                    onSendNotice={handleSendNotice}
                  />
                )}
                {tab === 'o_charter' && (
                  <CharterRequestView
                    userRole={currentUser.role}
                    userName={currentUser.n}
                    userEmail={currentUser.email}
                    charters={db.charters}
                    transporters={db.transporters}
                    onSubmitCharter={handleCharterRequest}
                  />
                )}
                {tab === 'o_reviews' && (
                  <VerifiedReviewsView
                    transporter={selectedTransporter}
                    reviews={db.reviews}
                    onAddReview={handleAddReview}
                    currentUserEmail={currentUser.email}
                    currentUserName={currentUser.n}
                    hasActiveHire={true}
                  />
                )}
                {tab === 'o_support' && (
                  <SupportView
                    currentUser={currentUser}
                    onBack={() => navigateToTab('o')}
                  />
                )}
              </>
            )}

            {/* TRANSPORTER VIEWS */}
            {currentUser.role === 't' && (
              <>
                {tab === 'opp' && (
                  <NewStudentOpportunitiesView
                    opportunities={db.opportunities}
                    transporter={currentTransporter}
                    parentReviews={db.parentReviews || []}
                    onExpressInterest={handleExpressInterest}
                    onOpenChatWithParent={(email, name) => {
                      navigateToTab('m_chat');
                    }}
                    onUpdateCoverage={(regions, schools) => {
                      const updatedTransporters = db.transporters.map(t =>
                        t.email === currentUser.email ? { ...t, regions, schools } : t
                      );
                      updateDb({ ...db, transporters: updatedTransporters });
                    }}
                  />
                )}

                {tab === 'k' && (
                  <StudentsManagementView
                    kids={transporterKidsList}
                    currentUser={currentUser}
                    subscriptionTier={currentTransporter.subscriptionTier}
                    parentReviews={db.parentReviews || []}
                    onAddChild={handleAddChild}
                    onDeleteChild={handleDeleteChild}
                    onUpdateChildAttendance={handleUpdateAttendance}
                    onTogglePresence={handleTogglePresence}
                    onRateParent={handleRateParent}
                    onUpgradeClick={() => navigateToTab('m_sub')}
                    onOpenChatWithParent={(email, name) => {
                      navigateToTab('m_chat');
                    }}
                  />
                )}

                {tab === 'r' && (
                  <RouteOptimizerView
                    kids={transporterKidsList}
                    stops={db.boardingStops?.[currentUser.email] || []}
                    onUpdateStops={(newStops) => {
                      const updatedStops = {
                        ...(db.boardingStops || {}),
                        [currentUser.email]: newStops
                      };
                      updateDb({ ...db, boardingStops: updatedStops });
                    }}
                    onRecordBoardingEvent={(event) => {
                      const existing = db.boardingHistory || [];
                      updateDb({ ...db, boardingHistory: [event, ...existing] });
                    }}
                    driverName={currentTransporter.name}
                    driverPhone={currentTransporter.phone}
                    subscriptionTier={currentTransporter.subscriptionTier}
                    onUpgradeClick={() => navigateToTab('m_sub')}
                  />
                )}

                {tab === 'p' && (
                  <TransporterFinancialDashboard
                    transporterEmail={currentUser.email}
                    kids={transporterKidsList}
                    payments={db.payments}
                    transfers={db.transfers || []}
                    expenses={db.expenses}
                    bankAccount={currentTransporter.bankAccount}
                    subscriptionTier={currentTransporter.subscriptionTier}
                    onUpgradeClick={() => navigateToTab('m_sub')}
                    onAddExpense={handleAddExpense}
                    onDeleteExpense={handleDeleteExpense}
                    onToggleChildPaid={(idx) => {
                      const list = [...(db.kids[currentUser.email] || db.kids['joao.batista@vanescolar.sp'] || [])];
                      if (list[idx]) {
                        list[idx] = { ...list[idx], pg: list[idx].pg === 1 ? 0 : 1 };
                        updateDb({ ...db, kids: { ...db.kids, [currentUser.email]: list } });
                      }
                    }}
                    onSetChildPaymentStatus={handleSetChildPaymentStatus}
                    onProcessPixWebhook={(webhook) => {
                      const result = processIncomingPixWebhook(webhook, currentTransporter.bankAccount);
                      const updatedPayments = [result.paymentRecord, ...db.payments.filter(p => p.id !== result.paymentRecord.id)];
                      const updatedTransfers = [result.transferRecord, ...(db.transfers || [])];
                      const currentKids = db.kids[currentUser.email] || db.kids['joao.batista@vanescolar.sp'] || [];
                      const updatedKids = currentKids.map(k => {
                        if (k.n === webhook.childName) {
                          return { ...k, pg: 1, paymentStatus: 'pago' as const };
                        }
                        return k;
                      });
                      updateDb({
                        ...db,
                        payments: updatedPayments,
                        transfers: updatedTransfers,
                        kids: {
                          ...db.kids,
                          [currentUser.email]: updatedKids
                        }
                      });
                      logAudit(
                        db,
                        currentUser.email,
                        currentUser.role,
                        'WEBHOOK_PIX_RECEBIDO',
                        `Pix automático confirmado R$ ${webhook.amount.toFixed(2)}${webhook.childName ? ` (${webhook.childName})` : ''}. Repasse líquido R$ ${result.transferRecord.netAmount.toFixed(2)} agendado.`
                      );
                    }}
                  />
                )}

                {tab === 'v' && (
                  <MyVanMaintenanceView
                    maintenance={db.maintenance[currentUser.email] || db.maintenance['joao.batista@vanescolar.sp']}
                    transporter={currentTransporter}
                    onUpdateKm={(newKm) => {
                      const m = db.maintenance[currentUser.email] || db.maintenance['joao.batista@vanescolar.sp'];
                      if (m) {
                        const updatedM = { ...m, currentKm: newKm };
                        updateDb({
                          ...db,
                          maintenance: { ...db.maintenance, [currentUser.email]: updatedM }
                        });
                      }
                    }}
                    onLogMaintenance={(item) => {
                      alert(`Registro de ${item} atualizado na ficha da van!`);
                    }}
                  />
                )}

                {/* TRANSPORTER "MAIS" MENU */}
                {tab === 'm' && (
                  <div className="space-y-3 pb-20">
                    <h2 className="text-xl font-black text-[#10263b] dark:text-white">
                      Recursos & Negócios do Transportador
                    </h2>

                    <div className="grid grid-cols-1 gap-2.5">
                      <button
                        onClick={() => navigateToTab('m_profile')}
                        className="p-4 bg-white dark:bg-[#16232f] rounded-2xl border border-[#d6dee6] dark:border-[#26384a] shadow-xs flex items-center justify-between hover:border-[#ffc400] transition text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-[#1b8a52]/20 text-[#1b8a52] rounded-xl font-bold">
                            <ShieldCheck className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-black text-sm text-[#10263b] dark:text-white">
                              Perfil Profissional & Escolas Atendidas
                            </h3>
                            <p className="text-xs text-[#5d6f80]">Documentos DTP, horários e fotos do veículo</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#5d6f80]" />
                      </button>

                      <button
                        onClick={() => navigateToTab('m_sub')}
                        className="p-4 bg-white dark:bg-[#16232f] rounded-2xl border border-[#d6dee6] dark:border-[#26384a] shadow-xs flex items-center justify-between hover:border-[#ffc400] transition text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-[#ffc400]/20 text-[#10263b] dark:text-[#ffc400] rounded-xl font-bold">
                            <Award className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-black text-sm text-[#10263b] dark:text-white">
                              Planos de Assinatura (Gratuito, Pro, Premium)
                            </h3>
                            <p className="text-xs text-[#5d6f80]">Destrave alunos ilimitados e contrato digital</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#5d6f80]" />
                      </button>

                      <button
                        onClick={() => navigateToTab('m_ref')}
                        className="p-4 bg-white dark:bg-[#16232f] rounded-2xl border border-[#d6dee6] dark:border-[#26384a] shadow-xs flex items-center justify-between hover:border-[#ffc400] transition text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-[#ffc400]/20 text-[#ffc400] rounded-xl font-bold">
                            <Gift className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-black text-sm text-[#10263b] dark:text-white">
                              Indique um Colega (Ganhe 1 Mês Grátis)
                            </h3>
                            <p className="text-xs text-[#5d6f80]">Indique outro transportador e ganhe mensalidade grátis</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#5d6f80]" />
                      </button>

                      <button
                        onClick={() => navigateToTab('m_services')}
                        className="p-4 bg-white dark:bg-[#16232f] rounded-2xl border border-[#d6dee6] dark:border-[#26384a] shadow-xs flex items-center justify-between hover:border-[#ffc400] transition text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-[#0f7f8c]/20 text-[#0f7f8c] rounded-xl font-bold">
                            <Layers className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-black text-sm text-[#10263b] dark:text-white">
                              Serviços (Funileiro, Mecânicos, Tapeçaria, Peças, Locação e Freelancer)
                            </h3>
                            <p className="text-xs text-[#5d6f80]">Rede parceira e motoristas freelancers substitutos</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#5d6f80]" />
                      </button>

                      <button
                        onClick={() => navigateToTab('m_notices')}
                        className="p-4 bg-white dark:bg-[#16232f] rounded-2xl border border-[#d6dee6] dark:border-[#26384a] shadow-xs flex items-center justify-between hover:border-[#ffc400] transition text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-[#c93c3c]/20 text-[#c93c3c] rounded-xl font-bold">
                            <Megaphone className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-black text-sm text-[#10263b] dark:text-white">
                              Mural de Comunicados Coletivos
                            </h3>
                            <p className="text-xs text-[#5d6f80]">Disparar avisos de trânsito e recados a todos os pais</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#5d6f80]" />
                      </button>

                      <button
                        onClick={() => navigateToTab('m_support')}
                        className="p-4 bg-white dark:bg-[#16232f] rounded-2xl border border-[#d6dee6] dark:border-[#26384a] shadow-xs flex items-center justify-between hover:border-[#ffc400] transition text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-[#10263b] text-[#ffc400] rounded-xl font-bold">
                            <HelpCircle className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-black text-sm text-[#10263b] dark:text-white">
                              Suporte & Atendimento ao Transportador
                            </h3>
                            <p className="text-xs text-[#5d6f80]">Dúvidas fiscais, repasses Pix, alvará DTP e chamados técnicos</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#5d6f80]" />
                      </button>

                      <button
                        onClick={() => navigateToTab('m_chat')}
                        className="p-4 bg-white dark:bg-[#16232f] rounded-2xl border border-[#d6dee6] dark:border-[#26384a] shadow-xs flex items-center justify-between hover:border-[#ffc400] transition text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-[#ffc400]/20 text-[#ffc400] rounded-xl font-bold">
                            <MessageSquare className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-black text-sm text-[#10263b] dark:text-white">
                              Chat com Famílias & Contratos
                            </h3>
                            <p className="text-xs text-[#5d6f80]">Conversas abertas, propostas e emissão de contratos</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#5d6f80]" />
                      </button>
                    </div>
                  </div>
                )}

                {tab === 'm_support' && (
                  <SupportView
                    currentUser={currentUser}
                    onBack={() => navigateToTab('m')}
                  />
                )}

                {tab === 'm_profile' && (
                  <TransporterProfileView
                    transporter={currentTransporter}
                    onUpdateProfile={(updated) => {
                      let updatedProfileObj: TransporterProfile | null = null;
                      const updatedTransporters = db.transporters.map(t => {
                        if (t.id === currentTransporter.id) {
                          const updatedObj = { ...t, ...updated };
                          updatedProfileObj = updatedObj;
                          return updatedObj;
                        }
                        return t;
                      });
                      updateDb({ ...db, transporters: updatedTransporters });
                      if (updatedProfileObj) {
                        saveTransporterToFirestore(updatedProfileObj).catch(err => console.warn('Firestore transporter update save:', err));
                      }
                    }}
                    onSubmitVerificationDocs={(docs, cnhNum, cnhCat, dtpNum) => {
                      let updatedProfileObj: TransporterProfile | null = null;
                      const updatedTransporters = db.transporters.map(t => {
                        if (t.id === currentTransporter.id) {
                          const updatedObj = {
                            ...t,
                            verification: {
                              ...t.verification,
                              status: 'pendente' as const,
                              cnhNumber: cnhNum,
                              cnhCategory: cnhCat,
                              dtpNumber: dtpNum,
                              documents: docs
                            }
                          };
                          updatedProfileObj = updatedObj;
                          return updatedObj;
                        }
                        return t;
                      });
                      updateDb({ ...db, transporters: updatedTransporters });
                      if (updatedProfileObj) {
                        saveTransporterToFirestore(updatedProfileObj).catch(err => console.warn('Firestore transporter docs save:', err));
                      }
                    }}
                  />
                )}

                {tab === 'm_sub' && (
                  <SubscriptionsView
                    currentTier={currentTransporter.subscriptionTier}
                    driverName={currentTransporter.name}
                    driverEmail={currentTransporter.email}
                    activeContract={db.subscriptionContracts?.find(c => c.driverEmail === currentTransporter.email) || null}
                    onSelectTier={(tier) => {
                      const updatedTransporters = db.transporters.map(t =>
                        t.id === currentTransporter.id ? { ...t, subscriptionTier: tier } : t
                      );
                      updateDb({ ...db, transporters: updatedTransporters });
                      alert(`Plano alterado para ${tier.toUpperCase()} com sucesso!`);
                    }}
                    onSaveSubscriptionContract={(contract) => {
                      const current = db.subscriptionContracts || [];
                      updateDb({ ...db, subscriptionContracts: [contract, ...current] });
                    }}
                    onCancelSubscription={() => {
                      const updatedTransporters = db.transporters.map(t =>
                        t.id === currentTransporter.id ? { ...t, subscriptionTier: 'free' as const } : t
                      );
                      updateDb({ ...db, transporters: updatedTransporters });
                      alert('Assinatura recorrente cancelada. Sua conta permanecerá ativa até o término do ciclo atual.');
                    }}
                  />
                )}

                {tab === 'm_ref' && (
                  <TransporterReferralView
                    user={currentUser}
                    subscriptionTier={currentTransporter.subscriptionTier}
                  />
                )}

                {tab === 'm_services' && (
                  <ServicesPartnersView
                    partners={db.servicePartners || []}
                    promotions={db.partnerPromotions || []}
                    freelanceDrivers={db.freelanceDrivers || []}
                    subscriptionTier={currentTransporter.subscriptionTier}
                    onNavigateToSubscriptions={() => navigateToTab('m_sub')}
                  />
                )}

                {tab === 'm_notices' && (
                  <BroadcastNoticeView
                    role={currentUser.role}
                    notices={db.notices}
                    onSendNotice={handleSendNotice}
                    transporterName={currentTransporter.name}
                    transporterEmail={currentTransporter.email}
                  />
                )}

                {tab === 'm_chat' && (
                  !selectedChatConvo ? (
                    <ConversationsListView
                      currentUser={currentUser}
                      conversations={conversationsList}
                      onSelectConversation={(convo) => setSelectedChatConvo(convo)}
                    />
                  ) : (
                    <ChatView
                      chatId={selectedChatConvo.id}
                      chatPartnerName={selectedChatConvo.partnerName}
                      chatPartnerRole="Responsável / Família"
                      currentUser={currentUser}
                      messages={db.chat[selectedChatConvo.id] || chatMessages}
                      contracts={db.contracts || []}
                      onSendMessage={(text, img, contractProposalId) => handleSendMessage(selectedChatConvo.id, text, img, contractProposalId)}
                      onCreateContract={handleCreateContract}
                      onSignContract={handleSignContract}
                      phoneToCall={selectedChatConvo.partnerPhone || "(11) 98811-2233"}
                      defaultChildName={selectedChatConvo.childName || "Lucas Almeida"}
                      defaultSchoolName={selectedChatConvo.schoolName || "EMEF Santa Rita"}
                      onBack={() => setSelectedChatConvo(null)}
                    />
                  )
                )}
              </>
            )}

            {/* ADMIN VIEWS */}
            {currentUser.role === 'a' && (
              <AdminDashboardView
                currentAdmin={currentUser}
                users={db.users}
                transporters={db.transporters}
                reports={db.reports}
                auditLogs={db.auditLogs}
                contracts={db.contracts || []}
                reviews={db.reviews}
                parentReviews={db.parentReviews || []}
                servicePartners={db.servicePartners || []}
                partnerPromotions={db.partnerPromotions || []}
                opportunities={db.opportunities || []}
                freelanceDrivers={db.freelanceDrivers || []}
                onApproveTransporter={handleAdminApproveTransporter}
                onRejectTransporter={handleAdminRejectTransporter}
                onToggleUserStatus={handleToggleUserStatus}
                onApproveReview={handleApproveReview}
                onRejectReview={handleRejectReview}
                onApproveParentReview={handleApproveParentReview}
                onRejectParentReview={handleRejectParentReview}
                onAddPromotion={handleAddPromotion}
                onTogglePromotionActive={handleTogglePromotionActive}
                onDeletePromotion={handleDeletePromotion}
                onAddPartner={handleAddPartner}
                onDeletePartner={handleDeletePartner}
                onApproveOpportunity={(oppId) => {
                  const updated = db.opportunities.map(o => o.id === oppId ? { ...o, status: 'aprovada' as const } : o);
                  updateDb({ ...db, opportunities: updated });
                }}
                onRejectOpportunity={(oppId, reason) => {
                  const updated = db.opportunities.map(o => o.id === oppId ? { ...o, status: 'reprovada' as const, rejectionReason: reason } : o);
                  updateDb({ ...db, opportunities: updated });
                }}
                onAddFreelanceDriver={(driver) => {
                  const current = db.freelanceDrivers || [];
                  updateDb({ ...db, freelanceDrivers: [driver, ...current] });
                }}
              />
            )}
          </>
        )}
      </main>

      {/* Fixed Bottom Navigation (when logged in) */}
      {currentUser && (
        <Navigation
          role={currentUser.role}
          currentTab={tab.startsWith('o_') ? 'o' : tab.startsWith('m_') ? 'm' : tab}
          onSelectTab={(selected) => navigateToTab(selected)}
          newOpportunitiesCount={db.opportunities.length}
          pendingDocsCount={db.transporters.filter(t => !t.isVerified).length}
        />
      )}

      {/* Modals */}
      <InstallModal
        isOpen={isStoreModalOpen}
        onClose={() => setIsStoreModalOpen(false)}
      />

      <LGPDModal
        isOpen={isLGPDModalOpen}
        onClose={() => setIsLGPDModalOpen(false)}
      />

      <DevicePermissionsModal
        isOpen={isPermissionsModalOpen}
        onClose={() => setIsPermissionsModalOpen(false)}
      />

      {currentUser && (
        <RequestOpportunityModal
          isOpen={isRequestOppModalOpen}
          onClose={() => setIsRequestOppModalOpen(false)}
          onSubmit={handleCreateOpportunity}
          parentName={currentUser.n}
          parentEmail={currentUser.email}
        />
      )}
    </div>
  );
}
