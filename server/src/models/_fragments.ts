import { Schema } from "mongoose";
import type { LocalizedString } from "../types/localized.js";

type LocalizedField = Record<
  keyof LocalizedString,
  {
    type: StringConstructor | typeof Schema.Types.String;
    required: true;
    trim: true;
  }
>;

export const localizedField = {
  ar: { type: String, required: true, trim: true },
  en: { type: String, required: true, trim: true },
} satisfies LocalizedField;
