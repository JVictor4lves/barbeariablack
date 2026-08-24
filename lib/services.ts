export const SERVICES = [
  {
    id: "corte-classico",
    name: "Corte Clássico",
    description: "Corte personalizado com acabamento preciso e finalização.",
    duration: 30,
    price: 35,
  },
  {
    id: "barba-black",
    name: "Barba Black",
    description: "Modelagem, alinhamento e acabamento para uma barba impecável.",
    duration: 30,
    price: 25,
  },
  {
    id: "combo-black",
    name: "Combo Black",
    description: "Corte e barba em uma experiência completa de cuidado e estilo.",
    duration: 60,
    price: 55,
  },
  {
    id: "corte-sobrancelha",
    name: "Corte + Sobrancelha",
    description: "Corte completo com alinhamento natural das sobrancelhas.",
    duration: 45,
    price: 45,
  },
] as const;

export const AVAILABLE_TIMES = [
  "06:00", "06:30", "07:00", "07:30", "08:00", "08:30", "09:00",
  "09:30", "10:00", "10:30", "11:00", "11:30", "12:00",
] as const;

export type ServiceId = (typeof SERVICES)[number]["id"];

export function getService(serviceId: string) {
  return SERVICES.find((service) => service.id === serviceId);
}
