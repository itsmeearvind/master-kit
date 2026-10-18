
type NotifyInput = { userId: string; channel: ('email'|'whatsapp'|'in-app')[]; title: string; body: string; to?: { email?: string; phone?: string } };
export const notify = async (input: NotifyInput) => {
  // whatsapp
  if(input.channel.includes('whatsapp') && input.to?.phone){
    const { sendWhatsApp } = await import('@maasters/whatsapp');
    await sendWhatsApp(input.to.phone, 'notification', [input.title, input.body]);
  }
  // in-app save to DB
  // await prisma.notification.create({ data: {...} })
  return { ok: true };
};
// model Notification { id String @id @default(cuid()); userId String; title String; body String; read Boolean @default(false); createdAt DateTime @default(now()); }
