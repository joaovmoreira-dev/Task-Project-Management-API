import app from "../../src/app";
import request from "supertest";

export function getApi() {
    return request(app);
}