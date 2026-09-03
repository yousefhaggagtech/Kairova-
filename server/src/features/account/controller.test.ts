import cookieParser from "cookie-parser";
import express from "express";
import request from "supertest";

import globalErrorHandler from "../../middleware/globalErrorHandler.js";
import User, { type IUser } from "../../models/User.js";
import { signAccessToken } from "../auth/tokenService.js";
import accountRoutes from "./routes.js";

const validAddress = {
  nickname: "Mom's place",
  fullName: "Yousef Haggag",
  phone: "+201001234567",
  city: "Cairo",
  area: "Zamalek",
  street: "12 Nile Street",
  building: "12",
  floor: "4",
  apartment: "8",
  notes: "Call before arrival",
};

const idOf = (document: { _id: unknown }): string => String(document._id);

const createTestApp = () => {
  const testApp = express();

  testApp.use(express.json());
  testApp.use(cookieParser());
  testApp.use("/api/account", accountRoutes);
  testApp.use(globalErrorHandler);

  return testApp;
};

const app = createTestApp();

const authCookie = (user: IUser): string => {
  return `accessToken=${signAccessToken(idOf(user), user.role)}`;
};

const createCustomer = (email: string) =>
  User.create({
    name: "Test Customer",
    email,
    password: "password123",
    phone: "+201001234567",
    role: "customer",
  });

const createAddress = async (
  user: IUser,
  overrides: Partial<typeof validAddress & { isDefault: boolean }> = {},
) => {
  const response = await request(app)
    .post("/api/account/addresses")
    .set("Cookie", authCookie(user))
    .send({ ...validAddress, ...overrides })
    .expect(201);

  return response.body.data.address as { _id: string; isDefault: boolean };
};

describe("account address controllers", () => {
  let customer: IUser;
  let otherCustomer: IUser;

  beforeEach(async () => {
    customer = await createCustomer("customer@example.com");
    otherCustomer = await createCustomer("other@example.com");
  });

  it("creates the first address as default and lists saved addresses", async () => {
    const createdAddress = await createAddress(customer);

    expect(createdAddress).toMatchObject({
      nickname: validAddress.nickname,
      fullName: validAddress.fullName,
      isDefault: true,
    });

    const response = await request(app)
      .get("/api/account/addresses")
      .set("Cookie", authCookie(customer))
      .expect(200);

    expect(response.body.data.addresses).toHaveLength(1);
    expect(response.body.data.addresses[0]).toMatchObject({
      _id: createdAddress._id,
      street: validAddress.street,
      isDefault: true,
    });
  });

  it("sets one default address at a time", async () => {
    const firstAddress = await createAddress(customer);
    const secondAddress = await createAddress(customer, {
      nickname: "Office",
      isDefault: true,
    });

    expect(firstAddress.isDefault).toBe(true);

    const response = await request(app)
      .patch(`/api/account/addresses/${firstAddress._id}/default`)
      .set("Cookie", authCookie(customer))
      .expect(200);
    const addresses = response.body.data.addresses as Array<{
      _id: string;
      isDefault: boolean;
    }>;

    expect(addresses.filter((address) => address.isDefault)).toEqual([
      expect.objectContaining({ _id: firstAddress._id, isDefault: true }),
    ]);
    expect(addresses.find((address) => address._id === secondAddress._id)).toMatchObject({
      isDefault: false,
    });
  });

  it("updates an owned address", async () => {
    const address = await createAddress(customer);

    const response = await request(app)
      .patch(`/api/account/addresses/${address._id}`)
      .set("Cookie", authCookie(customer))
      .send({ street: "34 Gezira Street", notes: "" })
      .expect(200);

    expect(response.body.data.addresses[0]).toMatchObject({
      _id: address._id,
      street: "34 Gezira Street",
    });
    expect(response.body.data.addresses[0].notes).toBeUndefined();
  });

  it("rejects editing or deleting another customer's address id", async () => {
    const otherAddress = await createAddress(otherCustomer);

    await request(app)
      .patch(`/api/account/addresses/${otherAddress._id}`)
      .set("Cookie", authCookie(customer))
      .send({ street: "Forbidden Street" })
      .expect(404);

    await request(app)
      .delete(`/api/account/addresses/${otherAddress._id}`)
      .set("Cookie", authCookie(customer))
      .expect(404);

    const otherUser = await User.findById(otherCustomer._id);

    expect(otherUser?.addresses).toHaveLength(1);
    expect(otherUser?.addresses[0]?.street).toBe(validAddress.street);
  });

  it("deletes an owned address", async () => {
    const address = await createAddress(customer);

    const response = await request(app)
      .delete(`/api/account/addresses/${address._id}`)
      .set("Cookie", authCookie(customer))
      .expect(200);

    expect(response.body.data.addresses).toEqual([]);
  });
});
