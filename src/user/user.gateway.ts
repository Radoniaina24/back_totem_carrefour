import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Logger } from '@nestjs/common';
import { User } from './schemas/user.schema';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class UserGateway implements OnGatewayInit {
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('UserGateway');

  afterInit(server: Server) {
    this.logger.log('WebSocket initialisé pour les utilisateurs');
  }

  // Méthodes pour émettre des événements

  userCreated(user: User) {
    this.server.emit('userCreated', user);
  }

  userUpdated(user: User) {
    this.server.emit('userUpdated', user);
  }

  userDeleted(userId: string) {
    this.server.emit('userDeleted', userId);
  }
}
