const WebSocket = require('ws');
const { WebPubSubServiceClient } = require('@azure/web-pubsub');

async function consume() {
  const hub = 'test';
  const connectionString = process.env.WEB_PUBSUB_CONNECTION_STRING;

  try {
    const service = new WebPubSubServiceClient(connectionString, hub);
    const token = await service.getClientAccessToken();
    console.log('client access token: ', token);
    const ws = new WebSocket(token.url);

    ws.on('open', () =>
      console.log('Connected to WebPubSub hub as a consumer'),
    );
    ws.on('message', (data) => console.log('Message received: %s', data));
    ws.on('error', (err) => console.error('WebSocket error:', err));
    ws.on('close', (code, reason) => {
      console.log(
        `WebSocket connection closed. Code: ${code}, Reason: ${reason || 'N/A'}`,
      );
    });
  } catch (error) {
    console.error('Error connecting to WebPubSub:', error);
  }
}

module.exports = { consume };
