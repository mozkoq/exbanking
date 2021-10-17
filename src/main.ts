import {
  BankingError, ExBanking, isError,
  isValidAmount,
  isValidCurrency,
  isValidUsername, NotEnoughMoney, Ok, ReceiverDoesNotExist, SenderDoesNotExist,
  success, User,
  UserAlreadyExists,
  UserDoesNotExist, Username,
  WrongArguments,
} from './types';

export const init = (): ExBanking => {
  const state: Map<Username, User> = new Map();

  const depositWithNegativeValue = (username: string, amount: number, currency: string): (Ok & { newBalance: number } | BankingError) => {
    if (!isValidUsername(username) || !isValidCurrency(currency)) return new WrongArguments();
    const user = state.get(username);
    if (!user) return new UserDoesNotExist();


    const userWallet = user.balance.find((balance) => balance.currency === currency);
    if (userWallet) {
      state.set(username, {
        ...user,
        balance: user.balance.map((balance) => currency === balance.currency ? {
          ...balance,
          amount: amount + balance.amount,
        } : { ...balance }),
      });
    } else {
      state.set(username, { ...user, balance: [...user.balance, { amount, currency }] });
    }
    const balance = getBalance(username, currency);
    if (isError(balance)) return balance as Error;

    return { ...success, newBalance: (balance as Ok & { balance: number }).balance };
  };


  const send = (fromUsername: string, toUsername: string, amount: number, currency: string): (Ok & { fromUsernameBalance: number, toUsernameBalance: number } | BankingError) => {
    const withdrawResult = withdraw(fromUsername, amount, currency);
    if (withdrawResult instanceof UserDoesNotExist) return new SenderDoesNotExist();
    if (withdrawResult instanceof Error) return withdrawResult as Error;

    const depositResult = deposit(toUsername, amount, currency);
    if (depositResult instanceof UserDoesNotExist) return new ReceiverDoesNotExist();
    if (depositResult instanceof Error) return depositResult as Error;


    const fromUsernameBalance = getBalance(fromUsername, currency);
    const toUsernameBalance = getBalance(toUsername, currency);

    if (fromUsernameBalance instanceof Error) return fromUsernameBalance as Error;
    if (toUsernameBalance instanceof Error) return toUsernameBalance as Error;

    return {
      ...success,
      fromUsernameBalance: fromUsernameBalance.balance,
      toUsernameBalance: toUsernameBalance.balance,
    };
  };

  const getBalance = (username: string, currency: string): (Ok & { balance: number } | BankingError) => {
    if (!isValidUsername(username) || !isValidCurrency(currency)) return new WrongArguments();

    const user = state.get(username);
    if (!user) return new UserDoesNotExist();

    const balance = user.balance.find((balance) => balance.currency === currency);

    return {
      ...success,
      balance: balance?.amount ?? 0,
    };
  };

  const withdraw = (username: string, amount: number, currency: string): (Ok & { newBalance: number } | BankingError) => {
    if (!isValidUsername(username) || !isValidCurrency(currency) || !isValidAmount(amount)) return new WrongArguments;

    const userBalance = getBalance(username, currency);
    if (userBalance instanceof Error) return userBalance as Error;
    if (userBalance.balance - amount < 0) return new NotEnoughMoney;

    return depositWithNegativeValue(username, -amount, currency);
  };


  const deposit = (username: string, amount: number, currency: string): (Ok & { newBalance: number } | BankingError) => {
    if (!isValidAmount(amount)) return new WrongArguments();

    return depositWithNegativeValue(username, amount, currency);
  };

  const createUser = (username: string): Ok | BankingError => {
    if (!isValidUsername(username)) return new WrongArguments();
    if (state.get(username)) return new UserAlreadyExists();

    state.set(username, { balance: [] });

    return success;
  };

  return { send, getBalance, createUser, withdraw, deposit };
};

// Spended 3h 16 min 15 oct
// Spended 1:20 sun 17 oct
//  4:36 total spended

