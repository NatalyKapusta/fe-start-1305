### Булеві значення

Булеві значення можуть бути або `true`, або `false`.

#### Приклади

```javascript
let isTrue = true;
let isFalse = false;

console.log(isTrue);  // true
console.log(isFalse); // false

// Логічні оператори
console.log(true && false); // false
console.log(true || false); // true
console.log(!true);         // false
```

### `null`

`null` використовується для позначення відсутності будь-якого об'єкта або значення.

#### Приклади

```javascript
let emptyValue = null;

console.log(emptyValue);  // null

// Перевірка типу
console.log(typeof emptyValue); // "object" (це історична особливість JavaScript)
```

### `undefined`

`undefined` означає, що змінна була оголошена, але їй не було присвоєно значення.

#### Приклади

```javascript
let notAssigned;

console.log(notAssigned);  // undefined

// Перевірка типу
console.log(typeof notAssigned); // "undefined"
```

### Перетворення типів

#### Приклади перетворення типів на булеві

```javascript
console.log(Boolean(0));        // false
console.log(Boolean(""));       // false
console.log(Boolean(null));     // false
console.log(Boolean(undefined)); // false
console.log(Boolean(NaN));      // false

console.log(Boolean(1));        // true
console.log(Boolean("hello"));  // true
console.log(Boolean({}));       // true
console.log(Boolean([]));       // true
```

### Висновок

- Булеві значення (`true`, `false`) використовуються для логічних операцій.
- `null` вказує на відсутність значення або об'єкта.
- `undefined` вказує на те, що змінна була оголошена, але їй не було присвоєно значення.