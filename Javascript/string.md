Строки (або рядки) у JavaScript є одним з основних типів даних і широко використовуються для зберігання та маніпулювання текстовою інформацією. Розглянемо основні аспекти роботи зі строками у JavaScript.

### Оголошення строк

Строки можна оголошувати, використовуючи одинарні або подвійні лапки, а також шаблонні літерали (зворотні лапки).

#### Приклади

```javascript
let singleQuote = 'Hello, world!';
let doubleQuote = "Hello, world!";
let templateLiteral = `Hello, world!`;
```

### Властивості та методи строк

#### Довжина строки

Властивість `length` повертає кількість символів у строці.

```javascript
let str = "Hello, world!";
console.log(str.length); // 13
```

#### Доступ до символів

Кожен символ у строці має свій індекс, починаючи з нуля.

```javascript
let str = "Hello";
console.log(str[0]); // "H"
console.log(str[4]); // "o"
```

### Методи для маніпуляції строками

#### Конкатенація строк

Можна об'єднувати строки за допомогою оператора `+` або методу `concat`.

```javascript
let str1 = "Hello";
let str2 = "world";
let result = str1 + ", " + str2 + "!";
console.log(result); // "Hello, world!"

let result2 = str1.concat(", ", str2, "!");
console.log(result2); // "Hello, world!"
```

#### Методи пошуку

- `indexOf` — повертає індекс першого входження підстроки.
- `lastIndexOf` — повертає індекс останнього входження підстроки.
- `includes` — перевіряє, чи міститься підстрока у строці.
- `startsWith` — перевіряє, чи починається строка з підстроки.
- `endsWith` — перевіряє, чи закінчується строка підстрокою.

```javascript
let str = "Hello, world!";
console.log(str.indexOf("world")); // 7
console.log(str.lastIndexOf("o")); // 8
console.log(str.includes("Hello")); // true
console.log(str.startsWith("Hell")); // true
console.log(str.endsWith("!")); // true
```

#### Методи видалення пробілів

- `trim` — видаляє пробіли з початку та кінця строки.
- `trimStart` (або `trimLeft`) — видаляє пробіли з початку строки.
- `trimEnd` (або `trimRight`) — видаляє пробіли з кінця строки.

```javascript
let str = "  Hello, world!  ";
console.log(str.trim()); // "Hello, world!"
console.log(str.trimStart()); // "Hello, world!  "
console.log(str.trimEnd()); // "  Hello, world!"
```

#### Методи зміни регістру

- `toUpperCase` — перетворює строку на верхній регістр.
- `toLowerCase` — перетворює строку на нижній регістр.

```javascript
let str = "Hello, world!";
console.log(str.toUpperCase()); // "HELLO, WORLD!"
console.log(str.toLowerCase()); // "hello, world!"
```

#### Виділення підстрок

- `slice` — повертає підстроку між двома індексами.
- `substring` — повертає підстроку між двома індексами (не підтримує від'ємні індекси).
- `substr` — повертає підстроку, починаючи з індексу і заданої довжини (застарілий).

```javascript
let str = "Hello, world!";
console.log(str.slice(7, 12)); // "world"
console.log(str.substring(7, 12)); // "world"
console.log(str.substr(7, 5)); // "world"
```

### Шаблонні літерали

Шаблонні літерали дозволяють включати вирази всередину строк, використовуючи `${}`.

```javascript
let name = "Alice";
let greeting = `Hello, ${name}!`;
console.log(greeting); // "Hello, Alice!"

let a = 5;
let b = 10;
console.log(`The sum of ${a} and ${b} is ${a + b}.`); // "The sum of 5 and 10 is 15."
```

### Розбиття та об'єднання строк

- `split` — розбиває строку на масив підстрок.
- `join` — об'єднує елементи масиву у строку.

```javascript
let str = "Hello, world!";
let words = str.split(" ");
console.log(words); // ["Hello,", "world!"]

let joined = words.join(" ");
console.log(joined); // "Hello, world!"
```

### Замінювання підстрок

- `replace` — замінює підстроку на іншу строку.
- `replaceAll` — замінює всі входження підстроки на іншу строку (ES2021).

```javascript
let str = "Hello, world! Hello!";
let newStr = str.replace("Hello", "Hi");
console.log(newStr); // "Hi, world! Hello!"

let newStrAll = str.replaceAll("Hello", "Hi");
console.log(newStrAll); // "Hi, world! Hi!"
```

### Інтернаціоналізація

- `localeCompare` — порівнює дві строки з урахуванням мовних особливостей.
- `toLocaleUpperCase` та `toLocaleLowerCase` — перетворюють строку у верхній або нижній регістр з урахуванням мовних особливостей.

```javascript
let str1 = "ä";
let str2 = "z";
console.log(str1.localeCompare(str2, 'de')); // -1 (в німецькій мові "ä" йде перед "z")

let str = "istanbul";
console.log(str.toLocaleUpperCase('tr')); // "İSTANBUL" (враховує турецькі правила регістру)
```

### Висновок

Строки у JavaScript є потужним інструментом для роботи з текстом. Володіння цими методами та властивостями дозволить вам ефективно маніпулювати текстовою інформацією у ваших проектах.