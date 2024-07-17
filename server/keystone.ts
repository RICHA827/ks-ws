import { config } from "@keystone-6/core";
import { lists, extendGraphqlSchema } from "./schema";
import { extendHttpServer } from "./websocket";
import { createAuth } from "@keystone-6/auth";
import { statelessSessions } from "@keystone-6/core/session";

const sessionSecret =
  process.env.SESSION_SECRET || "WERGFTHNBGVFDCFGHMNHDFVB123BGFVDCERTG345TRY";

export const { withAuth } = createAuth({
  listKey: "User",
  identityField: "email",
  secretField: "password",
  initFirstItem: {
    fields: ["name", "email", "password"],
  },
});

export const session = statelessSessions({
  maxAge: 60 * 60 * 24 * 30,
  secret: sessionSecret,
});

export default withAuth(
  config({
    db: {
      provider: "sqlite",
      url: "file:./keystone.db",
    },
    graphql: {
      extendGraphqlSchema,
    },
    lists,
    server: {
      port: 8000,
      extendHttpServer,
      cors: {
        origin: ["http://localhost:3000"],
        credentials: true,
      },
    },
    session,
  })
);
