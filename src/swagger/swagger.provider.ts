import * as YAML from "yamljs";
import * as swaggerJSDoc from "swagger-jsdoc";
// const swaggerDocs = YAML.load("swagger/swagger.yml");

const mergeYamlFiles = () => {
    const baseSwagger = YAML.load("swagger/swagger.yml");

    const PREFIX = "swagger/paths/";

    const userPath = YAML.load(PREFIX + "users/users.yml");
    const authPath = YAML.load(PREFIX + "/auth/auth.yml");
    const productPath = YAML.load(PREFIX + "/products/products.yml");
    const productProductIdPath = YAML.load(
        PREFIX + "/products/productId/productId.yml"
    );
    const bannerPath = YAML.load(PREFIX + "/banners/banners.yml");
    const orderPath = YAML.load(PREFIX + "/orders/orders.yml");
    const orderOrderIdPath = YAML.load(PREFIX + "/orders/orderId/orderId.yml");
    const accountPath = YAML.load(PREFIX + "/accounts/accounts.yml");

    return {
        ...baseSwagger,
        paths: {
            ...authPath,
            ...userPath,
            ...productPath,
            ...productProductIdPath,
            ...bannerPath,
            ...orderPath,
            ...orderOrderIdPath,
            ...accountPath,
        },
    };
};

const swaggerDocs = mergeYamlFiles();
const options: swaggerJSDoc.Options = {
    swaggerDefinition: swaggerDocs,
    apis: ["src/router/**/*.route.ts"],
};

export const swaggerSpec = swaggerJSDoc(options);
export default swaggerDocs;
