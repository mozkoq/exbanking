# ExBanking

[![TypeScript version][ts-badge]][typescript-4-4]
[![Node.js version][nodejs-badge]][nodejs]
[![APLv2][license-badge]][license]

- [TypeScript][typescript] [4.4][typescript-4-4]
- [ESLint][eslint] with some initial rules recommendation
- [Jest][jest] for fast unit testing and code coverage
- Type definitions for Node.js and Jest
- [Prettier][prettier] to enforce consistent code style
- NPM [scripts](#available-scripts) for common operations
- .editorconfig for consistent file format

🤲 Free as in speech: available under the APLv2 license.

## Getting Started

Library returns init() function
###example of use
```javascript 
import { init } from 'ex-banking';

const exBanking = init();
exBanking.createUser('NO');
exBanking.getBalance('NO', 'eur');
const balance = exBanking.getBalance('NO', 'eur');
expect(balance).toStrictEqual({ ...success, balance: 0 });
```
### Library interface
```typescript 
interface ExBanking {
  deposit: (username: string, amount: number, currency: string) => (Ok & { newBalance: number } | BankingError),
  withdraw: (username: string, amount: number, currency: string) =>  (Ok & { newBalance: number } | BankingError),
  getBalance: (username: string, currency: string) => (Ok & { balance: number } | BankingError),
  send: (fromUsername: string, toUsername: string, amount: number, currency: string) => (Ok & { fromUsernameBalance: number, toUsernameBalance: number } | BankingError),
  createUser: (username: string) => Ok | BankingError;
}
```

## Available Scripts

- `clean` - remove coverage data, Jest cache and transpiled files,
- `prebuild` - lint source files and tests before building,
- `build` - transpile TypeScript to ES6,
- `build:watch` - interactive watch mode to automatically transpile source files,
- `lint` - lint source files and tests,
- `test` - run tests,
- `test:watch` - interactive watch mode to automatically re-run tests

## License

Licensed under the APLv2. See the [LICENSE](https://github.com/jsynowiec/node-typescript-boilerplate/blob/main/LICENSE) file for details.

[ts-badge]: https://img.shields.io/badge/TypeScript-4.4-blue.svg
[nodejs-badge]: https://img.shields.io/badge/Node.js->=%2014.16-blue.svg
[nodejs]: https://nodejs.org/dist/latest-v14.x/docs/api/
[typescript]: https://www.typescriptlang.org/
[typescript-4-4]: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-4.html
[license-badge]: https://img.shields.io/badge/license-APLv2-blue.svg
[license]: https://github.com/jsynowiec/node-typescript-boilerplate/blob/main/LICENSE
[jest]: https://facebook.github.io/jest/
[eslint]: https://github.com/eslint/eslint
[prettier]: https://prettier.io
