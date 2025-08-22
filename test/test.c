#include "velitherm.h"
#include <assert.h>
#include <math.h>

int main() {
  double gamma =
      (T0 - adiabaticCooling(T0, pressureFromStandardAltitude(100, P0), pressureFromStandardAltitude(0, P0))) / 100;

  assert(fabs(gamma - gamma) < 1e-5);

  return 0;
}
