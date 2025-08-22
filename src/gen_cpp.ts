
// World's most horrible TS->C++ converter ever...
//...but it works in my case

import * as process from 'process';

process.stdout.write(`
#include <math.h>

#ifdef __cplusplus
namespace velitherm {
#define VELITHERM_DEFAULT(x) = x
#else
#define VELITHERM_DEFAULT(x)
#endif

`);

process.stdin.on('data', (chunk) => {
  process.stdout.write(chunk.toString()
    .replace(/([a-zA-Z0-9]+):\s+number\s+=\s+([A-Z0-9]+)/g,
      'double $1 VELITHERM_DEFAULT($2)')
    .replace(/export\s+function/g, 'static inline double')
    .replace(/([a-zA-Z0-9]+):\s+number/g, 'double $1')
    .replace(/\):\s+number/g, ')')
    .replace(/export\s+const/g, 'const')
    .replace(/.+velitherm\s+=.+/g, '')
    .replace(/const\s+([a-zA-Z0-9]+)/g, 'const double $1')
    .replace(/Math\./g, ''));
});

process.stdin.on('end', () => {
  process.stdout.write(`

#ifdef __cplusplus
}
#endif

`);
});
