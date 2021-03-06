import * as grpc from "grpc";

import * as dgraph from "../src";
// Non-exported functions.
import { isAbortedError, isConflictError, mergeLinReads, promisify } from "../src/util";

import { areLinReadsEqual, createLinRead } from "./helper";

function fnAddThisVal(a: number, cb: (err?: Error | null, res?: number) => void): void {
    // tslint:disable-next-line no-invalid-this
    cb(null, (<{ val: number }>this).val + a);
}

describe("util", () => {
    describe("mergeLinReads", () => {
        it("should merge two differnt linReads", () => {
            const lr1 = createLinRead([1, 1]);
            const lr2 = createLinRead([2, 2], [3, 3]);
            const res = createLinRead([1, 1], [2, 2], [3, 3]);
            expect(areLinReadsEqual(mergeLinReads(lr1, lr2), res)).toBe(true);
            expect(areLinReadsEqual(lr1, res)).toBe(true);
        });

        it("should use max value if lower value merged", () => {
            const lr1 = createLinRead([1, 2]);
            const lr2 = createLinRead([1, 1]);
            const res = createLinRead([1, 2]);
            expect(areLinReadsEqual(mergeLinReads(lr1, lr2), res)).toBe(true);
            expect(areLinReadsEqual(lr1, res)).toBe(true);
        });

        it("should use max value if higher value merged", () => {
            const lr1 = createLinRead([1, 1]);
            const lr2 = createLinRead([1, 2]);
            const res = createLinRead([1, 2]);
            expect(areLinReadsEqual(mergeLinReads(lr1, lr2), res)).toBe(true);
            expect(areLinReadsEqual(lr1, res)).toBe(true);
        });

        it("should merge if values are same", () => {
            const lr1 = createLinRead([1, 1]);
            const lr2 = createLinRead([1, 1]);
            const res = createLinRead([1, 1]);
            expect(areLinReadsEqual(mergeLinReads(lr1, lr2), res)).toBe(true);
            expect(areLinReadsEqual(lr1, res)).toBe(true);
        });

        it("should merge if src linRead is null", () => {
            const lr1 = createLinRead([1, 1], [2, 2]);
            const lr2: dgraph.LinRead | null = null;
            const res = createLinRead([1, 1], [2, 2]);
            expect(areLinReadsEqual(mergeLinReads(lr1, lr2), res)).toBe(true);
            expect(areLinReadsEqual(lr1, res)).toBe(true);
        });

        it("should merge if target ids is not set", () => {
            const lr1 = createLinRead();
            const lr2 = createLinRead([1, 1], [2, 2]);
            const res = createLinRead([1, 1], [2, 2]);
            expect(areLinReadsEqual(mergeLinReads(lr1, lr2), res)).toBe(true);
            expect(areLinReadsEqual(lr1, res)).toBe(true);
        });

        it("should merge if src ids is not set", () => {
            const lr1 = createLinRead([1, 1], [2, 2]);
            const lr2 = createLinRead();
            const res = createLinRead([1, 1], [2, 2]);
            expect(areLinReadsEqual(mergeLinReads(lr1, lr2), res)).toBe(true);
            expect(areLinReadsEqual(lr1, res)).toBe(true);
        });
    });

    describe("promisify", () => {
        it("should handle valid response in callback", async () => {
            const f = (_: number, cb: (err?: Error | null, res?: number) => void) => {
                cb(null, 2);
            };

            await expect(promisify(f, null)(1)).resolves.toBe(2);
        });

        it("should handle error in callback", async () => {
            const e = new Error();
            const f = (_: number, cb: (err?: Error | null, res?: number) => void) => {
                cb(e);
            };

            await expect(promisify(f, null)(1)).rejects.toBe(e);
        });

        it("should handle error if valid response is also present in callback", async () => {
            const e = new Error();
            const f = (_: number, cb: (err?: Error | null, res?: number) => void) => {
                cb(e, 2);
            };

            await expect(promisify(f, null)(1)).rejects.toBe(e);
        });

        it("should handle callback called without arguments", async () => {
            const f = (_: number, cb: (err?: Error | null, res?: number) => void) => {
                cb();
            };

            await expect(promisify(f, null)(1)).resolves.toBeUndefined();
        });

        it("should handle thisContext argument", async () => {
            const o = {
                val: 45,
            };

            await expect(promisify(fnAddThisVal, o)(5)).resolves.toEqual(50);
        });
    });

    describe("isAbortedError", () => {
        it("should return false for undefined and null", () => {
            expect(isAbortedError(undefined)).toBe(false);
            expect(isAbortedError(null)).toBe(false);
        });

        it("should return false for objects not having code property", () => {
            expect(isAbortedError(() => true)).toBe(false);
            expect(isAbortedError([1, 2, 3])).toBe(false);
            expect(isAbortedError({ a: 1, b: "b" })).toBe(false);
        });

        it("should return true for objects correct having correct code value", () => {
            expect(isAbortedError({ code: grpc.status.ABORTED })).toBe(true);
            expect(isAbortedError({ code: grpc.status.FAILED_PRECONDITION })).toBe(false);
            expect(isAbortedError({ code: grpc.status.OK })).toBe(false);
        });
    });

    describe("isConflictError", () => {
        it("should return false for undefined and null", () => {
            expect(isConflictError(undefined)).toBe(false);
            expect(isConflictError(null)).toBe(false);
        });

        it("should return false for objects not having code property", () => {
            expect(isConflictError(() => true)).toBe(false);
            expect(isConflictError([1, 2, 3])).toBe(false);
            expect(isConflictError({ a: 1, b: "b" })).toBe(false);
        });

        it("should return true for objects correct having correct code value", () => {
            expect(isConflictError({ code: grpc.status.ABORTED })).toBe(true);
            expect(isConflictError({ code: grpc.status.FAILED_PRECONDITION })).toBe(true);
            expect(isConflictError({ code: grpc.status.OK })).toBe(false);
        });
    });
});
