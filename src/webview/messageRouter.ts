export type Message = { command: string; [key: string]: any };
export type Handler = (msg: Message) => Promise<void> | void;

export class MessageRouter
{
  private handlers = new Map<string, Handler>();

  on(command: string, handler: Handler)
  {
    this.handlers.set(command, handler);
  }

  async handle(msg: Message)
  {
    if (!msg || !msg.command)
    {
      return;
    }

    const h = this.handlers.get(msg.command);
    if (h)
    {
      await Promise.resolve(h(msg));
    }
  }
}
