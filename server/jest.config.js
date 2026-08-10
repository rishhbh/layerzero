import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

export default {
    testEnvironment: "node",
    setupFilesAfterEnv: ["<rootDir>/tests/setup.js"]
};