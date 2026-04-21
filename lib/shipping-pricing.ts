import regionData from "@/lib/data/indonesia-34-full.json";

export type ServiceTier = "REGULER" | "EKSPRES" | "HEMAT";

export type AreaNode = {
  province: string;
  cities: Array<{
    city: string;
    districts: string[];
  }>;
};

export type CityEntry = {
  cityName: string;
  provinceName: string;
  coordinates?: { lat: number; lng: number };
};

export type RegionIndex = Record<string, CityEntry[]>;

type Coord = { lat: number; lng: number };

type RegionDataset = {
  metadata: {
    generatedAt: string;
    source: string;
    provinceCount: number;
    notes: string;
  };
  defaults: {
    districts: string[];
  };
  provinces: AreaNode[];
  provinceCoordinates: Record<string, Coord>;
  cityCoordinates: Record<string, Coord>;
  officePartners: Array<{
    name: string;
    area: string;
    address: string;
  }>;
};

const dataset = regionData as RegionDataset;

export const AREA_TREE: AreaNode[] = dataset.provinces;

export const SHIPPING_REGION_METADATA = dataset.metadata;

export const OFFICE_PARTNERS = dataset.officePartners;

const PROVINCE_COORDINATES: Record<string, Coord> = dataset.provinceCoordinates;
const CITY_COORDINATES: Record<string, Coord> = dataset.cityCoordinates;

function normalize(text: string) {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function stripAdministrativePrefix(text: string) {
  return normalize(text).replace(/^(kabupaten|kota)\s+/, "");
}

function withCityAliases() {
  const index: Record<string, Coord> = { ...CITY_COORDINATES };

  for (const [cityName, coord] of Object.entries(CITY_COORDINATES)) {
    const compactName = stripAdministrativePrefix(cityName);
    if (!index[compactName]) {
      index[compactName] = coord;
    }
  }

  for (const provinceNode of AREA_TREE) {
    const provinceCoord = PROVINCE_COORDINATES[normalize(provinceNode.province)];
    for (const cityNode of provinceNode.cities) {
      const cityKey = normalize(cityNode.city);
      const compactName = stripAdministrativePrefix(cityNode.city);
      if (!index[cityKey] && provinceCoord) {
        index[cityKey] = provinceCoord;
      }
      if (!index[compactName] && provinceCoord) {
        index[compactName] = provinceCoord;
      }
    }
  }

  return index;
}

const CITY_COORDINATE_INDEX = withCityAliases();

function buildRegionIndex() {
  return AREA_TREE.reduce<RegionIndex>((acc, provinceNode) => {
    const provinceName = provinceNode.province;
    const provinceKey = normalize(provinceName);
    acc[provinceKey] = provinceNode.cities.map((cityNode) => {
      const cityKey = normalize(cityNode.city);
      const cityKeyCompact = stripAdministrativePrefix(cityNode.city);
      const coordinates = CITY_COORDINATE_INDEX[cityKey] || CITY_COORDINATE_INDEX[cityKeyCompact];
      return {
        cityName: cityNode.city,
        provinceName,
        coordinates
      };
    });
    return acc;
  }, {});
}

export const REGION_INDEX: RegionIndex = buildRegionIndex();

export function resolveAreaCoordinate(params: { city?: string; province?: string }): Coord {
  const cityValue = params.city ? normalize(params.city) : "";
  const cityNoPrefix = params.city ? stripAdministrativePrefix(params.city) : "";

  if (cityValue && CITY_COORDINATE_INDEX[cityValue]) {
    return CITY_COORDINATE_INDEX[cityValue];
  }
  if (cityNoPrefix && CITY_COORDINATE_INDEX[cityNoPrefix]) {
    return CITY_COORDINATE_INDEX[cityNoPrefix];
  }

  const provinceValue = params.province ? normalize(params.province) : "";
  if (provinceValue && PROVINCE_COORDINATES[provinceValue]) {
    return PROVINCE_COORDINATES[provinceValue];
  }

  return PROVINCE_COORDINATES["dki jakarta"];
}

function haversineKm(from: Coord, to: Coord) {
  const earth = 6371;
  const dLat = ((to.lat - from.lat) * Math.PI) / 180;
  const dLng = ((to.lng - from.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((from.lat * Math.PI) / 180) *
      Math.cos((to.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return 2 * earth * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function zoneMultiplier(distanceKm: number) {
  if (distanceKm <= 20) return 0.9;
  if (distanceKm <= 80) return 1;
  if (distanceKm <= 250) return 1.12;
  if (distanceKm <= 600) return 1.24;
  if (distanceKm <= 1200) return 1.38;
  return 1.58;
}

function serviceFee(service: ServiceTier) {
  if (service === "EKSPRES") return 5000;
  if (service === "HEMAT") return 1000;
  return 2000;
}

function serviceMultiplier(service: ServiceTier) {
  if (service === "EKSPRES") return 1.34;
  if (service === "HEMAT") return 0.82;
  return 1;
}

export function formatFullAddress(parts: {
  detail: string;
  subdistrict: string;
  district: string;
  city: string;
  province: string;
  postalCode: string;
}) {
  return [
    parts.detail.trim(),
    `Kel. ${parts.subdistrict.trim()}`,
    `Kec. ${parts.district.trim()}`,
    parts.city.trim(),
    parts.province.trim(),
    parts.postalCode.trim()
  ]
    .filter(Boolean)
    .join(", ");
}

export function estimateShippingCost(params: {
  originCity: string;
  destinationCity: string;
  originProvince: string;
  destinationProvince: string;
  weightKg: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
  service: ServiceTier;
}) {
  const safeWeight = Math.max(0.1, params.weightKg || 0.1);
  const volumeWeight =
    (Math.max(0, params.lengthCm || 0) *
      Math.max(0, params.widthCm || 0) *
      Math.max(0, params.heightCm || 0)) /
    6000;
  const billableWeight = Math.max(safeWeight, volumeWeight || 0);

  const originCoord = resolveAreaCoordinate({
    city: params.originCity,
    province: params.originProvince
  });
  const destinationCoord = resolveAreaCoordinate({
    city: params.destinationCity,
    province: params.destinationProvince
  });

  const distanceKm = haversineKm(originCoord, destinationCoord);
  const distanceFactor = zoneMultiplier(distanceKm);
  const crossProvinceSurcharge =
    params.originProvince.trim() !== params.destinationProvince.trim() ? 1.14 : 1;

  const baseRatePerKg = 11000;
  const roundedWeight = Math.max(1, Math.ceil(billableWeight * 10) / 10);
  const baseCost =
    roundedWeight *
    baseRatePerKg *
    distanceFactor *
    crossProvinceSurcharge *
    serviceMultiplier(params.service);

  const fixedFee = serviceFee(params.service);
  const total = Math.round(baseCost + fixedFee);

  return {
    total,
    baseCost: Math.round(baseCost),
    serviceFee: fixedFee,
    billableWeight: Number(roundedWeight.toFixed(1)),
    distanceKm: Math.round(distanceKm)
  };
}
