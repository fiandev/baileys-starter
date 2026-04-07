import { type WASocket, type proto } from "baileys";

export interface Middleware {
  name: string;
  execute: (sock: WASocket, msg: proto.IWebMessageInfo) => Promise<boolean>;
  isAuth?: boolean;
  isGroupOnly?: boolean;
  isOnlyOwner?: boolean;
  isOnlyAdmin?: boolean;
}
