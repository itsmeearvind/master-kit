
export class PushChannel {
  async send(fcmToken: string, title: string, body: string, data?: any) {
    console.log(`[PUSH] Token:${fcmToken.slice(0,10)}... Title:${title}`);
    return { ok: true, dev: true };
  }
}
