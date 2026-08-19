import AppError from "../utils/AppError.js";
import globalErrorHandler from "./globalErrorHandler.js";
const createMockRequest = () => jest.fn();
const createMockResponse = () => ({
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
});
const createMockNext = () => jest.fn();
describe("globalErrorHandler", () => {
    let consoleErrorSpy;
    beforeEach(() => {
        consoleErrorSpy = jest
            .spyOn(console, "error")
            .mockImplementation(() => undefined);
    });
    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });
    it("responds with operational AppError details", () => {
        const req = createMockRequest();
        const res = createMockResponse();
        const next = createMockNext();
        const error = new AppError("Missing resource", 404);
        globalErrorHandler(error, req, res, next);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            status: "fail",
            message: "Missing resource",
        });
        expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
    it("responds with a generic 500 for generic Error instances", () => {
        const req = createMockRequest();
        const res = createMockResponse();
        const next = createMockNext();
        const error = new Error("Database unavailable");
        globalErrorHandler(error, req, res, next);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            status: "error",
            message: "Something went wrong",
        });
        expect(consoleErrorSpy).toHaveBeenCalledWith("Unhandled error:", error);
    });
    it("responds with a generic 500 for non-Error values", () => {
        const req = createMockRequest();
        const res = createMockResponse();
        const next = createMockNext();
        globalErrorHandler("unexpected failure", req, res, next);
        expect(res.status).toHaveBeenCalledWith(500);
    });
});
