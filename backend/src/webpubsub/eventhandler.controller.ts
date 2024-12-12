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
export class EventController {
  private readonly logger = new Logger(EventController.name);

  constructor(private readonly webPubSubService: WebPubSubGatewayService) {}
  @Options()
  public options(@Res() res: Response): Response {
    return res
      .status(HttpStatus.OK)
      .header('WebHook-Allowed-Origin', '*')
      .send();
  }

  @Post('eventhandler')
  @HttpCode(HttpStatus.OK)
  public async handleEvents(
    @Req() req: Request,
    @Body() payload: any,
    @Res() res: Response,
  ): Promise<Response> {
    const eventType = req.headers['ce-type'] || payload?.type;

    this.logger.log(`Received event type: ${eventType}`);
    this.logger.log(`Payload: ${JSON.stringify(payload)}`);

    if (
      eventType === 'azure.webpubsub.user.message' ||
      payload.type === 'event'
    ) {
      const message = payload.data;
      this.logger.log(`Received message: ${JSON.stringify(message)}`);

      await this.webPubSubService.broadcastMessage(message);

      return res.send();
    }

    this.logger.warn(`Unhandled event type: ${eventType}`);
    return res.status(HttpStatus.BAD_REQUEST).send();
  }
}
