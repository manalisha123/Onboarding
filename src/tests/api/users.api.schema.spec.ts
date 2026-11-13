
//npm install ajv
import { test, expect } from '../../fixtures/apiFixtures';
import Ajv from 'ajv';

const TOKEN = process.env.API_TOKEN!;
const AUTH_HEADER = { Authorization: `Bearer ${TOKEN}` };

// Setup AJV
const ajv = new Ajv();

// Define JSON schemas
const UserSchema = {
    "type": "object",
    "properties": {
        "id": {
            "type": "number"
        },
        "name": {
            "type": "string"
        },
        "email": {
            "type": "string"
        },
        "gender": {
            "type": "string"
        },
        "status": {
            "type": "string"
        }
    },
    "required": [
        "id",
        "name",
        "email",
        "gender",
        "status"
    ]
};

const UserProfileSchema = {
    type: "object",
    properties: {
        personalDetails: {
            type: "object",
            properties: {
                title: { type: "string", minLength: 1 },
                fullName: { type: "string", minLength: 1 },
                dateOfBirth: { type: "string", pattern: "^\\d{2}\\.\\d{2}\\.\\d{4}$" },
                placeOfBirth: { type: "string", minLength: 1 },
                maritalStatus: { type: "string", minLength: 1 },
                nationality: { type: "string", minLength: 1 },
            },
            required: ["title", "fullName", "dateOfBirth", "placeOfBirth", "maritalStatus", "nationality"],
            additionalProperties: false,
        },
        address: {
            type: "object",
            properties: {
                street: { type: "string", minLength: 1 },
                houseNumber: { type: "string", minLength: 1 },
                postalCode: { type: "string", minLength: 1 },
                city: { type: "string", minLength: 1 },
                country: { type: "string", minLength: 1 },
            },
            required: ["street", "houseNumber", "postalCode", "city", "country"],
            additionalProperties: false,
        },
        mobilePhoneNumber: { type: "string", pattern: "^\\+[1-9]\\d{1,14}$" },
        financialProfile: {
            type: "object",
            properties: {
                employmentStatus: { type: "string", minLength: 1 },
                savings: { type: "string", minLength: 1 },
            },
            required: ["employmentStatus", "savings"],
            additionalProperties: false,
        },
        taxInformation: {
            type: "object",
            properties: {
                country: { type: "string", minLength: 1 },
            },
            required: ["country"],
            additionalProperties: false,
        },
        bankDetails: {
            type: "object",
            properties: {
                iban: { type: "string", minLength: 1, maxLength: 34 },
            },
            required: ["iban"],
            additionalProperties: false,
        },
    },
    required: [
        "personalDetails",
        "address",
        "mobilePhoneNumber",
        "financialProfile",
        "taxInformation",
        "bankDetails",
    ],
    additionalProperties: false,
};

const UsersArraySchema = {
    type: "array",
    items: UserSchema,
};

test.describe("Schema Validation Tests", () => {

    test("user profile schema requires all profile fields", async () => {
        const profile = {
            personalDetails: {
                title: "Ms",
                fullName: "Example Person",
                dateOfBirth: "00.00.1900",
                placeOfBirth: "Example City, Example Country",
                maritalStatus: "single",
                nationality: "Example Country",
            },
            address: {
                street: "Example Street",
                houseNumber: "1",
                postalCode: "00000",
                city: "Example City",
                country: "Example Country",
            },
            mobilePhoneNumber: "+1234567890",
            financialProfile: {
                employmentStatus: "self-employed",
                savings: "savings",
            },
            taxInformation: {
                country: "Example Country",
            },
            bankDetails: {
                iban: "DE00000000000000000000",
            },
        };
        const validate = ajv.compile(UserProfileSchema);

        expect(validate(profile)).toBeTruthy();

        const missingIban = {
            ...profile,
            bankDetails: {},
        };
        expect(validate(missingIban)).toBeFalsy();
    });

    test("GET - single user schema validation", async ({ apiHelper }) => {
        const userData = {
            name: "Schema Test",
            email: `automation_${Date.now()}@open.com`,
            gender: "male",
            status: "active",
        };
        const createResponse = await apiHelper.post<{ id: number }>("/public/v2/users", userData, AUTH_HEADER);
        const userId = createResponse.body.id;

        const response = await apiHelper.get<Record<string, unknown>>(`/public/v2/users/${userId}`, AUTH_HEADER);
        expect(response.status).toBe(200);

        const validate = ajv.compile(UserSchema);
        const isValid = validate(response.body);

        if (!isValid) console.log("Errors:", validate.errors);
        expect(isValid).toBeTruthy();
    });

    test("GET - users array schema validation", async ({ apiHelper }) => {
        const response = await apiHelper.get<unknown[]>("/public/v2/users", AUTH_HEADER);
        expect(response.status).toBe(200);

        const validate = ajv.compile(UsersArraySchema);
        const isValid = validate(response.body);

        if (!isValid) console.log("Errors:", validate.errors);
        expect(isValid).toBeTruthy();
    });

    test("POST - response schema after creation", async ({ apiHelper }) => {
        const userData = {
            name: "Schema Post Test",
            email: `automation_${Date.now()}@open.com`,
            gender: "female",
            status: "active",
        };

        const response = await apiHelper.post<Record<string, unknown>>("/public/v2/users", userData, AUTH_HEADER);
        expect(response.status).toBe(201);

        const validate = ajv.compile(UserSchema);
        const isValid = validate(response.body);

        if (!isValid) console.log("Errors:", validate.errors);
        expect(isValid).toBeTruthy();
    });
});