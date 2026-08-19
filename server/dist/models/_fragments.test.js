import { localizedField } from "./_fragments.js";
describe("localizedField", () => {
    it("defines required Arabic and English string fields", () => {
        expect(localizedField).toHaveProperty("ar");
        expect(localizedField).toHaveProperty("en");
        expect(localizedField.ar.type).toBe(String);
        expect(localizedField.en.type).toBe(String);
        expect(localizedField.ar.required).toBe(true);
        expect(localizedField.en.required).toBe(true);
    });
});
