import WebSocket from 'ws';
import { WebPubSubServiceClient } from '@azure/web-pubsub';

async function consume1() {
  const acknowledgmentPayload = {
    type: 'user',
    event: 'message',
    data: 'acknowledgment message',
  };
  const hub = 'test';
  const connectionString =
    'Endpoint=https://pub-sub-web.webpubsub.azure.com;AccessKey=1gU0mQ5pADOAar01v4kGiIxQJj2q4BeryO5AWjMUiGIgwtPCQMeGJQQJ99AKAC4f1cMXJ3w3AAAAAWPSARd9;Version=1.0;';

  try {
    const service = new WebPubSubServiceClient(connectionString, hub);
    const token = await service.getClientAccessToken();
    const ws = new WebSocket(token.url);

    ws.on('open', () => {
      console.log('Connected to Azure Web PubSub Hub');
    });

    ws.on('message', (message) => {
      console.log('Message received from server:', message);
      ws.send(JSON.stringify(acknowledgmentPayload), (err) => {
        if (err) {
          console.error('Error sending acknowledgment:', err);
        } else {
          console.log('Acknowledgment sent to server:', acknowledgmentPayload);

          // Wait for server's acknowledgment or a small delay before closing
          ws.on('message', (serverMessage) => {
            console.log('Server acknowledged the ack:', serverMessage);
            // Now close the connection after receiving the server's response
            ws.close(1000, 'Closing after ack');
          });

          // In case the server doesn't send a response, we can close the connection after a timeout
          setTimeout(() => {
            console.log('Timeout reached, closing the connection.');
            ws.close(1000, 'Closing after ack');
          }, 5000); // 5 seconds timeout (adjustable)
        }
      });
    });

    ws.on('error', (err) => console.error('WebSocket error:', err));

    ws.on('close', (code, reason) => {
      console.log(
        `WebSocket connection closed. Code: ${code}, Reason: ${reason}`,
      );
    });
  } catch (error) {
    console.error('Error connecting to WebPubSub:', error);
  }
}

export { consume1 }; // Use export statement for module export
