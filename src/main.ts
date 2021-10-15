enum BankingError {
  Error = 'Error',
  WrongArguments = 'WrongArguments',
  UserAlreadyExists = 'UserAlreadyExists',
  UserDoesNotExist = 'UserDoesNotExist',
  NotEnoughMoney = 'NotEnoughMoney' ,
  SenderDoesNotExist = 'SenderDoesNotExist' ,
  ReceiverDoesNotExist = 'ReceiverDoesNotExist',
}


type Ok = { success: true };
type Balance = { currency: string, amount: number }[];

type User = {
  balance: Balance
}
type Username = string;

const success: Ok = {success: true};
const isValidUsername = (username) => typeof username === 'string';
const isValidCurrency = (currency) => typeof currency === 'string'
const isValidAmount = (currency) => isFinite(currency);
const init = () => {

  const state: Map<Username, User> = new Map();
  const send = (fromUsername: string, toUsername: string, amount: number, currency: string): (Ok & { fromUsernameBalance: number, toUsernameBalance: number } | BankingError) => {
    const withdrawResult = withdraw(fromUsername, amount, currency);
    if (!withdrawResult.hasOwnProperty('success')) return withdrawResult as BankingError;

    const depositResult = deposit(toUsername, amount, currency);
    if (!depositResult.hasOwnProperty('success')) return withdrawResult as BankingError;

    //refact
    const fromUsernameBalance = state.get(fromUsername).balance.find((balance) => balance.currency === currency);
    const toUsernameBalance = state.get(toUsername).balance.find((balance) => balance.currency === currency);

    return {...success, fromUsernameBalance: fromUsernameBalance.amount, toUsernameBalance: toUsernameBalance.amount }
  };

  const getBalance = (username: string, currency: string): (Ok & { balance: number } | BankingError) => {
    if (!isValidUsername(username) || !isValidCurrency(currency)) return BankingError.WrongArguments;

    const user = state.get(username);
    if (!user) return BankingError.UserDoesNotExist;

    const balance = user.balance.find((balance) => balance.currency === currency);

    // we don't have error with noCurrency balance and no text in task about this case.
    // Currencies should be created automatically (if needed).
    return {
      ...success,
      balance: balance?.amount ?? 0,
    }
  };

  const withdraw = (username: string, amount: number, currency: string): (Ok & { newBalance: number } | BankingError) => {
    if (!isValidUsername(username) || !isValidCurrency(currency) || !isValidAmount(amount)) return BankingError.WrongArguments;
    const balance = state.get(username).balance.find((balance) => balance.currency === currency);
    if (balance.amount - amount < 0) return BankingError.NotEnoughMoney;
    return depositWithNegativeValue(username, -amount, currency)
  };

  const depositWithNegativeValue = (username: string, amount: number, currency: string): (Ok & { newBalance: number } | BankingError) => {
    if (!isValidUsername(username) || !isValidCurrency(currency)) return BankingError.WrongArguments;
    const user = state.get(username);
    if (!user) return BankingError.UserDoesNotExist;


    const userWallet = user.balance.find((balance) => balance.currency === currency);
    if (userWallet) {
      state.set(username, { ...user, balance: user.balance.map((balance) => currency === balance.currency ? { ...balance, amount: amount + balance.amount } : { ...balance }) });
    } else {
      state.set(username, { ...user, balance: [...user.balance, { amount, currency } ] });
    }
//refact
    const balance = state.get(username).balance.find((balance) => balance.currency === currency);

    return {...success, newBalance: balance.amount}
  }

  const deposit = (username: string, amount: number, currency: string): (Ok & { newBalance: number } | BankingError) => {
    if (!isValidAmount(amount) ) return BankingError.WrongArguments;
    return depositWithNegativeValue(username,amount,currency);
  };

  const createUser = (username: string): Ok | BankingError => {
    if (!isValidUsername(username)) return BankingError.WrongArguments;
    if (state.get(username)) return BankingError.UserAlreadyExists;

    state.set(username, { balance: []});
    return success;
  };

  return {send,getBalance,createUser,withdraw,deposit};
}
const exBanking = init();

// Amazing TDD
console.log(exBanking.getBalance('user1', 'EUR'))
console.log(exBanking.createUser('user1'))
console.log(exBanking.createUser('user1'))
console.log(exBanking.createUser('user2'))
console.log(exBanking.getBalance('user1', 'EUR'))
console.log(exBanking.deposit('user1', 1, 'EUR'))
console.log(exBanking.withdraw('user1', 2, 'EUR'))
console.log(exBanking.send('user1', 'user2', 1, 'EUR'))
console.log(exBanking.getBalance('user2', 'EUR'))

// Todo: find propely way to work with either monad, create normal tests
// Spended time today 3h 16 min
