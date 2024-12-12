import {
  Controller,
  Post,
  Body,
  Logger,
  Res,
  Req,
  Options,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { WebPubSubGatewayService } from './webpubsub.gateway';
import { Response, Request } from 'express';
@Controller('/api/webpubsub')
export class WebPubSubController {
  private readonly logger = new Logger(WebPubSubController.name);

  constructor(private readonly webPubSubService: WebPubSubGatewayService) {}

  @Post('/negotiate')
  async negotiate() {
    try {
      const token = await this.webPubSubService.generateAccessToken();
      return { success: true, url: token };
    } catch (error) {
      this.logger.error(
        `Token negotiation failed: ${error.message}`,
        error.stack,
      );
      return { success: false, message: 'Failed to negotiate token' };
    }
  }

  @Post('/broadcast')
  async broadcast(@Body('message') message: string) {
    try {
      await this.webPubSubService.broadcastMessage(message);
      return { success: true, message: 'Message broadcasted successfully' };
    } catch (error) {
      this.logger.error(`Broadcast failed: ${error.message}`, error.stack);
      return { success: false, message: 'Failed to broadcast message' };
    }
  }
}
