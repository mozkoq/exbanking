import { init } from '../src/main';
import {
  NotEnoughMoney,
  ReceiverDoesNotExist,
  SenderDoesNotExist,
  success, UserAlreadyExists,
  UserDoesNotExist,
  WrongArguments,
} from '../src/types';

describe('getBalance', () => {
  let exBanking;

  beforeEach(() => exBanking = init());
  it('Wrong arguments', () => {
      const balance = exBanking.getBalance('NO')
      expect(balance).toBeInstanceOf(WrongArguments);
  });

  it('UserDoesNotExist', () => {
    // currency can be empty string?
    const balance = exBanking.getBalance('NO', '')
    expect(balance).toBeInstanceOf(UserDoesNotExist);
  });

  it('Happy', () => {
    exBanking.createUser('NO')
    exBanking.getBalance('NO', 'eur')
    const balance = exBanking.getBalance('NO', 'eur');
    expect(balance).toStrictEqual({ ...success, balance: 0 })
  });
});


describe('send', () => {
  let exBanking;

  beforeEach(() => exBanking = init());
  it('Wrong arguments', () => {
    const balance = exBanking.send('NO')
    expect(balance).toBeInstanceOf(WrongArguments);
  });

  it('SenderDoesNotExists', () => {
    exBanking.createUser('to');
    const balance = exBanking.send('from', 'to', 1, 'eur');
    expect(balance).toBeInstanceOf(SenderDoesNotExist);
  });

  it('ReceiverDoesNotExists', () => {
    exBanking.createUser('from');
    exBanking.deposit('from', 1, 'eur')
    const balance = exBanking.send('from', 'to', 1, 'eur');
    expect(balance).toBeInstanceOf(ReceiverDoesNotExist);
  });

  it('NotEnoughMoney', () => {
    exBanking.createUser('from');
    const balance = exBanking.send('from', 'to', 1, 'eur');
    expect(balance).toBeInstanceOf(NotEnoughMoney);
  });

  it('Happy', () => {
    exBanking.createUser('from');
    exBanking.createUser('to');
    exBanking.deposit('from', 1, 'eur');
    const balance = exBanking.send('from', 'to', 1, 'eur');
    expect(balance).toStrictEqual({...success, fromUsernameBalance: 0, toUsernameBalance: 1});
  });


  it('NegativeValue', () => {
    exBanking.createUser('from');
    exBanking.createUser('to');
    exBanking.deposit('from', 1, 'eur');
    const balance = exBanking.send('from', 'to', -1, 'eur');
    expect(balance).toBeInstanceOf(WrongArguments);
  });
});




describe('withdraw', () => {
  let exBanking;

  beforeEach(() => exBanking = init());
  it('Wrong arguments', () => {
    const balance = exBanking.withdraw('no');
    expect(balance).toBeInstanceOf(WrongArguments);
  });

  it('UserDoesNotExists', () => {
    const balance = exBanking.withdraw('no', 1, 'eur');
    expect(balance).toBeInstanceOf(UserDoesNotExist);
  });

  it('Happy', () => {
    exBanking.createUser('from');
    exBanking.deposit('from', 2, 'eur')
    const balance = exBanking.withdraw('from', 1, 'eur');
    expect(balance).toStrictEqual({ ...success,  newBalance: 1 });
  });

  it('NotEnoughMoney', () => {
    exBanking.createUser('from');
    const balance = exBanking.withdraw('from', 1, 'eur');
    expect(balance).toBeInstanceOf(NotEnoughMoney);
  });

  it('NegativeValue', () => {
    exBanking.createUser('from');

    const balance = exBanking.withdraw('from', -1, 'eur');
    expect(balance).toBeInstanceOf(WrongArguments);
  });
});


describe('deposit', () => {
  let exBanking;

  beforeEach(() => exBanking = init());
  it('Wrong arguments', () => {
    const balance = exBanking.deposit('no');
    expect(balance).toBeInstanceOf(WrongArguments);
  });

  it('UserDoesNotExists', () => {
    const balance = exBanking.deposit('no', 1, 'eur');
    expect(balance).toBeInstanceOf(UserDoesNotExist);
  });

  it('Happy', () => {
    exBanking.createUser('from');
    const balance = exBanking.deposit('from', 1, 'eur');
    expect(balance).toStrictEqual({ ...success,  newBalance: 1 });
  });


  it('NegativeValue', () => {
    exBanking.createUser('from');

    const balance = exBanking.deposit('from', -1, 'eur');
    expect(balance).toBeInstanceOf(WrongArguments);
  });
});



describe('create', () => {
  let exBanking;

  beforeEach(() => exBanking = init());
  it('Wrong arguments', () => {
    const user = exBanking.createUser(11);
    expect(user).toBeInstanceOf(WrongArguments);
  });


  it('UserAlreadyExists', () => {
    exBanking.createUser('hey');
    const user = exBanking.createUser('hey');
    expect(user).toBeInstanceOf(UserAlreadyExists);
  });

  it('Happy', () => {
    const user = exBanking.createUser('from');
    expect(user).toStrictEqual(success);
  });
});
