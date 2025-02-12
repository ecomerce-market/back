import * as YAML from "yamljs";

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

    return {
        ...baseSwagger,
        paths: {
            ...authPath,
            ...userPath,
            ...productPath,
            ...productProductIdPath,
            ...bannerPath,
        },
    };
};

const swaggerDocs = mergeYamlFiles();

export default swaggerDocs;
