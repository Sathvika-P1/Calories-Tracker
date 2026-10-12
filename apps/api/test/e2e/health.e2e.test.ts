import { afterAll, beforeAll, describe, expect, it } from "vitest";
import supertest from "supertest";
import { buildApp } from "../../src/app.js";
import type { FastifyInstance } from "fastify";

describe("Health API (e2e)", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("GET /health responds with 200 and ok status", async () => {
    const response = await supertest(app.server).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });
});
