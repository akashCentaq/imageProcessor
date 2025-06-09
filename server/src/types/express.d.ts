import { User } from './index';

declare global {
  namespace Express {
    interface User extends import('./index').User {}
    interface Request {
      user?: User;
    }
  }
}