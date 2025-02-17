import request from "supertest";
import mongoose from "mongoose";
import server from "../src/app";
import Task from "../src/models/Task";
import User from "../src/models/User";
import jwt from "jsonwebtoken";

let token: string;

beforeAll(async () => {
    await User.deleteMany({});
    await Task.deleteMany({});

    // Register & login a test user
    const userRes = await request(server).post("/api/auth/register").send({
        username: "testuser",
        email: "test@example.com",
        password: "password123",
    });

    token = userRes.body.token;
});

afterAll(async () => {
    await mongoose.connection.close();
    server.close();
});

describe("Task API", () => {
    let taskId: string;

    test("Should create a task", async () => {
        const res = await request(server)
            .post("/api/tasks")
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "Test Task",
                description: "This is a test task",
            });

        expect(res.status).toBe(201);
        expect(res.body.task).toHaveProperty("_id");
        taskId = res.body.task._id;
    });

    test("Should get all tasks", async () => {
        const res = await request(server)
            .get("/api/tasks")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.tasks.length).toBeGreaterThan(0);
    });

    test("Should get task by ID", async () => {
        const res = await request(server)
            .get(`/api/tasks/${taskId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.task._id).toBe(taskId);
    });

    test("Should update task", async () => {
        const res = await request(server)
            .put(`/api/tasks/${taskId}`)
            .set("Authorization", `Bearer ${token}`)
            .send({ status: "completed" });

        expect(res.status).toBe(200);
        expect(res.body.task.status).toBe("completed");
    });

    test("Should delete task", async () => {
        const res = await request(server)
            .delete(`/api/tasks/${taskId}`)
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(200);
    });
});
