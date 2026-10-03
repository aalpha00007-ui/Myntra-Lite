// Shapes the APIs return. Screens only print these - they never compute sizes, totals or results.
export type SizeSystem = "top" | "waist" | "shoe";
export type Build = "slim" | "regular" | "broad";
export type FitPref = "snug" | "regular" | "relaxed";
export type FitVerdict = "small" | "true" | "large";

export type Profile = { heightCm: number; build: Build; top: string; waist: string; shoe: string; pref: FitPref };

export type FitSummary = {
  suggested: string;
  usual: string;
  likeYou: number; // reviewers with a build like yours
  usingLikeYou: boolean; // false when fewer than 3, so all buyers were used
  confidence: "Strong match" | "Good match" | "Mixed signals";
  weak: boolean;
};

export type FitDetail = FitSummary & {
  agree: number;
  basis: number;
  movedWords: string; // e.g. "went one size up"
  pct: { small: number; true: number; large: number };
};

export type ProductCard = {
  id: string;
  brand: string;
  name: string;
  price: number;
  priceLabel: string;
  photo: string;
  colour: string;
  department: "men" | "women" | "footwear";
  sub: string;
  rating: string;
  reviewCount: number;
  sizeLabel: string; // "size", "waist" or "UK size"
  fit: FitSummary;
  wishlisted: boolean;
};

export type ReviewView = {
  id: number;
  rating: number;
  fit: FitVerdict;
  fitLabel: string;
  body: string;
  hasPhoto: boolean;
  who: string; // "168 cm · usually M · regular · kept L · 12d ago"
  likeYou: boolean;
};

export type ProductDetail = ProductCard & {
  sizes: string[];
  fitDetail: FitDetail;
  summary: string[];
  reviewsLikeYou: ReviewView[];
  reviewsAll: ReviewView[];
  photoReviews: number;
  similar: ProductCard[];
};

export type BagLine = {
  productId: string;
  brand: string;
  name: string;
  photo: string;
  size: string;
  qty: number;
  sizes: string[];
  sizeLabel: string;
  suggested: string;
  lineTotalLabel: string;
};

export type Bag = {
  loggedIn: boolean;
  lines: BagLine[];
  count: number;
  totalPriceLabel: string;
  deliveryLabel: string; // "FREE" or "₹79"
  totalLabel: string;
};

export type Address = { id: number; name: string; line: string; city: string; pin: string; kind: string };

export type OrderView = {
  id: number;
  placedLabel: string;
  deliveryByLabel: string;
  paymentLabel: string;
  shipTo: string;
  lines: { productId: string; brand: string; name: string; photo: string; size: string; qty: number; tookFitTwin: boolean; lineTotalLabel: string }[];
  totalLabel: string;
};

export type Me = {
  user: { name: string; username: string; initial: string } | null; // null = guest (no login needed)
  isGuest: boolean;
  profile: Profile;
  isExample: boolean;
  wishlistCount: number;
  bagCount: number;
};

export type Results = {
  testers: number;
  wishlistedItems: number;
  orderedFromWishlist: number;
  conversionLabel: string; // wishlist -> purchase, the north-star metric
  fitTwinShareLabel: string; // of wishlisted items ordered, share in the Fit Twin size
  unsure: number;
  notForMe: number;
  rows: { name: string; wishlisted: number; ordered: number; conversionLabel: string; fitTwinLabel: string; unsure: number }[];
  notes: { product: string; body: string; whenLabel: string }[];
};
