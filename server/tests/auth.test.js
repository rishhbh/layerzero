import request from 'supertest';
import app from '../src/app.js';
import User from '../src/models/User.js';
import bcrypt from "bcrypt";

describe('Authentication test', () => {
    const user = {
        name: "Test Name",
        email: "test@example.com",
        password: "testPassword@123"
    }

    test('POST /api/auth/user/register', async () => {
        const response = await request(app)
            .post('/api/auth/user/register')
            .send(user);

        expect(response.statusCode).toBe(201);
    });

    test('POST /api/auth/user/login', async () => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);

        await User.create({
            name: user.name,
            email: user.email,
            password: hashedPassword
        });

        const response = await request(app)
            .post('/api/auth/user/login')
            .send({
                email: "test@example.com",
                password: "testPassword@123"
            });

        expect(response.statusCode).toBe(200);
        expect(response.headers["set-cookie"]).toBeDefined();
    });

    test('POST /api/auth/user/logout', async () => {
        const agent = request.agent(app);

        await agent
            .post('/api/auth/user/register')
            .send(user);

        const loginResponse = await agent
            .post('/api/auth/user/login')
            .send({
                email: "test@example.com",
                password: "testPassword@123"
            });

        expect(loginResponse.statusCode).toBe(200);
        expect(loginResponse.headers["set-cookie"]).toBeDefined();

        const logoutResponse = await agent
            .post('/api/auth/user/logout');

        expect(logoutResponse.statusCode).toBe(200);
    });
});