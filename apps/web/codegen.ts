import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  schema: "https://docs.github.com/public/fpt/schema.docs.graphql",
  documents: "src/**/*.graphql",
  generates: {
    "generated/gql/": {
      preset: "client",
      config: {
        documentMode: "string",
        useTypeImports: true,
      },
    },
  },
};

export default config;
