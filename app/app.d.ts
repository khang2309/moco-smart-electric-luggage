export type MocoProduct = {
  slug: string;
  name: string;
  image: string;
  price: number;
  oldPrice: number;
  store: string;
  subtitle: string;
  vi: string;
  en: string;
};

export const PRODUCTS: readonly MocoProduct[];
