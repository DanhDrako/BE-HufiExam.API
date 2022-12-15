import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
// import { Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { Connection, Repository } from 'typeorm';
import { TaskRes } from './common/Classess';
import { PublicModules } from './common/PublicModules';
import { User } from './entities/user.entity';
import { User2UserMessage } from './entities/user2user-message.entity';
import * as Dics from "src/common/MyDictionary.json";

const getOptions = () => {
  if (String(process.env.ENV) === 'DEV')
    return {
      cors: {
        origin: '*',
        methods: ["GET", "POST"],
        credentials: true
      }
    };
  return {
    cors: {
      origin: [String(process.env.APP_FRONT_END)],
      methods: ["GET", "POST"],
      credentials: true
    },
    path: '/socket-mess',
  };
};

@WebSocketGateway(getOptions())
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  private userRepo: Repository<User> = null;
  private u2uMessReop: Repository<User2UserMessage> = null;
  private limitMessage = process.env.LIMIT_MESSAGE_FOR_EACH_USER;

  constructor(
    private readonly connection: Connection,
  ) {
    this.userRepo = this.connection.getRepository(User);
    this.u2uMessReop = this.connection.getRepository(User2UserMessage);
  }

  private insertUserOnline = async (userId: string) => {
    if (!userId) return;
    const find = await this.userRepo.findOne({ where: { id: userId } });
    if (!find) return;
    find.isOnline = true;
    this.userRepo.save(find);
  }

  private removeUserOnline = async (userId: string) => {
    if (!userId) return;
    const find = await this.userRepo.findOne({ where: { id: userId } });
    if (!find) return;
    find.isOnline = false;
    this.userRepo.save(find);
  }

  private inserMessageOnDB = async (args: any) => {
    let task: TaskRes = null;
    const { room, message, from, to } = args;
    const user1 = await this.userRepo.findOne({ where: { username: from } });
    const user2 = await this.userRepo.findOne({ where: { username: to } });
    if (!user1 || !user2) {
      task = PublicModules.fun_makeResError(null, Dics.USERNAME_NON_VALID);
      return task;
    }
    const newMess = this.u2uMessReop.create();
    newMess.room = room;
    newMess.message = message;
    newMess.user1 = user1;
    newMess.user2 = user2;
    const result = await this.u2uMessReop.save(newMess);

    // remove old message -> user1
    const user1MessCount = await this.u2uMessReop.count({ where: { user1: user1.id } });
    const user2MessCount = await this.u2uMessReop.count({ where: { user2: user2.id } });
    // remode user1 last record ?
    if (user1MessCount > Number.parseInt(this.limitMessage)) {
      const user1MessLast = await this.u2uMessReop.find({
        where: {
          user1: user1.id,
        },
        order: {
          createAt: 'ASC'
        },
        take: 1,
      });
      this.u2uMessReop.remove(user1MessLast);
    }
    // remode user2 last record ?
    if (user2MessCount > Number.parseInt(this.limitMessage)) {
      const user2MessLast = await this.u2uMessReop.find({
        where: {
          user2: user2.id,
        },
        order: {
          createAt: 'ASC'
        },
        take: 1,
      });
      this.u2uMessReop.remove(user2MessLast);
    }

    task = PublicModules.fun_makeResCreateSucc(result);

    this.server.to(user2.id).emit('notification', {
      room: room,
      message: message,
      time: result.createAt,
      user: { ...user1 }
    });
    return task;
  }

  async makeReadMessage(userNameFrom: string, room: string) {

    const finds = await this.u2uMessReop.find({
      where: {
        user2: userNameFrom,
        room: room,
        isRead: false,
      }
    });
    this.u2uMessReop.save(finds.map((v) => {
      return { ...v, isRead: true };
    }));
  }

  @WebSocketServer() server: Server;
  // private logger: Logger = new Logger('AppGateway');

  @SubscribeMessage('serverMakeReadMessage')
  handleMakeReadMessage(_client: Socket, args: any) {
    const { room, from } = args;
    this.makeReadMessage(from, room);
  }

  @SubscribeMessage('sendMessage')
  handleMessage(_client: Socket, args: any) {
    const { room, message, from, to } = args;
    if (!room || !message || !from || !to) return;

    this.inserMessageOnDB(args)
      .then((dataRes) => {
        if (dataRes.success)
          this.server.to(room).emit('message', { room: room, from: from, to: to, message: message, time: dataRes.result.createAt });
      });
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: Socket, args: any) {
    const { room, toId } = args;
    client.join(room);
    const { userId } = client.handshake.query;
    // make read message from db.
    this.makeReadMessage(toId, room);
    this.server.to(userId).emit('makeReadMessage', { ...args });
  }

  @SubscribeMessage('leaveRoom')
  hadleLeaveRoom(client: Socket, args: any) {
    const { room } = args;
    client.leave(room);
    const { userId } = client.handshake.query;
    this.server.to(userId).emit('onLeaveRoom', { args });
  }

  afterInit(_server: Server) {
    // this.logger.log('Init');
  }

  handleDisconnect(client: Socket) {
    const { userId } = client.handshake.query;
    if (userId) {
      client.leave(userId.toString());
      setTimeout(() => {
        this.removeUserOnline(userId.toString())
      }, 10000);
    }
  }

  handleConnection(client: Socket) {
    const { userId } = client.handshake.query;
    if (userId) {
      client.join(userId.toString());
      setTimeout(() => {
        this.insertUserOnline(userId.toString());
      }, 10000);
    }
  }
}
