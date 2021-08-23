# Gaea
A general entity library written in Typescript, powered by [TypeORM](https://github.com/typeorm/typeorm), best to be used with 
[Nestjs](https://nestjs.com)


[![NPM Version](http://img.shields.io/npm/v/@theogonic/gaea.svg?style=flat)](https://www.npmjs.org/package/@theogonic/gaea)
[![NPM Downloads](https://img.shields.io/npm/dm/@theogonic/gaea.svg?style=flat)](https://npmcharts.com/compare/@theogonic/gaea?minimal=true)
[![NPM License](https://img.shields.io/npm/l/all-contributors.svg?style=flat)](https://github.com/theogonic/gaea/blob/master/LICENSE)

- [Gaea](#gaea)
  - [Features](#features)
  - [Motivation](#motivation)
  - [Usage](#usage)
    - [Declare Entity](#declare-entity)
    - [Declare DAO (Data Access Object)](#declare-dao-data-access-object)
    - [Manipulate it](#manipulate-it)
      - [Nestjs](#nestjs)
      - [Manually](#manually)

## Features
1. No need to write **SQL** schema, everything is defined in **Typescript**
2. No need to run **SQL** migration
3. Powerful listing and filtering, including full text search

## Motivation
This project aims to provide an out-of-box entity library (an easy way talking to the database) used in rapid development/prototype stage considered to the highly fuzzy demands and usecases.

## Usage

### Declare Entity
```ts
import { BaseGeneralObject } from '@theogonic/gaea';

export class UserEntity extends BaseGeneralObject  {
  name: string
  profile: {
    email: string
    phoneNumber: string
  };
}
```

### Declare DAO (Data Access Object)

```ts
import { BaseGeneralObjectDao } from '@theogonic/gaea';

export class UserEntityDao extends BaseGeneralObjectDao<UserEntity> {
  target = UserEntity;
}
```

### Manipulate it

#### Nestjs
```ts
import { GeneralObjectModule } from '@theogonic/gaea';
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
  imports: [
    TypeOrmModule,
    // since GeneralObjectModule only used TypeOrmModule.forFeature, so TypeOrmModle is required (epected to have proper database connection)
    GeneralObjectModule  
  ],
  providers: [
    UserService,
    UserEntityDao 
  ]
})
export class UserModule {}
```

```ts
import { Injectable } from "@nestjs/common";

@Injectable()
export class UserService {
  constructor(private readonly userDao: UserEntityDao){}

  getUserById(id: string): UserEntity {
    return this.userDao.listOne(id);
  }
}
```

#### Manually 
```ts
const userDao = new UserEntityDao(/* Typeorm Entity Manager*/) 

userDao.listOne(...)
```