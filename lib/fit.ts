// Fit Twin: suggests a size for one shopper from reviews by buyers with a similar build.
// Pure functions, no database - the APIs pass in the facts (reviews + size profile).
import type { Build, FitDetail, FitPref, FitSummary, FitVerdict, Profile, ReviewView, SizeSystem } from "@/lib/types";

export const SIZES: Record<SizeSystem, string[]> = {
  top: ["XS", "S", "M", "L", "XL", "XXL"],
  waist: ["28", "30", "32", "34", "36"],
  shoe: ["6", "7", "8", "9", "10", "11"],
};
export const SIZE_LABEL: Record<SizeSystem, string> = { top: "size", waist: "waist", shoe: "UK size" };
export const BUILDS: Build[] = ["slim", "regular", "broad"];
export const PREFS: FitPref[] = ["snug", "regular", "relaxed"];

// Used until a shopper saves their own Size Details.
export const EXAMPLE_PROFILE: Profile = { heightCm: 165, build: "regular", top: "M", waist: "30", shoe: "8", pref: "regular" };

export type ReviewFact = {
  id: number;
  height_cm: number;
  build: string;
  usual_size: string;
  kept_size: string;
  fit: FitVerdict;
  rating: number;
  body: string;
  has_photo: boolean;
  days_ago: number;
};

export const usualFor = (p: Profile, sys: SizeSystem) => (sys === "top" ? p.top : sys === "waist" ? p.waist : p.shoe);
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

// 0-4 points: height within 6 cm, same usual size (2) or one apart (1), same build (shoes ignore build).
function similarity(sys: SizeSystem, r: ReviewFact, p: Profile) {
  const sizes = SIZES[sys];
  const u = sizes.indexOf(usualFor(p, sys));
  const v = sizes.indexOf(r.usual_size);
  let s = 0;
  if (Math.abs(r.height_cm - p.heightCm) <= 6) s += 1;
  if (u === v) s += 2;
  else if (Math.abs(u - v) === 1) s += 1;
  if (sys === "shoe" || r.build === p.build) s += 1;
  return s;
}

// How many sizes away from their usual size a reviewer should have bought.
function neededOffset(sys: SizeSystem, r: ReviewFact) {
  const sizes = SIZES[sys];
  return sizes.indexOf(r.kept_size) - sizes.indexOf(r.usual_size) + (r.fit === "small" ? 1 : r.fit === "large" ? -1 : 0);
}

export function movedWords(o: number) {
  if (o === 0) return "kept their usual size";
  if (o === 1) return "went one size up";
  if (o === -1) return "went one size down";
  return o > 0 ? `went ${o} sizes up` : `went ${-o} sizes down`;
}

export function analyse(sys: SizeSystem, reviews: ReviewFact[], p: Profile) {
  const likeYou = reviews
    .map((r) => ({ r, s: similarity(sys, r, p) }))
    .filter((x) => x.s >= 3)
    .sort((a, b) => b.s - a.s || a.r.days_ago - b.r.days_ago)
    .map((x) => x.r);
  const usingLikeYou = likeYou.length >= 3;
  const basis = usingLikeYou ? likeYou : reviews;

  const tally = new Map<number, number>();
  const counts = { small: 0, true: 0, large: 0 };
  for (const r of basis) {
    const o = neededOffset(sys, r);
    tally.set(o, (tally.get(o) ?? 0) + 1);
    counts[r.fit] += 1;
  }
  let offset = 0;
  let agree = 0;
  for (const [o, n] of tally) if (n > agree) { agree = n; offset = o; }

  const sizes = SIZES[sys];
  const ui = Math.max(0, sizes.indexOf(usualFor(p, sys)));
  const share = basis.length ? agree / basis.length : 0;
  const pct = (n: number) => (basis.length ? Math.round((100 * n) / basis.length) : 0);

  const summary: FitSummary = {
    suggested: sizes[clamp(ui + offset, 0, sizes.length - 1)],
    usual: sizes[ui],
    likeYou: likeYou.length,
    usingLikeYou,
    confidence: share >= 0.7 ? "Strong match" : share >= 0.5 ? "Good match" : "Mixed signals",
    weak: share < 0.5,
  };
  const detail: FitDetail = {
    ...summary,
    agree,
    basis: basis.length,
    movedWords: movedWords(offset),
    pct: { small: pct(counts.small), true: pct(counts.true), large: pct(counts.large) },
  };
  return { summary, detail, likeYou, basis };
}

// A plain-language summary computed from the reviews (no AI): size advice, fit, and the most-mentioned notes.
export function reviewSummary(d: FitDetail, basis: ReviewFact[]): string[] {
  const notes = new Map<string, number>();
  for (const r of basis) {
    const parts = r.body.split(". ");
    const rest = parts.slice(1).join(". ").replace(/\.$/, "");
    if (rest) notes.set(rest, (notes.get(rest) ?? 0) + 1);
  }
  const top = [...notes.entries()].sort((a, b) => b[1] - a[1]).slice(0, 2).map(([t]) => t);
  return [
    `Size: pick ${d.suggested}. ${d.agree} of ${d.basis} ${d.usingLikeYou ? "buyers like you" : "buyers"} ${d.movedWords}.`,
    `Fit: ${d.pct.true}% say it fits true to size, ${d.pct.small}% say it runs small, ${d.pct.large}% say it runs large.`,
    top.length ? `Watch out: ${top.join("; ")}.` : "",
  ].filter(Boolean);
}

const FIT_LABEL: Record<FitVerdict, string> = { small: "Ran small", true: "True to size", large: "Ran large" };

export function reviewView(r: ReviewFact, likeYou: boolean): ReviewView {
  return {
    id: r.id,
    rating: r.rating,
    fit: r.fit,
    fitLabel: FIT_LABEL[r.fit],
    body: r.body,
    hasPhoto: r.has_photo,
    who: `${r.height_cm} cm · usually ${r.usual_size} · ${r.build} · kept ${r.kept_size} · ${r.days_ago}d ago`,
    likeYou,
  };
}

// Validates a size profile sent by a screen. Returns an error message or the clean profile.
export function parseProfile(b: Record<string, unknown>): Profile | string {
  const heightCm = Number(b.heightCm);
  if (!Number.isInteger(heightCm) || heightCm < 140 || heightCm > 200) return "Height must be a whole number between 140 and 200 cm.";
  if (!BUILDS.includes(b.build as Build)) return "Build must be slim, regular or broad.";
  if (!SIZES.top.includes(String(b.top))) return "Choose a top size from XS to XXL.";
  if (!SIZES.waist.includes(String(b.waist))) return "Choose a waist size from 28 to 36.";
  if (!SIZES.shoe.includes(String(b.shoe))) return "Choose a UK shoe size from 6 to 11.";
  if (!PREFS.includes(b.pref as FitPref)) return "Fit preference must be snug, regular or relaxed.";
  return { heightCm, build: b.build as Build, top: String(b.top), waist: String(b.waist), shoe: String(b.shoe), pref: b.pref as FitPref };
}
