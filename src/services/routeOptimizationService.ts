import { BoardingStop } from '../types';

export interface RouteOptimizationResult {
  optimizedStops: BoardingStop[];
  totalDistanceKm: number;
  totalDurationMinutes: number;
  trafficCondition: 'fluido' | 'moderado' | 'intenso';
  trafficFactor: number;
  schoolArrivalEstimate: string;
  isPunctualForBell: boolean;
  optimizedAt: string;
}

// Approximate coordinate centers for key neighborhoods in Osasco / SP
const NEIGHBORHOOD_COORDS: Record<string, { lat: number; lng: number }> = {
  'Centro': { lat: -23.5329, lng: -46.7917 },
  'Bela Vista': { lat: -23.5412, lng: -46.7845 },
  'Vila Campesina': { lat: -23.5451, lng: -46.7723 },
  'Vila Yara': { lat: -23.5489, lng: -46.7621 },
  'Presidente Altino': { lat: -23.5281, lng: -46.7682 },
  'Rochdale': { lat: -23.5184, lng: -46.7820 },
  'Jardim das Flores': { lat: -23.5380, lng: -46.8041 },
  'City Bussocaba': { lat: -23.5650, lng: -46.7932 },
  'Jardim Veloso': { lat: -23.5712, lng: -46.8123 },
  'Munhoz Júnior': { lat: -23.4981, lng: -46.8012 },
  'Jabaquara': { lat: -23.6462, lng: -46.6430 },
  'São Judas': { lat: -23.6262, lng: -46.6409 },
  'Moema': { lat: -23.6025, lng: -46.6621 },
  'Vila Mariana': { lat: -23.5891, lng: -46.6384 },
  'default': { lat: -23.5350, lng: -46.7800 }
};

function getCoordsForStop(stop: BoardingStop): { lat: number; lng: number } {
  return (
    NEIGHBORHOOD_COORDS[stop.neighborhood] ||
    NEIGHBORHOOD_COORDS['default']
  );
}

function calculateDistanceKm(c1: { lat: number; lng: number }, c2: { lat: number; lng: number }): number {
  const R = 6371; // Earth radius in km
  const dLat = ((c2.lat - c1.lat) * Math.PI) / 180;
  const dLng = ((c2.lng - c1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((c1.lat * Math.PI) / 180) *
      Math.cos((c2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Determine current traffic condition based on time of day in São Paulo / Osasco
 */
export function getTrafficFactor(): { condition: 'fluido' | 'moderado' | 'intenso'; factor: number } {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Morning rush hour: 06:45 to 08:15 (405 to 495 mins)
  if (currentMinutes >= 405 && currentMinutes <= 495) {
    return { condition: 'intenso', factor: 1.45 };
  }
  // Midday school change: 11:45 to 13:15 (705 to 795 mins)
  if (currentMinutes >= 705 && currentMinutes <= 795) {
    return { condition: 'moderado', factor: 1.25 };
  }
  // Afternoon rush hour: 17:00 to 18:45 (1020 to 1125 mins)
  if (currentMinutes >= 1020 && currentMinutes <= 1125) {
    return { condition: 'intenso', factor: 1.5 };
  }
  return { condition: 'fluido', factor: 1.05 };
}

/**
 * Nearest-neighbor Traveling Salesperson heuristic with school arrival deadline
 */
export function optimizeRouteStops(
  stops: BoardingStop[],
  targetSchoolArrival: string = '07:25' // 5 mins before 07:30 bell
): RouteOptimizationResult {
  if (stops.length === 0) {
    return {
      optimizedStops: [],
      totalDistanceKm: 0,
      totalDurationMinutes: 0,
      trafficCondition: 'fluido',
      trafficFactor: 1.0,
      schoolArrivalEstimate: targetSchoolArrival,
      isPunctualForBell: true,
      optimizedAt: new Date().toLocaleTimeString('pt-BR')
    };
  }

  const { condition, factor } = getTrafficFactor();

  // Separate pickups and final dropoffs (school)
  const pickups = stops.filter((s) => s.type !== 'desembarque');
  const dropoffs = stops.filter((s) => s.type === 'desembarque');

  // Filter out students who are confirmed absent today
  const activePickups = pickups.filter((s) => s.status !== 'nao_embarcou');
  const absentPickups = pickups.filter((s) => s.status === 'nao_embarcou');

  // Greedy Nearest Neighbor tour starting from first available pickup
  const visited: BoardingStop[] = [];
  const unvisited = [...activePickups];

  let current = unvisited.shift();
  if (current) visited.push(current);

  while (unvisited.length > 0 && current) {
    const currentCoords = getCoordsForStop(current);
    let nearestIndex = 0;
    let minDistance = Infinity;

    for (let i = 0; i < unvisited.length; i++) {
      const dist = calculateDistanceKm(currentCoords, getCoordsForStop(unvisited[i]));
      if (dist < minDistance) {
        minDistance = dist;
        nearestIndex = i;
      }
    }

    current = unvisited.splice(nearestIndex, 1)[0];
    visited.push(current);
  }

  // Append any absent pickups at the end marked as skipped
  const finalOrderedPickups = [...visited, ...absentPickups];
  const allOrdered = [...finalOrderedPickups, ...dropoffs];

  // Calculate total distance and ETAs backward from school arrival deadline
  let totalDistance = 0;
  for (let i = 0; i < allOrdered.length - 1; i++) {
    totalDistance += calculateDistanceKm(
      getCoordsForStop(allOrdered[i]),
      getCoordsForStop(allOrdered[i + 1])
    );
  }

  // Urban factor (city streets have 1.3x routing detour compared to straight line)
  const actualRoadDistanceKm = Math.round(totalDistance * 1.35 * 10) / 10;
  // Average van driving speed: 22 km/h
  const drivingMinutes = Math.round((actualRoadDistanceKm / 22) * 60 * factor);
  // Add 3 minutes dwelling/boarding buffer per active stop
  const dwellingMinutes = activePickups.length * 3;
  const totalTripDuration = drivingMinutes + dwellingMinutes;

  // Compute arrival times for each stop
  const [targetH, targetM] = targetSchoolArrival.split(':').map(Number);
  const targetEndMinute = targetH * 60 + targetM;
  const startTripMinute = Math.max(360, targetEndMinute - totalTripDuration); // Not earlier than 06:00

  let accumulatedMinutes = startTripMinute;
  allOrdered.forEach((stop, idx) => {
    stop.order = idx + 1;
    const h = Math.floor(accumulatedMinutes / 60);
    const m = accumulatedMinutes % 60;
    stop.estimatedArrival = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    stop.scheduledTime = stop.estimatedArrival;

    if (stop.status === 'pendente' && idx === 0) {
      stop.status = 'a_caminho';
    }

    // Add estimated leg time to next stop (dwelling + leg driving)
    const legMinutes = Math.max(4, Math.round((totalTripDuration / Math.max(1, allOrdered.length))));
    accumulatedMinutes += legMinutes;
  });

  const finalArrivalH = Math.floor(accumulatedMinutes / 60);
  const finalArrivalM = accumulatedMinutes % 60;
  const schoolArrivalEstimate = `${String(finalArrivalH).padStart(2, '0')}:${String(finalArrivalM).padStart(2, '0')}`;

  return {
    optimizedStops: allOrdered,
    totalDistanceKm: actualRoadDistanceKm,
    totalDurationMinutes: totalTripDuration,
    trafficCondition: condition,
    trafficFactor: factor,
    schoolArrivalEstimate,
    isPunctualForBell: accumulatedMinutes <= targetEndMinute + 5,
    optimizedAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  };
}
