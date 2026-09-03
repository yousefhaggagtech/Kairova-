import type { Request, Response } from "express";
import { Types } from "mongoose";

import User, { type IAddress } from "../../models/User.js";
import AppError from "../../utils/AppError.js";
import { catchError } from "../../utils/catchError.js";
import type { AddressInput, UpdateAddressInput } from "./validation.js";

const requireUserId = (req: Request): string => {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  return req.user.id;
};

const toObjectId = (id: string, message: string): Types.ObjectId => {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(message, 400);
  }

  return new Types.ObjectId(id);
};

const optionalString = (value?: string) => {
  const trimmed = value?.trim();

  return trimmed ? trimmed : undefined;
};

const normalizeAddressInput = (input: AddressInput) => ({
  nickname: optionalString(input.nickname),
  fullName: input.fullName.trim(),
  phone: input.phone.trim(),
  city: input.city.trim(),
  area: optionalString(input.area),
  street: input.street.trim(),
  building: optionalString(input.building),
  floor: optionalString(input.floor),
  apartment: optionalString(input.apartment),
  notes: optionalString(input.notes),
});

const normalizeAddressUpdate = (input: UpdateAddressInput) => {
  const normalized: Record<string, string | undefined> = {};

  for (const [key, value] of Object.entries(input)) {
    normalized[key] = optionalString(value);
  }

  return normalized;
};

const serializeAddress = (address: IAddress) => ({
  _id: address._id.toString(),
  nickname: address.nickname,
  fullName: address.fullName,
  phone: address.phone,
  city: address.city,
  area: address.area,
  street: address.street,
  building: address.building,
  floor: address.floor,
  apartment: address.apartment,
  notes: address.notes,
  isDefault: address.isDefault,
});

const getUserWithAddresses = async (userId: Types.ObjectId) => {
  const user = await User.findById(userId).select("addresses");

  if (!user) {
    throw new AppError("User no longer exists", 401);
  }

  return user;
};

const getUserAddressBook = async (userId: Types.ObjectId) => {
  const user = await getUserWithAddresses(userId);

  return user.addresses.map(serializeAddress);
};

const setDefaultAddressForUser = async (
  userId: Types.ObjectId,
  addressId: Types.ObjectId,
) => {
  const result = await User.updateOne(
    { _id: userId, "addresses._id": addressId },
    [
      {
        $set: {
          addresses: {
            $map: {
              input: { $ifNull: ["$addresses", []] },
              as: "address",
              in: {
                $mergeObjects: [
                  "$$address",
                  { isDefault: { $eq: ["$$address._id", addressId] } },
                ],
              },
            },
          },
        },
      },
    ],
    { updatePipeline: true },
  );

  if (result.matchedCount === 0) {
    throw new AppError("Address not found", 404);
  }

  return getUserAddressBook(userId);
};

export const listAddressesController = catchError(
  async (req: Request, res: Response) => {
    const userId = toObjectId(requireUserId(req), "Invalid user id");
    const addresses = await getUserAddressBook(userId);

    res.status(200).json({
      status: "success",
      data: { addresses },
    });
  },
);

export const createAddressController = catchError(
  async (req: Request, res: Response) => {
    const userId = toObjectId(requireUserId(req), "Invalid user id");
    const input = req.body as AddressInput;
    const currentAddresses = await getUserAddressBook(userId);
    const addressId = new Types.ObjectId();
    const shouldSetDefault =
      input.isDefault === true || currentAddresses.length === 0;
    const address: IAddress = {
      _id: addressId,
      ...normalizeAddressInput(input),
      isDefault: shouldSetDefault,
    };

    if (shouldSetDefault) {
      await User.updateOne(
        { _id: userId },
        [
          {
            $set: {
              addresses: {
                $concatArrays: [
                  {
                    $map: {
                      input: { $ifNull: ["$addresses", []] },
                      as: "address",
                      in: {
                        $mergeObjects: ["$$address", { isDefault: false }],
                      },
                    },
                  },
                  [address],
                ],
              },
            },
          },
        ],
        { updatePipeline: true },
      );
    } else {
      await User.updateOne({ _id: userId }, { $push: { addresses: address } });
    }

    const addresses = await getUserAddressBook(userId);
    const createdAddress = addresses.find(
      (savedAddress) => savedAddress._id === addressId.toString(),
    );

    res.status(201).json({
      status: "success",
      data: { address: createdAddress, addresses },
    });
  },
);

export const updateAddressController = catchError(
  async (req: Request, res: Response) => {
    const userId = toObjectId(requireUserId(req), "Invalid user id");
    const addressId = toObjectId(
      String(req.params.addressId),
      "Invalid address id",
    );
    const input = req.body as UpdateAddressInput;
    const update = normalizeAddressUpdate(input);
    const setUpdate: Record<string, string> = {};
    const unsetUpdate: Record<string, ""> = {};

    Object.entries(update).forEach(([key, value]) => {
      const path = `addresses.$.${key}`;

      if (value === undefined) {
        unsetUpdate[path] = "";
      } else {
        setUpdate[path] = value;
      }
    });

    const updateOperations: {
      $set?: Record<string, string>;
      $unset?: Record<string, "">;
    } = {};

    if (Object.keys(setUpdate).length > 0) {
      updateOperations.$set = setUpdate;
    }

    if (Object.keys(unsetUpdate).length > 0) {
      updateOperations.$unset = unsetUpdate;
    }

    const user = await User.findOneAndUpdate(
      { _id: userId, "addresses._id": addressId },
      updateOperations,
      { returnDocument: "after", runValidators: true },
    ).select("addresses");

    if (!user) {
      throw new AppError("Address not found", 404);
    }

    res.status(200).json({
      status: "success",
      data: { addresses: user.addresses.map(serializeAddress) },
    });
  },
);

export const deleteAddressController = catchError(
  async (req: Request, res: Response) => {
    const userId = toObjectId(requireUserId(req), "Invalid user id");
    const addressId = toObjectId(
      String(req.params.addressId),
      "Invalid address id",
    );
    const user = await getUserWithAddresses(userId);
    const addressIndex = user.addresses.findIndex(
      (savedAddress) => savedAddress._id.toString() === addressId.toString(),
    );

    if (addressIndex < 0) {
      throw new AppError("Address not found", 404);
    }

    const [address] = user.addresses.splice(addressIndex, 1);

    if (
      address?.isDefault &&
      user.addresses.length > 0 &&
      !user.addresses.some((savedAddress) => savedAddress.isDefault)
    ) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    res.status(200).json({
      status: "success",
      data: { addresses: user.addresses.map(serializeAddress) },
    });
  },
);

export const setDefaultAddressController = catchError(
  async (req: Request, res: Response) => {
    const userId = toObjectId(requireUserId(req), "Invalid user id");
    const addressId = toObjectId(
      String(req.params.addressId),
      "Invalid address id",
    );

    const addresses = await setDefaultAddressForUser(userId, addressId);

    res.status(200).json({
      status: "success",
      data: { addresses },
    });
  },
);
