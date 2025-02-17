import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "../models/User";
import { faker } from "@faker-js/faker";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/task-manager";

const generateUsers = async () => {
    const users = [];

    for (let i = 0; i < 10; i++) {
        const username = faker.internet.displayName();
        const email = faker.internet.email();
        const password = await bcrypt.hash("123456", 10);
        const image = Math.random() > 0.5
            ? `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? "men" : "women"}/${i}.jpg`
            : "";
        users.push({ username, email, password, image });
    }

    return users;
};

const seedUsers = async () => {
    try {
        await mongoose.connect(MONGO_URI);

        console.log("Connected to database");

        await User.deleteMany(); // Clear existing users
        console.log("Existing users removed");

        const users = await generateUsers();
        await User.insertMany(users);
        console.log("Users seeded successfully");

        const admin = [
            {
                username: "Helmi Abdelfattah",
                email: "admin@gmail.com",
                password: await bcrypt.hash("123456", 10), // Hash password
                role:"admin",
                image: "https://randomuser.me/api/portraits/men/1.jpg",
            },
        ];

        await User.insertMany(admin);
        console.log("Users seeded successfully");

        mongoose.connection.close();
    } catch (error) {
        console.error("Error seeding users:", error);
        mongoose.connection.close();
    }
};

export default seedUsers;
