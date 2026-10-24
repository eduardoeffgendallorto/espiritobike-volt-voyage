import urban from "@/assets/urban.png.asset.json";
import v9 from "@/assets/v9-maxx.png.asset.json";
import v8 from "@/assets/v8pro.webp.asset.json";

export type Product = {
  slug: string;
  name: string;
  brand: string;
  year: string;
  category: string;
  price: number;
  oldPrice?: number;
  priceNote?: string;
  colors: string[];
  motor: string;
  battery: string;
  range: string;
  rangeMax: number;
  wheel?: string;
  image: string;
  highlight: string;
};

export const STORE = {
  name: "EspiritoBike",
  tagline: "A frase você quem decide.",
  phoneSales: "(27) 99742-2727",
  phoneService: "(27) 99822-2397",
  whatsapp: "5527997422727",
  instagram: "https://www.instagram.com/espiritobike027/",
  address: "R. Vital Brasil, 509 - Res. Coqueiral, Vila Velha - ES, 29104-498",
};

export const products: Product[] = [
  {
    slug: "urban-2026",
    name: "Urban",
    brand: "GLAF",
    year: "2026/2027",
    category: "Elétrica · Aro 20\" Fat Tire",
    price: 6690,
    oldPrice: 7390,
    colors: ["Preto com banco caramelo"],
    motor: "1000W (alto torque para subidas)",
    battery: "Lítio 18Ah",
    range: "Até 60 km",
    rangeMax: 60,
    wheel: "Aro 20\" Fat Tire",
    image: urban.url as string,
    highlight: "Lançamento",
  },
  {
    slug: "v9-max-ranger",
    name: "V9 Max Ranger",
    brand: "V9 MAX",
    year: "2026/2027",
    category: "Elétrica",
    price: 6690,
    colors: ["Preto"],
    motor: "Não informado",
    battery: "20Ah",
    range: "Até 70 km",
    rangeMax: 70,
    image: v9.url as string,
    highlight: "Maior autonomia",
  },
  {
    slug: "ouxi-v8-pro",
    name: "V8 Pro",
    brand: "Ouxi",
    year: "2026",
    category: "Elétrica · Fat Tire",
    price: 7420,
    priceNote: "A partir de · valor simbólico",
    colors: ["Preto (banco preto)", "Preto (banco café)", "Cinza"],
    motor: "1000W",
    battery: "48V 15Ah (ou 48V 30Ah bateria dupla)",
    range: "40–60 km (até 90 km bateria dupla)",
    rangeMax: 90,
    image: v8.url as string,
    highlight: "Bateria dupla",
  },
];

export const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);
