import * as Hapi from "hapi";
import * as HapiSwagger from "hapi-swagger";
import * as Inert from "inert";
import * as Vision from "vision";
import { IConfig } from "../../interfaces";

export const swagger = {
  name: "swagger",
  version: "1.0.0",
  register: async (server: Hapi.Server, options?: IConfig) => {
    const swaggerOptions = {
      documentationPath: "/",
      grouping: "tags",
      sortTags: "name",
      sortEndpoints: "ordered",
      tags: [
        {
          name: "auth",
          description: "authentication and authorization"
        },
        {
          name: "todos",
          description: "actions on todos"
        }
      ],
      info: {
        title: "API Documentation",
        version: options.API_VERSION
      }
    };

    await server.register([
      Inert,
      Vision,
      {
        plugin: HapiSwagger,
        options: swaggerOptions
      }
    ]);
  }
};