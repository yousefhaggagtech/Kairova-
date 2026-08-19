import { Types } from "mongoose";
import Category from "../../models/Category.js";
import { createCategory, listCategories, softDeleteCategory, updateCategory, } from "./service.js";
const mockCategoryMethod = (method) => jest.spyOn(Category, method);
const buildCategory = (overrides = {}) => ({
    _id: new Types.ObjectId(),
    name: { ar: "Shirts AR", en: "Shirts" },
    slug: "shirts",
    gender: "men",
    parentCategory: null,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
});
describe("category service", () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it("createCategory creates a category with auto-generated slug", async () => {
        const category = buildCategory({ slug: "summer-shirts" });
        const createSpy = mockCategoryMethod("create").mockResolvedValue(category);
        const result = await createCategory({
            name: { ar: "Summer Shirts AR", en: "Summer Shirts" },
            gender: "men",
        });
        expect(result).toBe(category);
        expect(createSpy).toHaveBeenCalledWith({
            name: { ar: "Summer Shirts AR", en: "Summer Shirts" },
            slug: "summer-shirts",
            gender: "men",
            parentCategory: null,
        });
    });
    it("createCategory throws 400 if parent gender doesn't match", async () => {
        const parent = buildCategory({ gender: "women" });
        mockCategoryMethod("findOne").mockResolvedValue(parent);
        const createSpy = mockCategoryMethod("create");
        await expect(createCategory({
            name: { ar: "Shoes AR", en: "Shoes" },
            gender: "men",
            parentCategory: parent._id.toString(),
        })).rejects.toMatchObject({
            statusCode: 400,
            message: "Parent category must have the same gender",
        });
        expect(createSpy).not.toHaveBeenCalled();
    });
    it("createCategory throws 400 if parent doesn't exist", async () => {
        mockCategoryMethod("findOne").mockResolvedValue(null);
        const createSpy = mockCategoryMethod("create");
        await expect(createCategory({
            name: { ar: "Shoes AR", en: "Shoes" },
            gender: "men",
            parentCategory: new Types.ObjectId().toString(),
        })).rejects.toMatchObject({
            statusCode: 400,
            message: "Parent category not found",
        });
        expect(createSpy).not.toHaveBeenCalled();
    });
    it("listCategories returns only active categories", async () => {
        const activeCategory = buildCategory();
        const active = jest.fn().mockResolvedValue([activeCategory]);
        const findSpy = mockCategoryMethod("find").mockReturnValue({ active });
        const result = await listCategories();
        expect(result).toEqual([activeCategory]);
        expect(findSpy).toHaveBeenCalledWith({});
        expect(active).toHaveBeenCalledTimes(1);
    });
    it("listCategories filters by gender correctly", async () => {
        const active = jest.fn().mockResolvedValue([]);
        const findSpy = mockCategoryMethod("find").mockReturnValue({ active });
        await listCategories({ gender: "women" });
        expect(findSpy).toHaveBeenCalledWith({ gender: "women" });
    });
    it("updateCategory regenerates slug when name.en changes", async () => {
        const id = new Types.ObjectId().toString();
        const category = buildCategory({ _id: new Types.ObjectId(id) });
        const updatedCategory = buildCategory({
            _id: category._id,
            name: { ar: "Evening Dresses AR", en: "Evening Dresses" },
            slug: "evening-dresses",
        });
        mockCategoryMethod("findOne").mockResolvedValue(category);
        const updateSpy = mockCategoryMethod("findOneAndUpdate").mockResolvedValue(updatedCategory);
        const result = await updateCategory(id, {
            name: { ar: "Evening Dresses AR", en: "Evening Dresses" },
        });
        expect(result).toBe(updatedCategory);
        expect(updateSpy).toHaveBeenCalledWith({ _id: id, deletedAt: null }, {
            name: { ar: "Evening Dresses AR", en: "Evening Dresses" },
            slug: "evening-dresses",
        }, {
            new: true,
            runValidators: true,
        });
    });
    it("updateCategory prevents setting parent to self", async () => {
        const id = new Types.ObjectId().toString();
        mockCategoryMethod("findOne").mockResolvedValue(buildCategory({ _id: new Types.ObjectId(id) }));
        const updateSpy = mockCategoryMethod("findOneAndUpdate");
        await expect(updateCategory(id, { parentCategory: id })).rejects.toMatchObject({
            statusCode: 400,
            message: "Category cannot be its own parent",
        });
        expect(updateSpy).not.toHaveBeenCalled();
    });
    it("softDeleteCategory marks deletedAt and excludes from active queries", async () => {
        const id = new Types.ObjectId().toString();
        const deletedCategory = buildCategory({ deletedAt: new Date() });
        const updateSpy = mockCategoryMethod("findOneAndUpdate").mockResolvedValue(deletedCategory);
        const active = jest.fn().mockResolvedValue([]);
        mockCategoryMethod("find").mockReturnValue({ active });
        const result = await softDeleteCategory(id);
        const listedCategories = await listCategories();
        expect(result).toBe(deletedCategory);
        expect(updateSpy).toHaveBeenCalledWith({ _id: id, deletedAt: null }, { deletedAt: expect.any(Date) }, {
            new: true,
            runValidators: true,
        });
        expect(listedCategories).toEqual([]);
        expect(active).toHaveBeenCalledTimes(1);
    });
});
