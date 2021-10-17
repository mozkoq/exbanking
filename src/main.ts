import {
  IExBanking,
} from './types';
import { ExBanking } from './exBanking';

export const init = (): IExBanking => new ExBanking();
