import { Injectable } from '@nestjs/common';
import { TaskRes } from 'src/common/Classess';
import { PublicModules } from 'src/common/PublicModules';
import { User } from 'src/entities/user.entity';
import { User2UserMessage } from 'src/entities/user2user-message.entity';
import { Connection, Repository } from 'typeorm';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class User2userMessageService {
  private u2uMessRepo: Repository<User2UserMessage> = null;

  constructor(
    private readonly connection: Connection,
    private readonly authService: AuthService,
  ) {
    this.u2uMessRepo = this.connection.getRepository(User2UserMessage);
  }

  async getChatByRoom(req: any, room: string) {
    let task: TaskRes = null;
    const isAuthClient = this.authService.checkAuthFromClient(req);
    if (!isAuthClient.success) return isAuthClient;
    const result = await this.u2uMessRepo.find({
      relations: ['user1', 'user2'],
      where: { room: room },
      skip: 0,
      take: 10,
      order: {
        createAt: 'DESC',
      },
    });
    task = PublicModules.fun_makeResListSucc(result.map((v) => {
      return Object.assign({}, {
        room: v.room,
        from: v.user1.username,
        to: v.user2.username,
        message: v.message,
        time: v.createAt,
      });
    }));

    return task;
  }

  async countMessagesUnRead(userNameFrom: string, userNameTo: string) {
    return await this.u2uMessRepo.count({
      where: {
        user1: userNameFrom,
        user2: userNameTo,
        isRead: false,
      },
    });
  }

  async getUserChatHistories(req: any) {
    let task: TaskRes = null;
    const isAuthClient = this.authService.checkAuthFromClient(req);
    if (!isAuthClient.success) return isAuthClient;
    const user = req.user;
    // only page = 1 & limit = 10;
    const finds = await this.u2uMessRepo.find({
      where: [
        { user1: user.id },
        { user2: user.id },
      ],
      order: {
        isRead: 'ASC',
        createAt: 'DESC',
      },
      relations: ['user1', 'user2'],
      take: 20,
    });

    const users = [];
    let count = 0;
    let v: User2UserMessage = null;
    let findRoom: any = null;
    let userTmp:User = null;
    for (let i = 0; i < finds.length; i++) {
      v = finds[i];
      count = 0;
      findRoom = users.find((f) => f.room === v.room);
      if (findRoom) {
        if (v.user1.username !== user.username && !v.isRead)
          findRoom.user.countUnRead += 1;
        continue;
      };
      if (v.user1.username !== user.username && !v.isRead)
        count = 1;
      userTmp = v.user1.username !== user.username ? v.user1 : v.user2;
      userTmp = PublicModules.fun_secureUser(userTmp);
      userTmp['countUnRead'] = count;
      users.push(Object.assign({}, {
        room: v.room,
        message: v.message,
        time: v.createAt,
        user: { ...userTmp },
      }));
    }

    let totalCountUnRead = 0;
    users.forEach(v => {
      totalCountUnRead += v.user.countUnRead;
    });

    task = PublicModules.fun_makeResListSucc(users, totalCountUnRead, null);

    return task;
  }
}
