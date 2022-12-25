## Command structure
As example let's take a look at a simple command, that would make bot to reply to us with 'Hey there buddy!'
upon receiving prefixed command 'hello'.
```typescript
const attributes: Dict = new Dict({
  name: 'hello',
  minArgs: 0,
  maxArgs: 0,
  description: 'Replies with a greeting message',
  usage: 'hello',
  permissions: [],
  role: null,
  module: 'MISC',
  cooldown: 0
})

export const instance = new class extends CommandBase {
  execute(message: Message, []: []): void {
    message.reply('Hey there buddy!')
  }
}(attributes)
```
Each command file should **export an instance** of class extended with **CommandBase** class,
which implies implementing **execute** method, that is command's entry point.  
Also a set of **attributes** should be passed to class constructor, which would define base information.  
A **minimum** set of attributes should contain: **name, description, usage and module**

<ins>Available attributes:</ins>  
**name** - *name of the command*  
**maxArgs** - *maximum amount of arguments*  
**minArgs** - *minimum amount of arguments*  
**description** - *command description*  
**usage** - *command usage documentation*  
**permissions** - *list of command permissions*  
**roles** - *list of required roles the command*  
**module** - *module that command belongs to*  
**cooldown** - *delay between command usages*  
**lastCalled** - *timestamp of the last call*  


In order to **parametrize** a command, for instance to make a command *sum*, that would add up
two numbers given as command arguments you will need to:
- Set **maxArgs** and **minArgs** attributes to **2**, that will tell command to expect
  at least and at most 2 arguments
- Make sure to include them into **usage** attribute as well, something like `sum <num1> <num2>`
- Most importantly add them to *execute* function parameters using array destruction like this  
  `execute(message: Message, [num1, num2]: [string, string])`  
  which means command would expect receiving 2 arguments
- Currently you also have to convert arguments to needed type if it not string as everything
  that comes from discord is a string by default
  
A full command's source code for that could look something close to that
```typescript
const attributes: Dict = new Dict({
  name: 'sum',
  minArgs: 2,
  maxArgs: 2,
  description: 'Adds up two numbers',
  usage: 'sum <num1> <num2>',
  module: 'MISC'
})

export const instance = new class extends CommandBase {
  execute(message: Message, [num1, num2]: [string, string]): void {
    message.reply(`Result is: ${parseInt( num1, 10) + parseInt( num2, 10)}`)
  }
}(attributes)
```

In order for command to be fully functioning `.ts` file should be located anywhere within
`/src/commands` folder
