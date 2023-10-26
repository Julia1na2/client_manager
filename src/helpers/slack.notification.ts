import axios from 'axios';
import { config } from '../config/config';
import logger from '../utils/logger';

export class SlackCloudNotificationAlert {
  static send(params: { message: string }) {
    return new Promise(async (resolve, reject) => {
      try {
        let response = true;

        if (!["development", "production"].includes(config.nodeEnvironment!)) return resolve(response);

        // * Build slack request payload
        const data = JSON.stringify({
          text: `\`API CLIENT MANAGER MS\`\n\`\`\`Error: ${params.message}\`\`\``,
        });
        const url = `${config.backendErrorSlackWebhook}`;

        // * Send slack alert
        response = await axios.post(url, data);

        return resolve(response);
      } catch (error) {
        logger.error(`An error occured while triggering a slart alert: ${params}`);
        return resolve(false);
      }
    });
  }
}
