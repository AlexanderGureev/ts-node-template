import * as Boom from "boom";
import { Request, ResponseToolkit } from "hapi";
import * as JWT from "jsonwebtoken";
import { v4 } from "uuid";
import { config } from "../../config";
import { IUser, IUserController, IUserService } from "../../interfaces";

export class UserController implements IUserController {
  constructor(public userService: IUserService) {}
  public async register(req: any, h: ResponseToolkit) {
    try {
      const user = await this.userService.register(req.payload as IUser);
      const token = await this.createSession(req, user);

      return h
        .response(user)
        .code(201)
        .state("token", token);
    } catch (error) {
      let err: Boom;
      if (error.name && error.name === "MongoError") {
        err = Boom.forbidden("User with such data already exists.");
      }
      return err || error;
    }
  }
  public async login(req: Request, h: ResponseToolkit) {
    try {
      const user = await this.userService.login(req.payload as object);
      const token = await this.createSession(req, user);
      return h
        .response(user)
        .code(201)
        .state("token", token);
    } catch (error) {
      console.log(error);
      return error;
    }
  }
  public async logout(req: Request, h: ResponseToolkit) {
    try {
      await this.deleteSession(req);
      return h
        .response()
        .unstate("token")
        .code(204);
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  private async deleteSession(req) {
    await req.redis.delAsync(req.auth.credentials.id);
  }
  private async createSession(req, { username, _id }) {
    const session = {
      username,
      id: v4(),
      userId: _id
    };
    const token = JWT.sign(session, config.JWT_SECRET);
    await req.redis.setAsync(
      `${config.SESSION_PREFIX}:${session.id}`,
      JSON.stringify(token)
    );
    return token;
  }
}