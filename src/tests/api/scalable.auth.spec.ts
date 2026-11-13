
import { test, expect } from '../../fixtures/apiFixtures';


// OAuth 2.0 config — use your OAuth provider
const OAUTH_CONFIG = {
    tokenURL: "https://test.api.scalable.com/v1/security/oauth2/token",  // example
    clientId: process.env.OAUTH_CLIENT_ID!,
    clientSecret: process.env.OAUTH_CLIENT_SECRET!,
    grantType: process.env.GRANT_TYPE!,
};

let tokenID: string;

test.beforeEach("POST - get Oauth token", async ({ request }) => {

    let response = await request.post(OAUTH_CONFIG.tokenURL, {
        form: {
            grant_type: OAUTH_CONFIG.grantType,
            client_id: OAUTH_CONFIG.clientId,
            client_secret: OAUTH_CONFIG.clientSecret,
        },
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.access_token).toBeDefined();
    expect(body.token_type).toBe("Bearer");
    expect(body.expires_in).toBeGreaterThan(0);

    console.log("Access Token:", body.access_token);
    tokenID = body.access_token;
});

test('get flight details', async ({ request }) => {

    let scalable_baseURL = 'https://test.api.scalable.com';
    let location_endPoint = '/v1/reference-data/locations';

    let queryParam = {
        subType: "CITY,AIRPORT",
        keyword: "MUC",
        countryCode: "DE"
    }

    // /v1/reference-data/locations?subType=CITY,AIRPORT&keyword=MUC&countryCode=DE
    let locationResponse = await request.get(`${scalable_baseURL}${location_endPoint}`, {
        params: queryParam,
        headers: {
            Authorization: `Bearer ${tokenID}`
        },
    });

    console.log(locationResponse);

    console.log(await locationResponse.json());


})
