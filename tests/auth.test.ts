import request from "supertest";
import http from "http";
import app from "../src/app"; // Ensure this path is correct
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../src/models/User";

dotenv.config();

let server: http.Server;

beforeAll(async () => {
    server = http.createServer(app.callback());
    await mongoose.connect(process.env.MONGO_TEST_URI as string);
    server.listen();
});

afterAll(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany({});
    }

    await mongoose.connection.close();
    server.close();
});



const testRegistration = async () => {
        const response = await request(server).post("/api/auth/register").send({
            username: "testuser",
            email: "test@example.com",
            password: "password123",
        });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("message", "User registered successfully");
};


const testInvalidRegistration = async () => {
    const res = await request(server).post("/api/auth/register").send({
        email: "invalid-email", // Invalid email
        password: "123", // Too short password
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("Invalid email format");
    expect(res.body.error).toContain("Password must be at least 6 characters");
};

const testValidRegistration = async () => {
    const res = await request(server).post("/api/auth/register").send({
        username: "testuserb",
        email: "testuserb@example.com",
        password: "securepassword",
    });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("User registered successfully");
};

const testInvalidLogin = async () => {
    const res = await request(server).post("/api/auth/login").send({
        email: "nonexistent@example.com",
        password: "wrongpassword",
    });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Invalid email or password.");
};

const testValidLogin = async () => {
    await request(server).post("/api/auth/register").send({
        username: "testuser1",
        email: "testuser.a@example.com",
        password: "securepassword",
    });

    const res = await request(server).post("/api/auth/login").send({
        email: "testuser.a@example.com",
        password: "securepassword",
    });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
};

describe("Auth Tests", () => {
    it("should return 201 for registration data", testRegistration);
    it("should return 400 for invalid registration data", testInvalidRegistration);
    it("should register a user successfully", testValidRegistration);
    it("should return 400 for login with invalid credentials", testInvalidLogin);
    it("should login a user successfully", testValidLogin);
});
