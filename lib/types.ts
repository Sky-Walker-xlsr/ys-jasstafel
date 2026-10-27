export type Side = "a" | "b";

export interface Round {
  id: string;
  no: number;
  side: Side;
  /** Points entered (0–157), 257 for a match, or the value tapped on the Z */
  input: number;
  isMatch: boolean;
  /** Tapped on the Z (100/50/20, e.g. for Weis): counts only for the own side */
  isManual?: boolean;
  multiplier: number;
  pointsA: number;
  pointsB: number;
  createdAt: string;
}

export interface Game {
  id: string;
  teamA: string;
  teamB: string;
  target: number;
  /** Legacy banked Striche (before the Striche log), shown as "Übertrag". */
  strokesA?: number;
  strokesB?: number;
  /** Striche of earlier Partien and manually added ones */
  strokeLog?: StrokeEntry[];
  /** Ids of auto Striche of the running Partie that were deleted, see `liveStrokeEntries()` */
  strokeSkip?: string[];
  createdAt: string;
  updatedAt: string;
  rounds: Round[];
}

export type StrokeKind = "win" | "berg" | "manual" | "carry";

export interface StrokeEntry {
  id: string;
  side: Side;
  kind: StrokeKind;
  count: number;
  createdAt: string;
  /** Derived from the rounds of the running Partie, not stored yet */
  live?: boolean;
}

export interface RoundInput {
  side: Side;
  input: number;
  isMatch: boolean;
  isManual?: boolean;
  multiplier: number;
}
