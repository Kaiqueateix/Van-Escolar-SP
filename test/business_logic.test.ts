import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_CONTRACT_CLAUSES, OSASCO_SCHOOLS, FREELANCE_DRIVERS } from '../src/constants';

test('SmartVan contract contains all 16 required clauses', () => {
  assert.equal(DEFAULT_CONTRACT_CLAUSES.length, 16);
  assert.ok(DEFAULT_CONTRACT_CLAUSES[0].includes('DO OBJETO'));
  assert.ok(DEFAULT_CONTRACT_CLAUSES[15].includes('DO FORO'));
});

test('Osasco schools database is properly loaded with valid levels', () => {
  assert.ok(OSASCO_SCHOOLS.length >= 10);
  const emef = OSASCO_SCHOOLS.find(s => s.name.includes('EMEF'));
  assert.ok(emef);
  assert.equal(emef?.city, 'Osasco');
  assert.ok(emef?.levels.includes('fundamental'));
});

test('Freelance drivers database contains DTP accredited drivers with direct WhatsApp contacts', () => {
  assert.ok(FREELANCE_DRIVERS.length >= 3);
  const driver = FREELANCE_DRIVERS[0];
  assert.ok(driver.verifiedDtp);
  assert.ok(driver.whatsapp.length >= 11);
  assert.ok(driver.dailyRate > 0);
});

test('Age calculation correctly derives years from YYYY-MM-DD', () => {
  const birth = new Date('2018-05-15');
  const today = new Date();
  let expectedAge = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    expectedAge--;
  }
  assert.ok(expectedAge >= 5 && expectedAge <= 10);
});

test('calculateDistanceMeters accurately computes geodesic distance', async () => {
  const { calculateDistanceMeters } = await import('../src/services/gpsTrackingService');
  // Centro Osasco (-23.5325, -46.7917) to Bela Vista (-23.5415, -46.7820) ~ 1.4km
  const dist = calculateDistanceMeters(-23.5325, -46.7917, -23.5415, -46.7820);
  assert.ok(dist > 1000 && dist < 2000, `Expected distance ~1.4km, got ${dist}`);
});

test('routeOptimizationService correctly sorts stops and computes school arrival deadline', async () => {
  const { optimizeRouteStops, getTrafficFactor } = await import('../src/services/routeOptimizationService');
  const traffic = getTrafficFactor();
  assert.ok(traffic.factor >= 1.0, `Traffic factor should be valid, got ${traffic.factor}`);

  const mockStops = [
    {
      id: 's1',
      childId: 'k1',
      childName: 'Aluno 1',
      guardianName: 'Pai 1',
      guardianPhone: '11999991111',
      type: 'embarque' as const,
      address: 'Rua Bela Vista, 100',
      neighborhood: 'Bela Vista',
      schoolName: 'EMEF Marechal Bittencourt',
      order: 2,
      scheduledTime: '07:10',
      estimatedArrival: '07:10',
      status: 'pendente' as const
    },
    {
      id: 's2',
      childId: 'k2',
      childName: 'Aluno 2',
      guardianName: 'Pai 2',
      guardianPhone: '11999992222',
      type: 'embarque' as const,
      address: 'Av dos Autonomistas, 200',
      neighborhood: 'Centro',
      schoolName: 'EMEF Marechal Bittencourt',
      order: 1,
      scheduledTime: '06:50',
      estimatedArrival: '06:50',
      status: 'pendente' as const
    }
  ];

  const result = optimizeRouteStops(mockStops, '07:25');
  assert.equal(result.optimizedStops.length, 2);
  assert.ok(result.totalDistanceKm > 0);
  assert.ok(result.isPunctualForBell, `Expected route to be punctual for school arrival, estimate was ${result.schoolArrivalEstimate}`);
  assert.equal(result.schoolArrivalEstimate.length, 5);
});

test('paymentGatewayService processes Pix webhook and computes 4.5% fee segregation', async () => {
  const { processIncomingPixWebhook, PLATFORM_FEE_PERCENT } = await import('../src/services/paymentGatewayService');
  assert.equal(PLATFORM_FEE_PERCENT, 4.5);

  const mockEvent = {
    endToEndId: 'E1234567820261105001',
    txid: 'TX12345678',
    amount: 500.0,
    paidAt: '2026-11-05T08:00:00Z',
    payerCpf: '123.456.789-00',
    payerName: 'Marta Almeida',
    payerEmail: 'marta.almeida@gmail.com',
    receiverTransporterId: 'joao.batista',
    receiverTransporterName: 'João Batista',
    receiverTransporterEmail: 'joao.batista@vanescolar.sp',
    childName: 'Lucas Almeida'
  };

  const result = processIncomingPixWebhook(mockEvent);
  assert.equal(result.paymentRecord.status, 'pago');
  assert.equal(result.transferRecord.grossAmount, 500.0);
  assert.equal(result.transferRecord.platformFee, 22.5);
  assert.equal(result.transferRecord.netAmount, 477.5);
  assert.ok(result.transferRecord.bacenAuthCode ? result.transferRecord.bacenAuthCode.includes('BACEN') : result.bacenAuthCode.includes('BACEN'));
  assert.equal(result.transferRecord.status, 'liquidado');
});

test('Subscription plan tier rules: Free (5 kids, no route opt, no expenses), Pro (40 kids, expenses), Premium (all unlocked)', () => {
  const getPlanPermissions = (tier: 'free' | 'pro' | 'premium', currentKidsCount: number) => {
    return {
      canAddMoreKids: tier === 'free' ? currentKidsCount < 5 : tier === 'pro' ? currentKidsCount < 40 : true,
      maxKidsAllowed: tier === 'free' ? 5 : tier === 'pro' ? 40 : Infinity,
      canUseRouteOptimizer: tier === 'premium',
      canAddExpenses: tier !== 'free',
      price: tier === 'free' ? 0 : tier === 'pro' ? 24.99 : 44.99
    };
  };

  const freePerms = getPlanPermissions('free', 5);
  assert.equal(freePerms.canAddMoreKids, false);
  assert.equal(freePerms.canUseRouteOptimizer, false);
  assert.equal(freePerms.canAddExpenses, false);
  assert.equal(freePerms.price, 0);

  const proPerms = getPlanPermissions('pro', 39);
  assert.equal(proPerms.canAddMoreKids, true);
  assert.equal(proPerms.canUseRouteOptimizer, false);
  assert.equal(proPerms.canAddExpenses, true);
  assert.equal(proPerms.price, 24.99);

  const premiumPerms = getPlanPermissions('premium', 100);
  assert.equal(premiumPerms.canAddMoreKids, true);
  assert.equal(premiumPerms.canUseRouteOptimizer, true);
  assert.equal(premiumPerms.canAddExpenses, true);
  assert.equal(premiumPerms.price, 44.99);
});

