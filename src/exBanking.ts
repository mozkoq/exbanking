import {
  BankingError, isValidAmount,
  isValidCurrency,
  isValidUsername, NotEnoughMoney,
  Ok, ReceiverDoesNotExist, SenderDoesNotExist, success,
  User, UserAlreadyExists,
  UserDoesNotExist,
  Username,
  WrongArguments,
} from './types';

export class ExBanking {
  #state: Map<Username, User> = new Map();

  #depositWithNegativeValue(username: string, amount: number, currency: string): (Ok & { newBalance: number } | BankingError) {
    if (!isValidUsername(username) || !isValidCurrency(currency)) return new WrongArguments();
    const user = this.#state.get(username);
    if (!user) return new UserDoesNotExist();


    const userWallet = user.balance.find((balance) => balance.currency === currency);
    if (userWallet) {
      this.#state.set(username, {
        ...user,
        balance: user.balance.map((balance) => currency === balance.currency ? {
          ...balance,
          amount: amount + balance.amount,
        } : { ...balance }),
      });
    } else {
      this.#state.set(username, { ...user, balance: [...user.balance, { amount, currency }] });
    }
    const balance = this.getBalance(username, currency);
    if (balance instanceof Error) return balance;

    return { ...success, newBalance: balance.balance };
  };


  send(fromUsername: string, toUsername: string, amount: number, currency: string): (Ok & { fromUsernameBalance: number, toUsernameBalance: number } | BankingError) {
    const withdrawResult = this.withdraw(fromUsername, amount, currency);
    if (withdrawResult instanceof UserDoesNotExist) return new SenderDoesNotExist();
    if (withdrawResult instanceof Error) return withdrawResult as Error;

    const depositResult = this.deposit(toUsername, amount, currency);
    if (depositResult instanceof UserDoesNotExist) return new ReceiverDoesNotExist();
    if (depositResult instanceof Error) return depositResult as Error;


    const fromUsernameBalance = this.getBalance(fromUsername, currency);
    const toUsernameBalance = this.getBalance(toUsername, currency);

    if (fromUsernameBalance instanceof Error) return fromUsernameBalance as Error;
    if (toUsernameBalance instanceof Error) return toUsernameBalance as Error;

    return {
      ...success,
      fromUsernameBalance: fromUsernameBalance.balance,
      toUsernameBalance: toUsernameBalance.balance,
    };
  };

  getBalance(username: string, currency: string): (Ok & { balance: number } | BankingError) {
    if (!isValidUsername(username) || !isValidCurrency(currency)) return new WrongArguments();

    const user = this.#state.get(username);
    if (!user) return new UserDoesNotExist();

    const balance = user.balance.find((balance) => balance.currency === currency);

    return {
      ...success,
      balance: balance?.amount ?? 0,
    };
  };

  withdraw(username: string, amount: number, currency: string): (Ok & { newBalance: number } | BankingError) {
    if (!isValidUsername(username) || !isValidCurrency(currency) || !isValidAmount(amount)) return new WrongArguments;

    const userBalance = this.getBalance(username, currency);
    if (userBalance instanceof Error) return userBalance as Error;
    if (userBalance.balance - amount < 0) return new NotEnoughMoney;

    return this.#depositWithNegativeValue(username, -amount, currency);
  };


  deposit(username: string, amount: number, currency: string): (Ok & { newBalance: number } | BankingError) {
    if (!isValidAmount(amount)) return new WrongArguments();

    return this.#depositWithNegativeValue(username, amount, currency);
  };

  createUser(username: string): Ok | BankingError {
    if (!isValidUsername(username)) return new WrongArguments();
    if (this.#state.get(username)) return new UserAlreadyExists();

    this.#state.set(username, { balance: [] });

    return success;
  };
}
