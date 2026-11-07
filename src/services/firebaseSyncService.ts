import {
  db,
  OperationType,
  handleFirestoreError
} from '../firebase';
import {
  doc,
  setDoc,
  deleteDoc,
  collection,
  onSnapshot
} from 'firebase/firestore';
import {
  User,
  TransporterProfile,
  Child,
  ContractProposal,
  NewStudentOpportunity,
  ExpenseRecord,
  ChatMsg
} from '../types';
import { VespDatabase } from './storage';

export interface SupportTicketData {
  id: string;
  userEmail: string;
  userName: string;
  subject: string;
  category: string;
  message: string;
  status: 'aberto' | 'em_atendimento' | 'resolvido';
  createdAt: string;
  protocol?: string;
}

// 1. Save or update User Profile to Firebase Firestore
export async function saveUserToFirestore(user: User): Promise<void> {
  const path = `users/${user.id}`;
  try {
    const cleanUser = {
      id: user.id,
      email: user.email.toLowerCase(),
      name: user.n,
      role: user.role,
      phone: user.phone || '',
      cpf: user.cpf || user.cpfCnpj || '',
      subscriptionTier: user.subscriptionTier || 'free',
      status: user.status || 'ativo',
      createdAt: user.createdAt || new Date().toLocaleDateString('pt-BR'),
      children: user.children || [],
      nickname: user.nickname || '',
      photoUrl: user.photoUrl || ''
    };
    await setDoc(doc(db, 'users', user.id), cleanUser, { merge: true });
  } catch (err) {
    console.warn('Error saving user to Firestore:', err);
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// 2. Save or update Transporter Profile to Firebase Firestore
export async function saveTransporterToFirestore(transporter: TransporterProfile): Promise<void> {
  const path = `transporters/${transporter.id}`;
  try {
    const cleanTransporter = {
      id: transporter.id,
      name: transporter.name,
      email: transporter.email.toLowerCase(),
      phone: transporter.phone || '',
      nickname: transporter.nickname || '',
      photoUrl: transporter.photoUrl || '',
      vanModel: transporter.vanModel || '',
      vanPlate: transporter.vanPlate || '',
      vanYear: transporter.vanYear || 2022,
      seatsTotal: transporter.seatsTotal || 15,
      seatsAvailable: transporter.seatsAvailable || 5,
      subscriptionTier: transporter.subscriptionTier || 'free',
      isVerified: transporter.isVerified || false,
      schoolsAttended: transporter.schoolsAttended || '',
      neighborhoodsAttended: transporter.neighborhoodsAttended || '',
      basePrice: transporter.basePrice || 420,
      rating: transporter.rating || 5.0,
      reviewsCount: transporter.reviewsCount || 0
    };
    await setDoc(doc(db, 'transporters', transporter.id), cleanTransporter, { merge: true });
  } catch (err) {
    console.warn('Error saving transporter to Firestore:', err);
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// 3. Save or update Student to Firebase Firestore
export async function saveStudentToFirestore(
  student: Child,
  transporterEmail: string
): Promise<void> {
  const path = `students/${student.id}`;
  try {
    const cleanStudent = {
      id: student.id,
      name: student.n,
      age: student.i,
      parentEmail: (student.guardianEmail || '').toLowerCase(),
      transporterEmail: transporterEmail.toLowerCase(),
      school: student.e || '',
      address: student.d || '',
      neighborhood: student.neighborhood || '',
      guardianName: student.r || '',
      guardianPhone: student.t || '',
      notes: student.o || '',
      paymentStatus: student.paymentStatus || 'pendente',
      isPresentToday: student.isPresentToday !== false
    };
    await setDoc(doc(db, 'students', student.id), cleanStudent, { merge: true });
  } catch (err) {
    console.warn('Error saving student to Firestore:', err);
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// 4. Delete Student from Firebase Firestore
export async function deleteStudentFromFirestore(studentId: string): Promise<void> {
  const path = `students/${studentId}`;
  try {
    await deleteDoc(doc(db, 'students', studentId));
  } catch (err) {
    console.warn('Error deleting student from Firestore:', err);
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// 5. Save or update Contract to Firebase Firestore
export async function saveContractToFirestore(contract: ContractProposal): Promise<void> {
  const path = `contracts/${contract.id}`;
  try {
    const cleanContract = {
      id: contract.id,
      transporterEmail: contract.transporterEmail.toLowerCase(),
      transporterName: contract.transporterName,
      parentEmail: contract.parentEmail.toLowerCase(),
      parentName: contract.parentName,
      childName: contract.childName,
      schoolName: contract.schoolName || '',
      period: contract.period || 'Manhã',
      agreedMonthlyValue: contract.agreedMonthlyValue,
      contractTermMonths: contract.contractTermMonths || 12,
      pickupAddress: contract.pickupAddress || '',
      dropoffAddress: contract.dropoffAddress || '',
      status: contract.status,
      createdAt: contract.createdAt || new Date().toLocaleDateString('pt-BR'),
      parentSignature: contract.parentSignature || null,
      transporterSignature: contract.transporterSignature || null
    };
    await setDoc(doc(db, 'contracts', contract.id), cleanContract, { merge: true });
  } catch (err) {
    console.warn('Error saving contract to Firestore:', err);
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// 6. Save Support Ticket to Firebase Firestore
export async function saveSupportTicketToFirestore(ticket: SupportTicketData): Promise<void> {
  const path = `support_tickets/${ticket.id}`;
  try {
    const cleanTicket = {
      id: ticket.id,
      userEmail: ticket.userEmail.toLowerCase(),
      userName: ticket.userName,
      subject: ticket.subject,
      category: ticket.category,
      message: ticket.message,
      status: ticket.status || 'aberto',
      createdAt: ticket.createdAt || new Date().toLocaleString('pt-BR'),
      protocol: ticket.protocol || `PROT-${Date.now().toString(36).toUpperCase()}`
    };
    await setDoc(doc(db, 'support_tickets', ticket.id), cleanTicket, { merge: true });
  } catch (err) {
    console.warn('Error saving support ticket to Firestore:', err);
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// 7. Save Chat Message to Firebase Firestore
export async function saveChatMessageToFirestore(chatKey: string, message: ChatMsg): Promise<void> {
  const msgDocId = `msg_${message.id}`;
  const path = `chats/${msgDocId}`;
  try {
    const cleanMsg = {
      id: message.id,
      chatKey,
      f: message.f,
      senderName: message.senderName || '',
      x: message.x,
      time: message.time,
      contractProposalId: message.contractProposalId || null
    };
    await setDoc(doc(db, 'chats', msgDocId), cleanMsg, { merge: true });
  } catch (err) {
    console.warn('Error saving chat message to Firestore:', err);
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// 8. Save Opportunity to Firebase Firestore
export async function saveOpportunityToFirestore(opp: NewStudentOpportunity): Promise<void> {
  const path = `opportunities/${opp.id}`;
  try {
    const cleanOpp = {
      id: opp.id,
      parentEmail: opp.parentEmail.toLowerCase(),
      parentName: opp.parentName,
      parentPhone: opp.parentPhone || '',
      childName: opp.childName,
      school: opp.school,
      neighborhood: opp.neighborhood || '',
      region: opp.region || '',
      desiredSchedule: opp.desiredSchedule || 'Manhã',
      pickupAddress: opp.pickupAddress || '',
      dropoffAddress: opp.dropoffAddress || '',
      notes: opp.notes || '',
      status: opp.status || 'aberta',
      createdAt: opp.createdAt || new Date().toLocaleDateString('pt-BR')
    };
    await setDoc(doc(db, 'opportunities', opp.id), cleanOpp, { merge: true });
  } catch (err) {
    console.warn('Error saving opportunity to Firestore:', err);
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// 9. Save Expense Record to Firebase Firestore
export async function saveExpenseToFirestore(expense: ExpenseRecord): Promise<void> {
  const path = `expenses/${expense.id}`;
  try {
    const cleanExpense = {
      id: expense.id,
      transporterEmail: expense.transporterEmail.toLowerCase(),
      category: expense.category,
      amount: expense.amount,
      date: expense.date,
      description: expense.description || ''
    };
    await setDoc(doc(db, 'expenses', expense.id), cleanExpense, { merge: true });
  } catch (err) {
    console.warn('Error saving expense to Firestore:', err);
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// 10. Real-time Firebase Sync Listener setup for live database updates
export function setupFirestoreListeners(
  setDbState: React.Dispatch<React.SetStateAction<VespDatabase>>
): () => void {
  const unsubscribes: (() => void)[] = [];

  try {
    // Listen to contracts
    const unsubContracts = onSnapshot(
      collection(db, 'contracts'),
      (snapshot) => {
        const firestoreContracts: ContractProposal[] = snapshot.docs.map(docSnap => {
          const d = docSnap.data();
          return {
            id: d.id || docSnap.id,
            transporterEmail: d.transporterEmail,
            transporterName: d.transporterName,
            parentEmail: d.parentEmail,
            parentName: d.parentName,
            childName: d.childName,
            schoolName: d.schoolName || '',
            period: d.period || 'Manhã',
            agreedMonthlyValue: d.agreedMonthlyValue || 420,
            contractTermMonths: d.contractTermMonths || 12,
            startDate: d.createdAt || new Date().toLocaleDateString('pt-BR'),
            pickupAddress: d.pickupAddress || '',
            dropoffAddress: d.dropoffAddress || '',
            clauses: d.clauses || ['Contrato padrão Van Escolar SP'],
            status: d.status || 'proposta_enviada',
            createdAt: d.createdAt || new Date().toLocaleDateString('pt-BR'),
            parentSignature: d.parentSignature || undefined,
            transporterSignature: d.transporterSignature || undefined
          };
        });

        if (firestoreContracts.length > 0) {
          setDbState(prev => {
            const merged = [...prev.contracts];
            firestoreContracts.forEach(fc => {
              const idx = merged.findIndex(c => c.id === fc.id);
              if (idx >= 0) {
                merged[idx] = { ...merged[idx], ...fc };
              } else {
                merged.push(fc);
              }
            });
            return { ...prev, contracts: merged };
          });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'contracts');
      }
    );
    unsubscribes.push(unsubContracts);

    // Listen to opportunities
    const unsubOpps = onSnapshot(
      collection(db, 'opportunities'),
      (snapshot) => {
        const firestoreOpps: NewStudentOpportunity[] = snapshot.docs.map(docSnap => {
          const d = docSnap.data();
          return {
            id: d.id || docSnap.id,
            parentEmail: d.parentEmail,
            parentName: d.parentName,
            parentPhone: d.parentPhone || '',
            childName: d.childName,
            school: d.school,
            neighborhood: d.neighborhood || 'Centro',
            region: d.region || 'Zona Sul',
            desiredSchedule: d.desiredSchedule || 'Manhã',
            childCount: 1,
            startDate: d.createdAt || new Date().toLocaleDateString('pt-BR'),
            pickupAddress: d.pickupAddress,
            dropoffAddress: d.dropoffAddress,
            notes: d.notes,
            status: d.status || 'aberta',
            interestedTransporters: d.interestedTransporters || [],
            createdAt: d.createdAt || new Date().toLocaleDateString('pt-BR')
          };
        });

        if (firestoreOpps.length > 0) {
          setDbState(prev => {
            const merged = [...prev.opportunities];
            firestoreOpps.forEach(fo => {
              const idx = merged.findIndex(o => o.id === fo.id);
              if (idx >= 0) {
                merged[idx] = { ...merged[idx], ...fo };
              } else {
                merged.unshift(fo);
              }
            });
            return { ...prev, opportunities: merged };
          });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'opportunities');
      }
    );
    unsubscribes.push(unsubOpps);

    // Listen to chat messages
    const unsubChats = onSnapshot(
      collection(db, 'chats'),
      (snapshot) => {
        const newChatsMap: Record<string, ChatMsg[]> = {};
        snapshot.docs.forEach(docSnap => {
          const d = docSnap.data();
          if (d.chatKey && d.x) {
            if (!newChatsMap[d.chatKey]) {
              newChatsMap[d.chatKey] = [];
            }
            newChatsMap[d.chatKey].push({
              id: d.id || docSnap.id,
              f: d.f,
              senderName: d.senderName,
              x: d.x,
              contractProposalId: d.contractProposalId,
              time: d.time
            });
          }
        });

        if (Object.keys(newChatsMap).length > 0) {
          setDbState(prev => {
            const updatedChat = { ...prev.chat };
            Object.entries(newChatsMap).forEach(([chatKey, msgs]) => {
              const existingMsgs = updatedChat[chatKey] || [];
              const combined = [...existingMsgs];
              msgs.forEach(m => {
                if (!combined.some(em => em.id === m.id)) {
                  combined.push(m);
                }
              });
              updatedChat[chatKey] = combined;
            });
            return { ...prev, chat: updatedChat };
          });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'chats');
      }
    );
    unsubscribes.push(unsubChats);

  } catch (err) {
    console.warn('Error initializing Firestore snapshot listeners:', err);
  }

  return () => {
    unsubscribes.forEach(unsub => unsub());
  };
}
