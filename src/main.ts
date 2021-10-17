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


  const state: Map<Username, User> = new Map();
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

    // we don't have error with noCurrency balance and no text in task about this case.
    // Currencies should be created automatically (if needed).
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
// const exBanking = init();

// // Amazing TDD
// console.log(exBanking.getBalance('user1', 'EUR'))
// console.log(exBanking.createUser('user1'))
// console.log(exBanking.createUser('user1'))
// console.log(exBanking.createUser('user2'))
// console.log(exBanking.getBalance('user1', 'EUR'))
// console.log(exBanking.deposit('user1', 1, 'EUR'))
// console.log(exBanking.withdraw('user1', 2, 'EUR'))
// console.log(exBanking.send('user1', 'user2', 1, 'EUR'))
// console.log(exBanking.send('user1', 'user2', 1, 'EUR'))
// console.log(exBanking.getBalance('user2', 'EUR'))

// Todo: find propely way to work with either monad, create normal tests
// Spended time today 3h 16 min
// 11:07 25min spent.
//z another 30min

