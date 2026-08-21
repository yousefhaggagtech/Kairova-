import { Schema, model, Document, type Model } from "mongoose";

export interface ISettings extends Document {
  depositPercentage: number;
  walletNumber: string;
  vodafoneCashNumber: string;
  whatsappNumber: string;
  jtApiUrl: string | null;
  jtUsername: string | null;
  jtApiKey: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface SettingsModel extends Model<ISettings> {
  getInstance(): Promise<ISettings>;
}

const settingsSchema = new Schema<ISettings, SettingsModel>(
  {
    depositPercentage: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
      required: true,
    },
    walletNumber: {
      type: String,
      default: "",
      trim: true,
    },
    vodafoneCashNumber: {
      type: String,
      default: "",
      trim: true,
    },
    whatsappNumber: {
      type: String,
      default: "",
      trim: true,
    },
    jtApiUrl: {
      type: String,
      default: null,
    },
    jtUsername: {
      type: String,
      default: null,
    },
    jtApiKey: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

settingsSchema.statics.getInstance = async function getInstance(
  this: SettingsModel,
): Promise<ISettings> {
  let settings = await this.findOne();

  if (!settings) {
    settings = await this.create({
      depositPercentage: 50,
      walletNumber: "",
      vodafoneCashNumber: "",
      whatsappNumber: "",
    });
  }

  return settings;
};

export const Settings = model<ISettings, SettingsModel>(
  "Settings",
  settingsSchema,
);

export default Settings;
