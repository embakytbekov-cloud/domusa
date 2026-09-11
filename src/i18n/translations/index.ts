import type { LanguageCode } from "../languages";
import type { Dict } from "../types";
import { ru } from "./ru";
import { en } from "./en";
import { ky } from "./ky";
import { kk } from "./kk";
import { uz } from "./uz";
import { uk } from "./uk";
import { tr } from "./tr";

export const DICTS: Record<LanguageCode, Dict> = { ru, en, ky, kk, uz, uk, tr };
