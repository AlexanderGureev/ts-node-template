import * as Hapi from "@hapi/hapi";
import { IConfig } from "../../app/interfaces/common.interface";
import { config } from "../../config";

const validate = async function(decoded, request) {
  try {
    const session = await request.redis.getAsync(
      `${config.SESSION_PREFIX}:${decoded.id}`
    );
    if (!session) {
      return { isValid: false };
    }
    return {
      isValid: true,
      credentials: { ...decoded }
    };
  } catch (error) {
    console.log(error);
    return { isValid: false };
  }
};

export const auth = {
  name: "auth",
  version: "1.0.0",
  register: async (server: Hapi.Server, config: IConfig) => {
    await server.register(require("hapi-auth-jwt2"));

    server.auth.strategy("jwt", "jwt", {
      key: config.JWT_SECRET,
      validate,
      verifyOptions: { algorithms: ["HS256"] }
    });

    server.auth.default("jwt");
  }
};
