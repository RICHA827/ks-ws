import { list } from "@keystone-6/core";
import { text, password } from "@keystone-6/core/fields";
import { allowAll } from "@keystone-6/core/access";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { mergeSchemas } from "@graphql-tools/schema";
import { PubSub } from "graphql-subscriptions";

declare global {
  var graphqlSubscriptionPubSub: PubSub | undefined;
}

export const pubSub = global.graphqlSubscriptionPubSub || new PubSub();
globalThis.graphqlSubscriptionPubSub = pubSub;

export const lists = {
  User: list({
    access: allowAll,
    fields: {
      name: text({ validation: { isRequired: true } }),
      email: text({ validation: { isRequired: true }, isIndexed: "unique" }),
      password: password({ validation: { isRequired: true } }),
    },
  }),
};

const customSchema = makeExecutableSchema({
  typeDefs: `
    type Subscription {
      time: Time
    }
    type Time {
      iso: String
    }
  `,
  resolvers: {
    Subscription: {
      time: {
        subscribe: () => pubSub.asyncIterator(["TIME"]),
      },
    },
  },
});

export const extendGraphqlSchema = (schema) => {
  return mergeSchemas({
    schemas: [schema, customSchema],
  });
};
