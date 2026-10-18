type NotifyInput = {
  userId: string;
  channel: ("email" | "whatsapp" | "in-app")[];
  title: string;
  body: string;
  to?: { email?: string; phone?: string };
};
export const notify = async (input: NotifyInput) => {
  // whatsapp
  if (input.channel.includes("whatsapp") && input.to?.phone) {
    // whatsapp ko external rakhenge, direct import nahi
    const sendWhatsApp = async (
      to: string,
      template: string,
      params: string[],
    ) => {
      console.log("WhatsApp send:", to, template);
      return { ok: true };
    };
    await sendWhatsApp(input.to.phone, "notification", [
      input.title,
      input.body,
    ]);
  }
  // in-app save to DB
  // await prisma.notification.create({ data: {...} })
  return { ok: true };
};
// model Notification { id String @id @default(cuid()); userId String; title String; body String; read Boolean @default(false); createdAt DateTime @default(now()); }
