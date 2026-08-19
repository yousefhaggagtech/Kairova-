import Category from "../../models/Category.js";
import AppError from "../../utils/AppError.js";
export const generateSlug = (name) => name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
const validateParentCategory = async (parentCategory, gender) => {
    if (!parentCategory) {
        return null;
    }
    const parent = await Category.findOne({
        _id: parentCategory,
        deletedAt: null,
    });
    if (!parent) {
        throw new AppError("Parent category not found", 400);
    }
    if (parent.gender !== gender) {
        throw new AppError("Parent category must have the same gender", 400);
    }
    return parent._id.toString();
};
export const createCategory = async (input) => {
    const parentCategory = await validateParentCategory(input.parentCategory, input.gender);
    const categoryPayload = {
        name: input.name,
        slug: generateSlug(input.name.en),
        gender: input.gender,
        parentCategory,
    };
    return Category.create(categoryPayload);
};
export const listCategories = async (filters = {}) => {
    const query = {};
    if (filters.gender) {
        query.gender = filters.gender;
    }
    if (filters.parentCategory !== undefined) {
        query.parentCategory = filters.parentCategory;
    }
    return Category.find(query).active();
};
export const getCategoryById = async (id) => {
    const category = await Category.findOne({ _id: id, deletedAt: null });
    if (!category) {
        throw new AppError("Category not found", 404);
    }
    return category;
};
export const getCategoryBySlug = async (slug) => {
    const category = await Category.findOne({
        slug: generateSlug(slug),
        deletedAt: null,
    });
    if (!category) {
        throw new AppError("Category not found", 404);
    }
    return category;
};
export const updateCategory = async (id, updates) => {
    const category = await getCategoryById(id);
    const update = {};
    if (updates.name) {
        update.name = updates.name;
        update.slug = generateSlug(updates.name.en);
    }
    if (updates.parentCategory !== undefined) {
        if (updates.parentCategory === id) {
            throw new AppError("Category cannot be its own parent", 400);
        }
        update.parentCategory = await validateParentCategory(updates.parentCategory, category.gender);
    }
    const updatedCategory = await Category.findOneAndUpdate({ _id: id, deletedAt: null }, update, {
        new: true,
        runValidators: true,
    });
    if (!updatedCategory) {
        throw new AppError("Category not found", 404);
    }
    return updatedCategory;
};
export const softDeleteCategory = async (id) => {
    const category = await Category.findOneAndUpdate({ _id: id, deletedAt: null }, { deletedAt: new Date() }, {
        new: true,
        runValidators: true,
    });
    if (!category) {
        throw new AppError("Category not found", 404);
    }
    return category;
};
