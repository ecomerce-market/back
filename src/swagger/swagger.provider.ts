import * as swaggerJSDoc from "swagger-jsdoc";

const swaggerOptions: swaggerJSDoc.Options = {
    apis: ["src/**/*.router.ts"],
    definition: {
        info: {
            title: "ECommerce API Documentation",
            version: "1.0.0",
            description: "API Documentation for ECommerce Application",
        },
    },
};

const openapiSpecification = swaggerJSDoc(swaggerOptions);

export default openapiSpecification;