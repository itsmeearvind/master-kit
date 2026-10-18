
const GRAPH = 'https://graph.facebook.com/v20.0';
export const sendWhatsApp = async (to: string, template: string, params: string[]) => {
  const res = await fetch(`${GRAPH}/${process.env.WHATSAPP_PHONE_ID}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ messaging_product: 'whatsapp', to, type: 'template', template: { name: template, language: { code: 'en' }, components: [{ type: 'body', parameters: params.map(t=>({type:'text', text:t})) }] } })
  });
  if(!res.ok) throw new Error(await res.text());
  return res.json();
};
export const verifyWebhook = (mode: string, token: string, challenge: string) => {
  if(mode==='subscribe' && token===process.env.WHATSAPP_VERIFY_TOKEN) return challenge;
  throw new Error('Webhook verify failed');
};
// model WhatsappLog { id String @id @default(cuid()); to String; template String; status String; createdAt DateTime @default(now()); }
