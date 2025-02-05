import * as YAML from "yamljs";

// const swaggerDocs = YAML.load("swagger/swagger.yml");

const mergeYamlFiles = () => {
    const baseSwagger = YAML.load("swagger/swagger.yml");

    const userPath = YAML.load("swagger/paths/users.yml");
    const authPath = YAML.load("swagger/paths/auth.yml");
    const productPath = YAML.load("swagger/paths/products.yml");

    return {
        ...baseSwagger,
        paths: {
            ...authPath,
            ...userPath,
            ...productPath,
        },
    };
};

const swaggerDocs = mergeYamlFiles();

export default swaggerDocs;
