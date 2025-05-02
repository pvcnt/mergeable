import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  schema: "schema.graphql",
  documents: "src/**/*.graphql",
  ignoreNoDocuments: true,
  generates: {
    "generated/gql/": {
      preset: "client",
      config: {
        documentMode: "string",
      },
    },
  },
};

export default config;
