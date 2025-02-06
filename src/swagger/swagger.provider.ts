import * as YAML from "yamljs";

// const swaggerDocs = YAML.load("swagger/swagger.yml");

const mergeYamlFiles = () => {
    const baseSwagger = YAML.load("swagger/swagger.yml");

    const userPath = YAML.load("swagger/paths/users.yml");
    const authPath = YAML.load("swagger/paths/auth.yml");
    const productPath = YAML.load("swagger/paths/products.yml");
    const bannerPath = YAML.load("swagger/paths/banners.yml");

    return {
        ...baseSwagger,
        paths: {
            ...authPath,
            ...userPath,
            ...productPath,
            ...bannerPath,
        },
    };
};

const swaggerDocs = mergeYamlFiles();

export default swaggerDocs;
