import { NotificationTokenProps } from "@modules/accounts/types";
import Expo, { ExpoPushMessage } from "expo-server-sdk";
import { injectable } from "tsyringe";

interface IRequest {
  notificationTokens: NotificationTokenProps[];
  notificationTitle: string;
  notificationBody: string;
}

@injectable()
export class SendNotificationUseCase {
  async execute({
    notificationTokens,
    notificationTitle,
    notificationBody,
  }: IRequest) {
    const expo = new Expo();

    const pushTokens: string[] = notificationTokens.reduce(
      (acc, tokenProps) => {
        acc.push(tokenProps.token);
        return acc;
      },
      []
    );

    const verifyIfIsValidToken = () => {
      // eslint-disable-next-line array-callback-return
      pushTokens.map((token) => {
        if (!Expo.isExpoPushToken(token)) {
          throw new Error(`Push token ${token} is not a valid Expo push token`);
        }
      });
    };

    verifyIfIsValidToken();

    const chunkArray = expo.chunkPushNotifications([
      {
        to: pushTokens,
        sound: "default",
        title: notificationTitle,
        body: notificationBody,
      },
    ]);

    const sendChunks = async (chunks: ExpoPushMessage[][]) => {
      try {
        await Promise.all(
          chunks.map(async (chunk) => {
            await expo.sendPushNotificationsAsync(chunk);
          })
        );
      } catch (error) {
        throw new Error(`Error sending notification: ${error}`);
      }
    };

    sendChunks(chunkArray);
  }
}
