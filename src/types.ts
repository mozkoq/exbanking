export type BankingError = Error |
  WrongArguments |
  UserAlreadyExists |
  UserDoesNotExist |
  NotEnoughMoney |
  SenderDoesNotExist |
  ReceiverDoesNotExist;
export type Ok = { success: true };
export type Balance = { currency: string, amount: number }[];

export type User = {
  balance: Balance
}
export type Username = string;

export const success: Ok = { success: true };
export const isValidUsername = (username: unknown): boolean => typeof username === 'string';
export const isValidCurrency = (currency: unknown): boolean => typeof currency === 'string';
export const isValidAmount = (amount: unknown): boolean => typeof amount === 'number' && isFinite(amount) && Math.sign(amount) === 1;
export const isError = (value) =>  value instanceof Error;

export class WrongArguments extends Error {

}

export class UserAlreadyExists extends Error {

}

export class UserDoesNotExist extends Error {

}

export class NotEnoughMoney extends Error {

}

export class SenderDoesNotExist extends Error {

}

export class ReceiverDoesNotExist extends Error {

}
