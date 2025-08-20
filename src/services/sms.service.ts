import { Injectable, Logger } from "@nestjs/common";
import axios from "axios";

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly apiUrl = process.env.SMS_ENDPINT ?? "https://api.sms.net.bd/sendsms";
  private readonly apiKey = process.env.SMS_API_KEY; // 🔐 keep it in .env

  async sendSms(to: string, msg: string): Promise<boolean> {
    try {
      const response = await axios.post(
        this.apiUrl,
        new URLSearchParams({
          api_key: this.apiKey!,
          msg,
          to,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        },
      );

      this.logger.log(`SMS sent: ${JSON.stringify(response.data)}`);

      // API success check (adjust according to sms.net.bd response format)
      return response.status === 200;
    } catch (error) {
      this.logger.error(`Failed to send SMS: ${error.message}`);
      return false;
    }
  }
}
