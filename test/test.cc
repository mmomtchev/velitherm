#include "velitherm.h"
#include <cassert>
#include <cstdlib>

int main() {
  double gamma =
      (velitherm::T0 - velitherm::adiabaticCooling(velitherm::T0, velitherm::pressureFromStandardAltitude(100),
                                                   velitherm::pressureFromStandardAltitude(0))) /
      100;

  assert(std::abs(gamma - velitherm::gamma) < 1e-5);

  return 0;
}
