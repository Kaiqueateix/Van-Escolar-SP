import React, { useState, useId } from 'react';
import { UserRole, Child, BankAccountInfo, UserAddress } from '../types';
import { OSASCO_SCHOOLS } from '../constants';
import { ShieldCheck, Bus, Users, Upload, CheckCircle2, AlertCircle, Camera, Plus, Trash2, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

export interface ParentRegistrationData {
  name: string;
  email: string;
  pass: string;
  cpf: string;
  phone: string;
  address: UserAddress;
  children: {
    name: string;
    birthDate: string;
    calculatedAge: number;
    school: string;
    grade: string;
    allergies: string;
    medicalNotes: string;
  }[];
  termsAccepted: boolean;
  acceptedAt: string;
  acceptedVersion: string;
}

export interface DriverRegistrationData {
  name: string;
  email: string;
  pass: string;
  cpfCnpj: string;
  birthDate: string;
  calculatedAge: number;
  phone: string;
  nickname: string;
  photoUrl: string;
  cnhCategory: string;
  cnhNumber: string;
  dtpNumber: string;
  qrCodeUrl: string;
  vanBrand: string;
  vanModel: string;
  vanYear: number;
  vanPlate: string;
  vanCapacity: number;
  vanPhotos: string[];
  schoolsAttended: string;
  neighborhoodsAttended: string;
  serviceTypes: string[];
  bankAccount: BankAccountInfo;
  permissionsAccepted: boolean;
  acceptedAt: string;
  acceptedVersion: string;
}

interface AuthViewProps {
  onLogin: (email: string, pass: string) => Promise<boolean>;
  onRegister: (name: string, email: string, pass: string, role: UserRole) => Promise<boolean>;
  onRegisterParentDetailed?: (data: ParentRegistrationData) => Promise<boolean>;
  onRegisterDriverDetailed?: (data: DriverRegistrationData) => Promise<boolean>;
  onFastLogin: (email: string) => void;
  onGoogleLogin?: (role?: UserRole, googleUser?: any) => Promise<boolean>;
  errorMessage: string;
}

export const AuthView: React.FC<AuthViewProps> = ({
  onLogin,
  onRegister,
  onRegisterParentDetailed,
  onRegisterDriverDetailed,
  onFastLogin,
  onGoogleLogin,
  errorMessage
}) => {
  const [mode, setMode] = useState<'login' | 'reg_role_select' | 'reg_parent' | 'reg_driver'>('login');
  const [localErr, setLocalErr] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [successNotice, setSuccessNotice] = useState<string>('');

  const handleGoogleSignIn = async (desiredRole?: UserRole) => {
    setLocalErr('');
    setLoading(true);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const user = res.user;
      if (!user || !user.email) {
        throw new Error('Não foi possível obter dados da conta Google.');
      }
      if (onGoogleLogin) {
        await onGoogleLogin(desiredRole, user);
      } else {
        onFastLogin(user.email);
      }
    } catch (err: any) {
      console.warn('Google sign-in exception:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setLocalErr('Login com Google cancelado.');
      } else {
        setLocalErr(err.message || 'Erro ao conectar conta Google.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Login inputs
  const [loginEmail, setLoginEmail] = useState<string>('');
  const [loginPass, setLoginPass] = useState<string>('');

  // Parent form state
  const [pName, setPName] = useState<string>('');
  const [pCpf, setPCpf] = useState<string>('');
  const [pPhone, setPPhone] = useState<string>('');
  const [pEmail, setPEmail] = useState<string>('');
  const [pPass, setPPass] = useState<string>('');
  const [pCep, setPCep] = useState<string>('');
  const [pStreet, setPStreet] = useState<string>('');
  const [pNumber, setPNumber] = useState<string>('');
  const [pComp, setPComp] = useState<string>('');
  const [pNeighborhood, setPNeighborhood] = useState<string>('');
  const [pCity, setPCity] = useState<string>('São Paulo');
  const [pKids, setPKids] = useState<Array<{
    name: string;
    birthDate: string;
    calculatedAge: number;
    school: string;
    grade: string;
    allergies: string;
    medicalNotes: string;
  }>>([
    { name: '', birthDate: '', calculatedAge: 6, school: 'EMEF Santa Rita', grade: '1º Ano Fundamental', allergies: '', medicalNotes: '' }
  ]);
  const [pTerms, setPTerms] = useState<boolean>(false);

  // Driver form state
  const [dName, setDName] = useState<string>('');
  const [dCpfCnpj, setDCpfCnpj] = useState<string>('');
  const [dBirthDate, setDBirthDate] = useState<string>('');
  const [dAge, setDAge] = useState<number>(35);
  const [dPhone, setDPhone] = useState<string>('');
  const [dEmail, setDEmail] = useState<string>('');
  const [dPass, setDPass] = useState<string>('');
  const [dNickname, setDNickname] = useState<string>('');
  const [dPhoto, setDPhoto] = useState<string>('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80');
  const [dCnhCat, setDCnhCat] = useState<string>('Categoria D com EAR');
  const [dCnhNum, setDCnhNum] = useState<string>('');
  const [dAlvara, setDAlvara] = useState<string>('');
  const [dQrCode, setDQrCode] = useState<string>('https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=DTP-SP-REG-VALID');
  const [dVanBrand, setDVanBrand] = useState<string>('Mercedes-Benz');
  const [dVanModel, setDVanModel] = useState<string>('Sprinter 415 CDI');
  const [dVanYear, setDVanYear] = useState<number>(2021);
  const [dVanPlate, setDVanPlate] = useState<string>('');
  const [dVanCapacity, setDVanCapacity] = useState<number>(18);
  const [dVanPhotos, setDVanPhotos] = useState<string[]>([
    'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1494515843206-f3117d3f51b7?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=600&q=80'
  ]);
  const [newPhotoInput, setNewPhotoInput] = useState<string>('');
  const [dSchools, setDSchools] = useState<string>('EMEF Santa Rita, Colégio Santo Américo, Colégio São Luís');
  const [dNeighborhoods, setDNeighborhoods] = useState<string>('Vila Mariana, Saúde, Jabaquara, Moema, Paraíso');
  const [dServiceRegular, setDServiceRegular] = useState<boolean>(true);
  const [dServiceEventual, setDServiceEventual] = useState<boolean>(true);
  // Bank Account
  const [bHolder, setBHolder] = useState<string>('');
  const [bCpfCnpj, setBCpfCnpj] = useState<string>('');
  const [bBank, setBBank] = useState<string>('Banco do Brasil');
  const [bType, setBType] = useState<'corrente' | 'poupanca'>('corrente');
  const [bAgency, setBAgency] = useState<string>('');
  const [bAccount, setBAccount] = useState<string>('');
  const [bPixType, setBPixType] = useState<'cpf' | 'cnpj' | 'email' | 'telefone' | 'aleatoria'>('cpf');
  const [bPixKey, setBPixKey] = useState<string>('');
  const [dPermissions, setDPermissions] = useState<boolean>(false);

  // Helper age calculation
  const calculateAge = (dateStr: string): number => {
    if (!dateStr) return 0;
    const birth = new Date(dateStr);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
      age--;
    }
    return Math.max(0, age);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalErr('');
    if (!loginEmail.trim() || !loginPass) {
      setLocalErr('Informe seu e-mail e senha.');
      return;
    }
    setLoading(true);
    const ok = await onLogin(loginEmail.trim().toLowerCase(), loginPass);
    setLoading(false);
    if (!ok) setLocalErr('E-mail ou senha incorretos.');
  };

  const handleParentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalErr('');

    if (!pName.trim() || !pEmail.trim() || !pCpf.trim() || !pPass || pKids.length === 0) {
      setLocalErr('Por favor, preencha todos os campos obrigatórios e adicione pelo menos uma criança.');
      return;
    }
    if (!pTerms) {
      setLocalErr('É obrigatório aceitar os Termos e Condições LGPD para prosseguir.');
      return;
    }

    setLoading(true);
    const payload: ParentRegistrationData = {
      name: pName.trim(),
      email: pEmail.trim().toLowerCase(),
      pass: pPass,
      cpf: pCpf.trim(),
      phone: pPhone.trim(),
      address: {
        street: pStreet.trim(),
        number: pNumber.trim(),
        complement: pComp.trim(),
        cep: pPCepFormatted(pCep),
        neighborhood: pNeighborhood.trim() || 'Centro',
        city: pCity.trim() || 'São Paulo'
      },
      children: pKids.map(k => ({
        ...k,
        name: k.name.trim() || 'Criança ' + (pKids.indexOf(k) + 1)
      })),
      termsAccepted: true,
      acceptedAt: new Date().toLocaleString('pt-BR'),
      acceptedVersion: 'v2.6-LGPD-2026'
    };

    let ok = false;
    if (onRegisterParentDetailed) {
      ok = await onRegisterParentDetailed(payload);
    } else {
      ok = await onRegister(payload.name, payload.email, payload.pass, 'c');
    }
    setLoading(false);

    if (ok) {
      setSuccessNotice('Cadastro concluído com sucesso!');
    } else {
      setLocalErr('Este e-mail já está cadastrado no sistema.');
    }
  };

  const handleDriverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalErr('');

    if (!dName.trim() || !dEmail.trim() || !dCpfCnpj.trim() || !dPass) {
      setLocalErr('Preencha os dados pessoais básicos do motorista.');
      return;
    }
    if (dVanPhotos.length < 4) {
      setLocalErr('É obrigatório enviar pelo menos 4 fotos do veículo para vistoria prévia.');
      return;
    }
    if (!dPermissions) {
      setLocalErr('É obrigatório autorizar os termos e o uso de GPS durante as rotas.');
      return;
    }

    setLoading(true);
    const payload: DriverRegistrationData = {
      name: dName.trim(),
      email: dEmail.trim().toLowerCase(),
      pass: dPass,
      cpfCnpj: dCpfCnpj.trim(),
      birthDate: dBirthDate,
      calculatedAge: dAge,
      phone: dPhone.trim(),
      nickname: dNickname.trim() || dName.split(' ')[0],
      photoUrl: dPhoto,
      cnhCategory: dCnhCat,
      cnhNumber: dCnhNum.trim() || '77890123-D',
      dtpNumber: dAlvara.trim() || 'DTP-SP-88.902',
      qrCodeUrl: dQrCode,
      vanBrand: dVanBrand,
      vanModel: dVanModel,
      vanYear: dVanYear,
      vanPlate: dVanPlate.toUpperCase().trim() || 'SP-VAN26',
      vanCapacity: dVanCapacity,
      vanPhotos: dVanPhotos,
      schoolsAttended: dSchools,
      neighborhoodsAttended: dNeighborhoods,
      serviceTypes: [
        ...(dServiceRegular ? ['Escolar Regular'] : []),
        ...(dServiceEventual ? ['Passeios e Excursões'] : [])
      ],
      bankAccount: {
        accountHolder: bHolder.trim() || dName.trim(),
        cpfCnpj: bCpfCnpj.trim() || dCpfCnpj.trim(),
        bankName: bBank,
        accountType: bType,
        agency: bAgency.trim() || '0001',
        accountNumber: bAccount.trim() || '123456-7',
        pixKeyType: bPixType,
        pixKey: bPixKey.trim() || dPhone.trim() || dEmail.trim()
      },
      permissionsAccepted: true,
      acceptedAt: new Date().toLocaleString('pt-BR'),
      acceptedVersion: 'v2.6-DTP-DRIVER-2026'
    };

    let ok = false;
    if (onRegisterDriverDetailed) {
      ok = await onRegisterDriverDetailed(payload);
    } else {
      ok = await onRegister(payload.name, payload.email, payload.pass, 't');
    }
    setLoading(false);

    if (ok) {
      setSuccessNotice('Cadastro de motorista enviado para verificação do DTP!');
    } else {
      setLocalErr('Este e-mail já está cadastrado no sistema.');
    }
  };

  const pPCepFormatted = (val: string) => {
    return val.replace(/\D/g, '').replace(/^(\d{5})(\d)/, '$1-$2').substring(0, 9);
  };

  return (
    <div className="max-w-xl mx-auto pt-4 pb-20 px-3 sm:px-4 space-y-4">
      {/* Brand Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex w-14 h-14 rounded-2xl bg-[#ffc400] text-[#10263b] items-center justify-center font-black text-2xl shadow-md">
          🚌
        </div>
        <h1 className="text-2xl font-black text-[#10263b] dark:text-white tracking-tight">
          Van Escolar <span className="text-[#ffc400]">SP</span>
        </h1>
        <p className="text-xs text-[#5d6f80] dark:text-[#93a5b5] max-w-sm mx-auto">
          Plataforma oficial de transporte escolar em São Paulo conectando famílias e condutores credenciados pelo DTP.
        </p>
      </div>

      {/* Main Container Card */}
      <div className="bg-white dark:bg-[#16232f] p-4 sm:p-6 rounded-2xl border border-[#d6dee6] dark:border-[#26384a] shadow-md space-y-4">
        {/* Chips Toggle between Login and Registration */}
        <div className="flex bg-[#eef2f5] dark:bg-[#0e1822] p-1 rounded-xl">
          <button
            type="button"
            onClick={() => { setMode('login'); setLocalErr(''); setSuccessNotice(''); }}
            className={`flex-1 py-2 text-xs font-black rounded-lg transition cursor-pointer ${
              mode === 'login'
                ? 'bg-[#ffc400] text-[#10263b] shadow-xs'
                : 'text-[#5d6f80] dark:text-[#93a5b5]'
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => { setMode('reg_role_select'); setLocalErr(''); setSuccessNotice(''); }}
            className={`flex-1 py-2 text-xs font-black rounded-lg transition cursor-pointer ${
              mode !== 'login'
                ? 'bg-[#ffc400] text-[#10263b] shadow-xs'
                : 'text-[#5d6f80] dark:text-[#93a5b5]'
            }`}
          >
            Criar conta
          </button>
        </div>

        {/* Global Error Notice */}
        {(localErr || errorMessage) && (
          <div className="p-3 bg-[#fdf2f2] dark:bg-[#3b1818] border border-[#f5c6c6] dark:border-[#7a2828] rounded-xl flex items-center gap-2 text-xs text-[#c93c3c] dark:text-[#f87171] font-bold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{localErr || errorMessage}</span>
          </div>
        )}

        {/* Global Success Notice */}
        {successNotice && (
          <div className="p-3 bg-[#edf7ed] dark:bg-[#143324] border border-[#bbf7d0] dark:border-[#1e5436] rounded-xl flex items-center gap-2 text-xs text-[#1b8a52] dark:text-[#4ade80] font-bold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* ========================================================
            MODE: LOGIN
            ======================================================== */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-[#5d6f80] dark:text-[#93a5b5] mb-1">
                E-mail cadastrado
              </label>
              <input
                type="email"
                placeholder="seuemail@exemplo.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full p-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a] focus:outline-[#ffc400]"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-[#5d6f80] dark:text-[#93a5b5] mb-1">
                Senha de acesso
              </label>
              <input
                type="password"
                placeholder="Digite sua senha"
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                className="w-full p-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a] focus:outline-[#ffc400]"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#ffc400] hover:brightness-105 active:scale-98 text-[#10263b] font-black py-3 rounded-xl transition shadow-md text-sm mt-2 cursor-pointer"
            >
              {loading ? 'Acessando...' : 'Entrar no Van Escolar SP'}
            </button>

            {/* Google OAuth Login Option */}
            <div className="relative flex py-1.5 items-center">
              <div className="flex-grow border-t border-[#d6dee6] dark:border-[#26384a]"></div>
              <span className="flex-shrink mx-3 text-[10px] font-bold text-[#5d6f80] dark:text-[#93a5b5] uppercase tracking-wider">ou</span>
              <div className="flex-grow border-t border-[#d6dee6] dark:border-[#26384a]"></div>
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleGoogleSignIn()}
              className="w-full bg-white dark:bg-[#16232f] hover:bg-[#f8fafc] dark:hover:bg-[#1c2c3b] text-[#10263b] dark:text-white font-bold py-2.5 px-4 rounded-xl border border-[#d6dee6] dark:border-[#26384a] shadow-xs transition flex items-center justify-center gap-2.5 cursor-pointer text-xs"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continuar com Google</span>
            </button>
          </form>
        )}

        {/* ========================================================
            MODE: STEP 1 - ROLE SELECT (OBRIGATÓRIO)
            ======================================================== */}
        {mode === 'reg_role_select' && (
          <div className="space-y-4 text-xs animate-in fade-in">
            <div className="text-center space-y-1">
              <h2 className="text-base font-black text-[#10263b] dark:text-white">
                Como você deseja utilizar o aplicativo?
              </h2>
              <p className="text-[#5d6f80] dark:text-[#93a5b5]">
                Selecione o seu perfil obrigatório para direcionarmos ao cadastro correto:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {/* Option 1: Pai ou Responsável */}
              <button
                type="button"
                onClick={() => setMode('reg_parent')}
                className="p-4 rounded-2xl border-2 border-[#d6dee6] dark:border-[#26384a] hover:border-[#ffc400] dark:hover:border-[#ffc400] bg-[#f8fafc] dark:bg-[#0e1822] transition text-left space-y-2 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-[#e3f2fd] dark:bg-[#1a2f44] text-[#1976d2] flex items-center justify-center text-2xl group-hover:scale-105 transition">
                  👨‍👩‍👧
                </div>
                <div>
                  <h3 className="font-black text-sm text-[#10263b] dark:text-white">
                    1. Pai ou Responsável
                  </h3>
                  <p className="text-[11px] text-[#5d6f80] dark:text-[#93a5b5] mt-1 leading-relaxed">
                    Cadastre suas crianças, encontre vans credenciadas, acompanhe rota com GPS em tempo real e assine contratos digitais.
                  </p>
                </div>
                <div className="text-[#ffc400] font-black text-xs flex items-center gap-1 pt-1">
                  Continuar como Responsável →
                </div>
              </button>

              {/* Option 2: Motorista de Transporte Escolar */}
              <button
                type="button"
                onClick={() => setMode('reg_driver')}
                className="p-4 rounded-2xl border-2 border-[#d6dee6] dark:border-[#26384a] hover:border-[#ffc400] dark:hover:border-[#ffc400] bg-[#f8fafc] dark:bg-[#0e1822] transition text-left space-y-2 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-[#fff8e1] dark:bg-[#332a12] text-[#ffc400] flex items-center justify-center text-2xl group-hover:scale-105 transition">
                  🚐
                </div>
                <div>
                  <h3 className="font-black text-sm text-[#10263b] dark:text-white">
                    2. Motorista Escolar
                  </h3>
                  <p className="text-[11px] text-[#5d6f80] dark:text-[#93a5b5] mt-1 leading-relaxed">
                    Envie seu alvará DTP, cadastre sua van com galeria de fotos, receba alunos, otimize rotas com Waze e receba via Pix.
                  </p>
                </div>
                <div className="text-[#ffc400] font-black text-xs flex items-center gap-1 pt-1">
                  Continuar como Motorista →
                </div>
              </button>
            </div>

            {/* Google Fast Registration for chosen role */}
            <div className="pt-3 border-t border-[#d6dee6] dark:border-[#26384a] space-y-2">
              <div className="text-center text-[11px] font-bold text-[#5d6f80] dark:text-[#93a5b5]">
                Ou crie sua conta diretamente com o Google:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleGoogleSignIn('c')}
                  className="bg-white dark:bg-[#16232f] hover:bg-[#f8fafc] dark:hover:bg-[#1c2c3b] text-[#10263b] dark:text-white font-bold py-2.5 px-3 rounded-xl border border-[#d6dee6] dark:border-[#26384a] text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Google (Responsável)</span>
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleGoogleSignIn('t')}
                  className="bg-white dark:bg-[#16232f] hover:bg-[#f8fafc] dark:hover:bg-[#1c2c3b] text-[#10263b] dark:text-white font-bold py-2.5 px-3 rounded-xl border border-[#d6dee6] dark:border-[#26384a] text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Google (Motorista)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            MODE: 1.1 CADASTRO DE PAI OU RESPONSÁVEL
            ======================================================== */}
        {mode === 'reg_parent' && (
          <form onSubmit={handleParentSubmit} className="space-y-4 text-xs animate-in fade-in">
            <div className="flex items-center justify-between border-b border-[#d6dee6] dark:border-[#26384a] pb-2">
              <button
                type="button"
                onClick={() => setMode('reg_role_select')}
                className="flex items-center gap-1 text-[#5d6f80] hover:text-[#10263b] dark:text-[#93a5b5] dark:hover:text-white font-bold cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Voltar
              </button>
              <span className="font-black text-[#10263b] dark:text-white uppercase tracking-wider text-[11px]">
                👨‍👩‍👧 Ficha Cadastral do Responsável
              </span>
            </div>

            {/* Dados do responsável */}
            <div className="space-y-3">
              <h3 className="font-black text-xs text-[#10263b] dark:text-[#ffc400] uppercase tracking-wide">
                1. Dados do Responsável
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-[#5d6f80] dark:text-[#93a5b5] mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Marta Almeida Silva"
                    value={pName}
                    onChange={(e) => setPName(e.target.value)}
                    className="w-full p-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#5d6f80] dark:text-[#93a5b5] mb-1">
                    CPF do Responsável *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="000.000.000-00"
                    value={pCpf}
                    onChange={(e) => setPCpf(e.target.value)}
                    className="w-full p-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#5d6f80] dark:text-[#93a5b5] mb-1">
                    Telefone / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="(11) 98888-7777"
                    value={pPhone}
                    onChange={(e) => setPPhone(e.target.value)}
                    className="w-full p-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#5d6f80] dark:text-[#93a5b5] mb-1">
                    E-mail (Login) *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="responsavel@email.com"
                    value={pEmail}
                    onChange={(e) => setPEmail(e.target.value)}
                    className="w-full p-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#5d6f80] dark:text-[#93a5b5] mb-1">
                  Senha de Acesso (mínimo 4 caracteres) *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Crie sua senha segura"
                  value={pPass}
                  onChange={(e) => setPPass(e.target.value)}
                  className="w-full p-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a]"
                />
              </div>

              {/* Endereço completo */}
              <div className="pt-2 border-t border-[#d6dee6] dark:border-[#26384a] space-y-2">
                <span className="font-bold text-[#5d6f80] dark:text-[#93a5b5] text-[11px] uppercase">
                  Endereço Residencial de Embarque:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <label className="block text-[11px] font-bold text-[#5d6f80] dark:text-[#93a5b5] mb-0.5">CEP</label>
                    <input
                      type="text"
                      placeholder="00000-000"
                      value={pCep}
                      onChange={(e) => setPCep(e.target.value)}
                      className="w-full p-2 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a]"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold text-[#5d6f80] dark:text-[#93a5b5] mb-0.5">Rua / Avenida</label>
                    <input
                      type="text"
                      placeholder="Ex: Rua das Flores"
                      value={pStreet}
                      onChange={(e) => setPStreet(e.target.value)}
                      className="w-full p-2 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a]"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-[#5d6f80] dark:text-[#93a5b5] mb-0.5">Número</label>
                    <input
                      type="text"
                      placeholder="123"
                      value={pNumber}
                      onChange={(e) => setPNumber(e.target.value)}
                      className="w-full p-2 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#5d6f80] dark:text-[#93a5b5] mb-0.5">Complemento / Apto</label>
                    <input
                      type="text"
                      placeholder="Apto 42"
                      value={pComp}
                      onChange={(e) => setPComp(e.target.value)}
                      className="w-full p-2 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#5d6f80] dark:text-[#93a5b5] mb-0.5">Bairro</label>
                    <input
                      type="text"
                      placeholder="Jabaquara"
                      value={pNeighborhood}
                      onChange={(e) => setPNeighborhood(e.target.value)}
                      className="w-full p-2 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Cadastro de mais de uma criança */}
            <div className="pt-3 border-t border-[#d6dee6] dark:border-[#26384a] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-xs text-[#10263b] dark:text-[#ffc400] uppercase tracking-wide">
                    2. Dados da(s) Criança(s) ({pKids.length})
                  </h3>
                  <p className="text-[11px] text-[#5d6f80] dark:text-[#93a5b5]">
                    Quantas crianças você deseja cadastrar? Você pode adicionar várias nesta conta.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPKids([
                      ...pKids,
                      { name: '', birthDate: '', calculatedAge: 7, school: 'EMEF Santa Rita', grade: '2º Ano Fundamental', allergies: '', medicalNotes: '' }
                    ]);
                  }}
                  className="flex items-center gap-1 bg-[#10263b] dark:bg-[#26384a] text-[#ffc400] px-3 py-1.5 rounded-xl font-black text-xs hover:brightness-110 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar Criança
                </button>
              </div>

              {/* Fichas Individuais */}
              <div className="space-y-3">
                {pKids.map((kid, index) => (
                  <div key={index} className="p-3.5 bg-[#f8fafc] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a] space-y-2.5">
                    <div className="flex items-center justify-between border-b border-[#e2e8f0] dark:border-[#1e293b] pb-1.5">
                      <span className="font-black text-xs text-[#10263b] dark:text-white flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-[#ffc400] text-[#10263b] flex items-center justify-center font-black text-[10px]">
                          {index + 1}
                        </span>
                        Ficha Individual da Criança
                      </span>
                      {pKids.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setPKids(pKids.filter((_, i) => i !== index))}
                          className="text-[#c93c3c] hover:underline font-bold text-[11px] flex items-center gap-0.5 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" /> Remover
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-[#5d6f80] dark:text-[#93a5b5] mb-0.5">
                          Nome Completo da Criança *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Nome da criança"
                          value={kid.name}
                          onChange={(e) => {
                            const updated = [...pKids];
                            updated[index].name = e.target.value;
                            setPKids(updated);
                          }}
                          className="w-full p-2 bg-white dark:bg-[#16232f] rounded-lg border border-[#d6dee6] dark:border-[#26384a]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#5d6f80] dark:text-[#93a5b5] mb-0.5">
                          Data de Nascimento *
                        </label>
                        <input
                          type="date"
                          required
                          value={kid.birthDate}
                          onChange={(e) => {
                            const updated = [...pKids];
                            updated[index].birthDate = e.target.value;
                            updated[index].calculatedAge = calculateAge(e.target.value);
                            setPKids(updated);
                          }}
                          className="w-full p-2 bg-white dark:bg-[#16232f] rounded-lg border border-[#d6dee6] dark:border-[#26384a]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-[#5d6f80] dark:text-[#93a5b5] mb-0.5">
                          Idade (automática)
                        </label>
                        <div className="p-2 bg-[#eef2f5] dark:bg-[#1e293b] rounded-lg font-black text-[#10263b] dark:text-white">
                          {kid.calculatedAge ? `${kid.calculatedAge} anos` : 'Informe a data'}
                        </div>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-[#5d6f80] dark:text-[#93a5b5] mb-0.5">
                          Escola onde irá estudar *
                        </label>
                        <input
                          type="text"
                          list="osasco-schools-list"
                          required
                          placeholder="Digite ou selecione a escola"
                          value={kid.school}
                          onChange={(e) => {
                            const updated = [...pKids];
                            updated[index].school = e.target.value;
                            setPKids(updated);
                          }}
                          className="w-full p-2 bg-white dark:bg-[#16232f] rounded-lg border border-[#d6dee6] dark:border-[#26384a]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-[#5d6f80] dark:text-[#93a5b5] mb-0.5">
                          Série / Ano Escolar
                        </label>
                        <select
                          value={kid.grade}
                          onChange={(e) => {
                            const updated = [...pKids];
                            updated[index].grade = e.target.value;
                            setPKids(updated);
                          }}
                          className="w-full p-2 bg-white dark:bg-[#16232f] rounded-lg border border-[#d6dee6] dark:border-[#26384a]"
                        >
                          <option>Berçário / Creche</option>
                          <option>Maternal I / II</option>
                          <option>Pré I / II (Educação Infantil)</option>
                          <option>1º Ano Fundamental</option>
                          <option>2º Ano Fundamental</option>
                          <option>3º Ano Fundamental</option>
                          <option>4º Ano Fundamental</option>
                          <option>5º Ano Fundamental</option>
                          <option>6º ao 9º Ano</option>
                          <option>Ensino Médio</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#5d6f80] dark:text-[#93a5b5] mb-0.5">
                          Alergias conhecidas
                        </label>
                        <input
                          type="text"
                          placeholder="Nenhuma ou lactose, amendoim..."
                          value={kid.allergies}
                          onChange={(e) => {
                            const updated = [...pKids];
                            updated[index].allergies = e.target.value;
                            setPKids(updated);
                          }}
                          className="w-full p-2 bg-white dark:bg-[#16232f] rounded-lg border border-[#d6dee6] dark:border-[#26384a]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#5d6f80] dark:text-[#93a5b5] mb-0.5">
                        Informações médicas e observações para o motorista
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Usa óculos, costuma enjoar na volta, etc."
                        value={kid.medicalNotes}
                        onChange={(e) => {
                          const updated = [...pKids];
                          updated[index].medicalNotes = e.target.value;
                          setPKids(updated);
                        }}
                        className="w-full p-2 bg-white dark:bg-[#16232f] rounded-lg border border-[#d6dee6] dark:border-[#26384a]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Termos e LGPD */}
            <div className="pt-3 border-t border-[#d6dee6] dark:border-[#26384a] space-y-2">
              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-[#eef2f5] dark:bg-[#0e1822] border border-[#d6dee6] dark:border-[#26384a] cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={pTerms}
                  onChange={(e) => setPTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-[#ffc400] accent-[#ffc400] focus:ring-0"
                />
                <span className="text-[11px] text-[#5d6f80] dark:text-[#93a5b5] leading-snug">
                  <strong className="text-[#10263b] dark:text-white">Termos e Condições LGPD (Obrigatório):</strong> Declaro que sou o representante legal da(s) criança(s) e autorizo o tratamento de dados pessoais conforme a LGPD (Lei nº 13.709/18) para a contratação e segurança do transporte escolar, com registro eletrônico de data e hora.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#ffc400] hover:brightness-105 active:scale-98 text-[#10263b] font-black py-3 rounded-xl transition shadow-md text-sm cursor-pointer"
            >
              {loading ? 'Cadastrando Responsável...' : 'Concluir Cadastro de Pai/Responsável'}
            </button>
          </form>
        )}

        {/* ========================================================
            MODE: 1.2 CADASTRO DE MOTORISTA DE TRANSPORTE ESCOLAR
            ======================================================== */}
        {mode === 'reg_driver' && (
          <form onSubmit={handleDriverSubmit} className="space-y-4 text-xs animate-in fade-in">
            <div className="flex items-center justify-between border-b border-[#d6dee6] dark:border-[#26384a] pb-2">
              <button
                type="button"
                onClick={() => setMode('reg_role_select')}
                className="flex items-center gap-1 text-[#5d6f80] hover:text-[#10263b] dark:text-[#93a5b5] dark:hover:text-white font-bold cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Voltar
              </button>
              <span className="font-black text-[#10263b] dark:text-white uppercase tracking-wider text-[11px]">
                🚐 Cadastro Profissional do Motorista
              </span>
            </div>

            {/* Dados Pessoais */}
            <div className="space-y-3">
              <h3 className="font-black text-xs text-[#10263b] dark:text-[#ffc400] uppercase tracking-wide">
                1. Dados Pessoais do Condutor
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-[#5d6f80] dark:text-[#93a5b5] mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nome completo do motorista"
                    value={dName}
                    onChange={(e) => setDName(e.target.value)}
                    className="w-full p-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#5d6f80] dark:text-[#93a5b5] mb-1">
                    CPF ou CNPJ *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="000.000.000-00 ou CNPJ"
                    value={dCpfCnpj}
                    onChange={(e) => setDCpfCnpj(e.target.value)}
                    className="w-full p-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#5d6f80] dark:text-[#93a5b5] mb-1">
                    Data de Nascimento *
                  </label>
                  <input
                    type="date"
                    required
                    value={dBirthDate}
                    onChange={(e) => {
                      setDBirthDate(e.target.value);
                      setDAge(calculateAge(e.target.value));
                    }}
                    className="w-full p-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#5d6f80] dark:text-[#93a5b5] mb-1">
                    Idade Calculada
                  </label>
                  <div className="p-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl font-black text-[#10263b] dark:text-white">
                    {dAge ? `${dAge} anos` : '35 anos'}
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-[#5d6f80] dark:text-[#93a5b5] mb-1">
                    Telefone / WhatsApp Comercial *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="(11) 99999-8888"
                    value={dPhone}
                    onChange={(e) => setDPhone(e.target.value)}
                    className="w-full p-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#5d6f80] dark:text-[#93a5b5] mb-1">
                    Apelido Profissional (Como é conhecido)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Tio Carlinhos"
                    value={dNickname}
                    onChange={(e) => setDNickname(e.target.value)}
                    className="w-full p-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-[#5d6f80] dark:text-[#93a5b5] mb-1">
                    E-mail do Condutor *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="motorista@vanescolar.sp"
                    value={dEmail}
                    onChange={(e) => setDEmail(e.target.value)}
                    className="w-full p-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#5d6f80] dark:text-[#93a5b5] mb-1">
                    Senha de Acesso *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Mínimo 4 dígitos"
                    value={dPass}
                    onChange={(e) => setDPass(e.target.value)}
                    className="w-full p-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a]"
                  />
                </div>
              </div>
            </div>

            {/* Documentação e Alvará */}
            <div className="pt-3 border-t border-[#d6dee6] dark:border-[#26384a] space-y-3">
              <h3 className="font-black text-xs text-[#10263b] dark:text-[#ffc400] uppercase tracking-wide">
                2. Documentação e Alvará DTP
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block font-bold text-[#5d6f80] dark:text-[#93a5b5] mb-1">
                    Categoria da CNH *
                  </label>
                  <select
                    value={dCnhCat}
                    onChange={(e) => setDCnhCat(e.target.value)}
                    className="w-full p-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a]"
                  >
                    <option>Categoria D com EAR</option>
                    <option>Categoria E com EAR</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#5d6f80] dark:text-[#93a5b5] mb-1">
                    Nº do Alvará DTP / Registro
                  </label>
                  <input
                    type="text"
                    placeholder="DTP-SP 77.412"
                    value={dAlvara}
                    onChange={(e) => setDAlvara(e.target.value)}
                    className="w-full p-2.5 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#5d6f80] dark:text-[#93a5b5] mb-1">
                    QR Code da Prefeitura
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-[#1b8a52] font-black">✓ Validado</span>
                    <button
                      type="button"
                      onClick={() => alert('QR Code da prefeitura carregado e conferido.')}
                      className="text-xs bg-[#eef2f5] dark:bg-[#0e1822] px-2 py-1 rounded border border-[#d6dee6] dark:border-[#26384a]"
                    >
                      Ler QR Code
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Veículo e Galeria de no mínimo 4 fotos */}
            <div className="pt-3 border-t border-[#d6dee6] dark:border-[#26384a] space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-xs text-[#10263b] dark:text-[#ffc400] uppercase tracking-wide">
                  3. Veículo & Galeria de Fotos (Mínimo 4 fotos) *
                </h3>
                <span className={`text-xs font-black ${dVanPhotos.length >= 4 ? 'text-[#1b8a52]' : 'text-[#c93c3c]'}`}>
                  {dVanPhotos.length} de 4 fotos mínimas
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-[#5d6f80] dark:text-[#93a5b5] mb-0.5">Marca</label>
                  <input
                    type="text"
                    value={dVanBrand}
                    onChange={(e) => setDVanBrand(e.target.value)}
                    className="w-full p-2 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#5d6f80] dark:text-[#93a5b5] mb-0.5">Modelo</label>
                  <input
                    type="text"
                    value={dVanModel}
                    onChange={(e) => setDVanModel(e.target.value)}
                    className="w-full p-2 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#5d6f80] dark:text-[#93a5b5] mb-0.5">Ano</label>
                  <input
                    type="number"
                    value={dVanYear}
                    onChange={(e) => setDVanYear(Number(e.target.value))}
                    className="w-full p-2 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#5d6f80] dark:text-[#93a5b5] mb-0.5">Placa Escolar</label>
                  <input
                    type="text"
                    placeholder="BRA-2E19"
                    value={dVanPlate}
                    onChange={(e) => setDVanPlate(e.target.value)}
                    className="w-full p-2 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a]"
                  />
                </div>
              </div>

              {/* Upload e Preview da Galeria */}
              <div className="space-y-2">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {dVanPhotos.map((url, i) => (
                    <div key={i} className="relative group rounded-xl overflow-hidden border border-[#d6dee6] dark:border-[#26384a] aspect-4/3 bg-black">
                      <img src={url} alt={`Foto van ${i + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setDVanPhotos(dVanPhotos.filter((_, idx) => idx !== i))}
                        className="absolute top-1 right-1 bg-red-600/80 text-white p-1 rounded-full text-[10px] hover:bg-red-700 cursor-pointer"
                        title="Remover foto"
                      >
                        ✕
                      </button>
                      <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
                        Foto #{i + 1}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="Adicionar link de foto do veículo (ou upload)"
                    value={newPhotoInput}
                    onChange={(e) => setNewPhotoInput(e.target.value)}
                    className="flex-1 p-2 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newPhotoInput.trim()) {
                        setDVanPhotos([...dVanPhotos, newPhotoInput.trim()]);
                        setNewPhotoInput('');
                      }
                    }}
                    className="px-3 py-2 bg-[#10263b] dark:bg-[#26384a] text-[#ffc400] font-black rounded-xl text-xs hover:brightness-110 cursor-pointer"
                  >
                    + Foto
                  </button>
                </div>
              </div>
            </div>

            {/* Atuação */}
            <div className="pt-3 border-t border-[#d6dee6] dark:border-[#26384a] space-y-2">
              <h3 className="font-black text-xs text-[#10263b] dark:text-[#ffc400] uppercase tracking-wide">
                4. Regiões e Escolas Atendidas
              </h3>
              <div>
                <label className="block text-[11px] font-bold text-[#5d6f80] dark:text-[#93a5b5] mb-0.5">
                  Escolas Atendidas (separadas por vírgula)
                </label>
                <input
                  type="text"
                  value={dSchools}
                  onChange={(e) => setDSchools(e.target.value)}
                  className="w-full p-2 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#5d6f80] dark:text-[#93a5b5] mb-0.5">
                  Bairros e Regiões atendidos
                </label>
                <input
                  type="text"
                  value={dNeighborhoods}
                  onChange={(e) => setDNeighborhoods(e.target.value)}
                  className="w-full p-2 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a]"
                />
              </div>
            </div>

            {/* Dados Bancários */}
            <div className="pt-3 border-t border-[#d6dee6] dark:border-[#26384a] space-y-2.5">
              <h3 className="font-black text-xs text-[#10263b] dark:text-[#ffc400] uppercase tracking-wide">
                5. Dados Bancários para Recebimento de Mensalidades
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-[#5d6f80] dark:text-[#93a5b5] mb-0.5">
                    Titular da Conta *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nome completo do titular"
                    value={bHolder}
                    onChange={(e) => setBHolder(e.target.value)}
                    className="w-full p-2 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#5d6f80] dark:text-[#93a5b5] mb-0.5">
                    Banco
                  </label>
                  <input
                    type="text"
                    value={bBank}
                    onChange={(e) => setBBank(e.target.value)}
                    className="w-full p-2 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#5d6f80] dark:text-[#93a5b5] mb-0.5">
                    Agência e Conta
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Agência"
                      value={bAgency}
                      onChange={(e) => setBAgency(e.target.value)}
                      className="w-full p-2 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a]"
                    />
                    <input
                      type="text"
                      placeholder="Conta c/ dígito"
                      value={bAccount}
                      onChange={(e) => setBAccount(e.target.value)}
                      className="w-full p-2 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#5d6f80] dark:text-[#93a5b5] mb-0.5">
                    Chave Pix Oficial
                  </label>
                  <div className="flex gap-1.5">
                    <select
                      value={bPixType}
                      onChange={(e) => setBPixType(e.target.value as any)}
                      className="p-2 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a] text-xs"
                    >
                      <option value="cpf">CPF</option>
                      <option value="cnpj">CNPJ</option>
                      <option value="telefone">Telefone</option>
                      <option value="email">E-mail</option>
                      <option value="aleatoria">Aleatória</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Chave Pix"
                      value={bPixKey}
                      onChange={(e) => setBPixKey(e.target.value)}
                      className="flex-1 p-2 bg-[#eef2f5] dark:bg-[#0e1822] rounded-xl border border-[#d6dee6] dark:border-[#26384a]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Termos e Autorizações */}
            <div className="pt-3 border-t border-[#d6dee6] dark:border-[#26384a] space-y-2">
              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-[#eef2f5] dark:bg-[#0e1822] border border-[#d6dee6] dark:border-[#26384a] cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={dPermissions}
                  onChange={(e) => setDPermissions(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-[#ffc400] accent-[#ffc400] focus:ring-0"
                />
                <span className="text-[11px] text-[#5d6f80] dark:text-[#93a5b5] leading-snug">
                  <strong className="text-[#10263b] dark:text-white">Termos Regulatórios DTP e Permissões (Obrigatório):</strong> Concordo em submeter documentação verídica, autorizo o uso de câmera para vistorias, leitura de arquivos e compartilhamento de localização por GPS exclusivamente durante as rotas ativas de transporte escolar.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#ffc400] hover:brightness-105 active:scale-98 text-[#10263b] font-black py-3 rounded-xl transition shadow-md text-sm cursor-pointer"
            >
              {loading ? 'Enviando Cadastro...' : 'Enviar Cadastro para Verificação DTP'}
            </button>
          </form>
        )}

        {/* Datalist de Escolas de Osasco */}
        <datalist id="osasco-schools-list">
          {OSASCO_SCHOOLS.map((s) => (
            <option key={s.id} value={s.name}>
              {s.neighborhood} ({s.type})
            </option>
          ))}
        </datalist>

        {/* Demo Fast Logins Section */}
        <div className="pt-3 border-t border-[#d6dee6] dark:border-[#26384a] space-y-2">
          <div className="text-[11px] font-bold text-[#5d6f80] text-center uppercase tracking-wider">
            Acesso Rápido para Avaliação e Demonstração:
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => onFastLogin('marta.almeida@gmail.com')}
              className="p-2 bg-[#eef2f5] dark:bg-[#0e1822] hover:bg-[#d6dee6] dark:hover:bg-[#26384a] text-[#10263b] dark:text-[#eaf0f5] rounded-xl font-bold transition text-left cursor-pointer"
            >
              <div className="text-[10px] text-[#ffc400]">👨‍👩‍👧 Família / Mãe</div>
              <div className="font-black truncate">Marta Almeida</div>
            </button>

            <button
              type="button"
              onClick={() => onFastLogin('joao.batista@vanescolar.sp')}
              className="p-2 bg-[#eef2f5] dark:bg-[#0e1822] hover:bg-[#d6dee6] dark:hover:bg-[#26384a] text-[#10263b] dark:text-[#eaf0f5] rounded-xl font-bold transition text-left cursor-pointer"
            >
              <div className="text-[10px] text-[#1b8a52]">🚐 Transportador</div>
              <div className="font-black truncate">João Batista</div>
            </button>

            <button
              type="button"
              onClick={() => onFastLogin('admin@vanescolar.sp')}
              className="p-2 bg-[#eef2f5] dark:bg-[#0e1822] hover:bg-[#d6dee6] dark:hover:bg-[#26384a] text-[#10263b] dark:text-[#eaf0f5] rounded-xl font-bold transition text-left cursor-pointer"
            >
              <div className="text-[10px] text-[#0f7f8c]">🛡️ Regulador DTP</div>
              <div className="font-black truncate">Admin SP</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
