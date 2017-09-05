'use strict';

console.log('this is child process');

let i = 0;
setInterval(() => {
  console.log(i++);
}, 3000);
