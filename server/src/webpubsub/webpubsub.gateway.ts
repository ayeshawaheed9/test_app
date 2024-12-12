import { Injectable, Logger } from '@nestjs/common';
import { WebPubSubServiceClient, AzureKeyCredential } from '@azure/web-pubsub';
@Injectable()
export class WebPubSubGatewayService {
  private readonly serviceClient: WebPubSubServiceClient;
  private readonly logger = new Logger(WebPubSubGatewayService.name);
  private readonly groupName = 'group';

  constructor() {
    const endpoint = 'https://pub-sub-web.webpubsub.azure.com';
    const accessKey =
      '1gU0mQ5pADOAar01v4kGiIxQJj2q4BeryO5AWjMUiGIgwtPCQMeGJQQJ99AKAC4f1cMXJ3w3AAAAAWPSARd9';
    const hubName = 'test';
    const key = new AzureKeyCredential(accessKey);
    this.serviceClient = new WebPubSubServiceClient(endpoint, key, hubName);
  }

  async generateAccessToken(): Promise<string> {
    try {
      const token = await this.serviceClient.getClientAccessToken({
        roles: [
          `webpubsub.sendToGroup.${this.groupName}`,
          `webpubsub.joinLeaveGroup.${this.groupName}`,
        ],
      });
      return token.url;
    } catch (error) {
      this.logger.error(
        `Failed to generate token: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async broadcastMessage(message: any) {
    try {
      await this.serviceClient.sendToAll(message);
      this.logger.log(`Broadcasted message: ${message}`);
    } catch (error) {
      this.logger.error(
        `Failed to broadcast message: ${error.message}`,
        error.stack,
      );
    }
  }
}
