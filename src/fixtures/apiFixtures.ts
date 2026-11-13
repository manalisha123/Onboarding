import { test as baseTest } from "@playwright/test";
import { ApiHelper } from "../api/ApiHelper";

type ApiFixtures = {
    apiHelper: ApiHelper;
};

export const test = baseTest.extend<ApiFixtures>({

    apiHelper: async ({ request }, use) => {
        const apiHelper = new ApiHelper(
            request,
            process.env.API_BASE_URL || "https://de.scalable.capital/auth/graphql"
            
        );
        await use(apiHelper);
    },
});

export { expect } from "@playwright/test";