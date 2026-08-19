import { Schema, model, } from "mongoose";
import { localizedField } from "./_fragments.js";
const categorySchema = new Schema({
    name: localizedField,
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    gender: {
        type: String,
        enum: ["men", "women"],
        required: true,
    },
    parentCategory: {
        type: Schema.Types.ObjectId,
        ref: "Category",
        default: null,
    },
    deletedAt: {
        type: Date,
        default: null,
    },
}, { timestamps: true });
categorySchema.index({ gender: 1, parentCategory: 1 });
categorySchema.index({ gender: 1, "name.ar": 1 }, {
    unique: true,
    partialFilterExpression: { deletedAt: null },
});
categorySchema.query.active = function active() {
    return this.find({ deletedAt: null });
};
export const Category = model("Category", categorySchema);
export default Category;
