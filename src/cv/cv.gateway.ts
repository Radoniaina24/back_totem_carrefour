import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Logger } from '@nestjs/common';
import { CVData } from './schema/cv.schema';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class CvGateway implements OnGatewayInit {
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('CvGateway');

  afterInit(server: Server) {
    this.logger.log('WebSocket initialisé');
  }
  // Méthodes pour émettre des événements
  cvCreated(task: CVData) {
    this.server.emit('cvCreated', task);
  }
}
