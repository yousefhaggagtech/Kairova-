import Settings, { type ISettings } from "../../models/Settings.js";

export interface BusinessSettings {
  depositPercentage: number;
  walletNumber: string;
  vodafoneCashNumber: string;
  whatsappNumber: string;
}

export type SettingsUpdateInput = Partial<BusinessSettings>;

export async function getSettings(): Promise<ISettings> {
  return Settings.getInstance();
}

export function serializeBusinessSettings(settings: ISettings): BusinessSettings {
  return {
    depositPercentage: settings.depositPercentage,
    walletNumber: settings.walletNumber,
    vodafoneCashNumber: settings.vodafoneCashNumber,
    whatsappNumber: settings.whatsappNumber,
  };
}

export async function updateSettings(
  updates: SettingsUpdateInput,
): Promise<ISettings> {
  const settings = await Settings.getInstance();

  if (updates.depositPercentage !== undefined) {
    settings.depositPercentage = updates.depositPercentage;
  }

  if (updates.walletNumber !== undefined) {
    settings.walletNumber = updates.walletNumber;
  }

  if (updates.vodafoneCashNumber !== undefined) {
    settings.vodafoneCashNumber = updates.vodafoneCashNumber;
  }

  if (updates.whatsappNumber !== undefined) {
    settings.whatsappNumber = updates.whatsappNumber;
  }

  await settings.save();

  return settings;
}
