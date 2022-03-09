import * as velitherm from '..';

import * as chai from 'chai';
import * as mocha from 'mocha';
const it = mocha.it;
const assert = chai.assert;

const standardAtmosphere = [
  { alt: 0, pres: 1013.25 },
  { alt: 1000, pres: 898.746 },
  { alt: 2000, pres: 794.952 },
  { alt: 3000, pres: 701.085 },
  { alt: 4000, pres: 616.402 }
];

const realAtmosphere = [
  { alt: 0, pres: 1000, pres0: 1000, t: 20 },
  { alt: 1061, pres: 898.746, pres0: 1020, t: 10 },
  { alt: 1958, pres: 794.952, pres0: 1010, t: 0 },
  { alt: 3022, pres: 701.085, pres0: 1010, t: 0 },
  { alt: 4182, pres: 616.402, pres0: 1015, t: 0 }
];

const waterVaporSaturationPressure = [
  { t: 0, Preal: 6.113, Ptetens: 6.108 },
  { t: 20, Preal: 23.388, Ptetens: 23.382 },
  { t: 35, Preal: 56.267, Ptetens: 56.225 },
  { t: 35, Preal: 56.267, Ptetens: 56.225 }
];

const humidity = [
  { t: 23, p: 1013.25, h: 35, q: 6.06, w: 6.09, td: 6.7 },
  { t: 3, p: 900, h: 60, q: 3.15, w: 3.16, td: -4.0 },
  { t: -5, p: 800, h: 90, q: 2.95, w: 2.96, td: -6.4 }
];

const dryAir = [
  { t: 35, rho: 1.1455 },
  { t: 30, rho: 1.1644 },
  { t: 25, rho: 1.1839 },
  { t: 5, rho: 1.269 },
  { t: -15, rho: 1.3673 }
];

const humidAir = [
  { t: 0, p: 1013.25, h: 80, rho: 1.29 },
  { t: 10, p: 1013.25, h: 60, rho: 1.243 },
  { t: 20, p: 1013.25, h: 80, rho: 1.198 },
  { t: -10, p: 1013.25, h: 80, rho: 1.34 },
  { t: -10, p: 800, h: 80, rho: 1.058 }
];

describe('velitherm', () => {
  describe('ICAO Standard Atmosphere (Barometric equation)', () => {
    describe('altitudeFromStandardPressure', () => {
      for (const lvl of standardAtmosphere) {
        it(`Altitude of ${lvl.pres}hPa should be ${lvl.alt}m`, () => {
          assert.closeTo(velitherm.altitudeFromStandardPressure(lvl.pres), lvl.alt, 1);
        });
      }
    });

    describe('pressureFromStandardAltitude', () => {
      for (const lvl of standardAtmosphere) {
        it(`Altitude at ${lvl.pres}hPa should be ${lvl.alt}m`, () => {
          assert.closeTo(velitherm.pressureFromStandardAltitude(lvl.alt), lvl.pres, 1);
        });
      }
    });
  });

  describe('Hypsometric equation', () => {
    describe('altitudeFromPressure', () => {
      for (const lvl of realAtmosphere) {
        it(`(QNH=${lvl.pres0}hPa, T=${lvl.t}°C) Altitude of ${lvl.pres} hPa should be ${lvl.alt}m`, () => {
          assert.closeTo(velitherm.altitudeFromPressure(lvl.pres, lvl.pres0, lvl.t), lvl.alt, 5);
        });
      }
    });

    describe('pressureFromAltitude', () => {
      for (const lvl of realAtmosphere) {
        it(`(QNH=${lvl.pres0}hPa, T=${lvl.t}°C) Altitude at ${lvl.pres} hPa should be ${lvl.alt}m`, () => {
          assert.closeTo(velitherm.pressureFromAltitude(lvl.alt, lvl.pres0, lvl.t), lvl.pres, 1);
        });
      }
    });
  });

  describe('waterVaporSaturationPressure', () => {
    for (const lvl of waterVaporSaturationPressure) {
      it(`Water Vapor (Saturation) Pressure at ${lvl.t}°C should be ${lvl.Preal}hPa`, () => {
        assert.closeTo(velitherm.waterVaporSaturationPressure(lvl.t), lvl.Ptetens, 0.1);
        assert.closeTo(velitherm.waterVaporSaturationPressure(lvl.t), lvl.Preal, 1);
      });
    }
  });

  describe('Humidity', () => {
    describe('specificHumidity', () => {
      for (const lvl of humidity) {
        it(`RH=${lvl.h}%, P=${lvl.p}hPa, T=${lvl.t}°C => q=${lvl.q}g/kg`, () => {
          assert.closeTo(velitherm.specificHumidity(lvl.h, lvl.p, lvl.t), lvl.q, 1e-1);
        });
      }
    });

    describe('mixingRatio', () => {
      for (const lvl of humidity) {
        it(`RH=${lvl.h}%, P=${lvl.p}hPa, T=${lvl.t}°C => w=${lvl.w}g/kg`, () => {
          assert.closeTo(velitherm.mixingRatio(velitherm.specificHumidity(lvl.h, lvl.p, lvl.t)), lvl.w, 1e-1);
        });
      }
      for (const lvl of humidity) {
        it(`RH=${lvl.h}%, P=${lvl.p}hPa, T=${lvl.t}°C => q=${lvl.q}g/kg`, () => {
          assert.closeTo(velitherm.specificHumidityFromMixingRatio(lvl.w), lvl.q, 1e-1);
        });
      }
    });

    describe('relativeHumidity', () => {
      for (const lvl of humidity) {
        it(`q=${lvl.q}g/kg, P=${lvl.p}hPa, T=${lvl.t}°C => RH=${lvl.h}%`, () => {
          assert.closeTo(velitherm.relativeHumidity(lvl.q, lvl.p, lvl.t), lvl.h, 2);
        });
      }
    });

    describe('dewPoint', () => {
      for (const lvl of humidity) {
        it(`RH=${lvl.h}%, T=${lvl.t}°C => Td=${lvl.td}°C`, () => {
          assert.closeTo(velitherm.dewPoint(lvl.h, lvl.t), lvl.td, 0.1);
        });
      }
    });
  });

  describe('airDensity', () => {
    for (const lvl of dryAir) {
      it(`Dry air, sea level, ${lvl.t}°C => rho = ${lvl.rho} kg/m3`, () => {
        assert.closeTo(velitherm.airDensity(0, velitherm.P0, lvl.t), lvl.rho, 1e-3);
      });
    }

    for (const lvl of humidAir) {
      it(`Humid air ${lvl.h}%, ${lvl.p}hPa, ${lvl.t}°C => rho = ${lvl.rho} kg/m3`, () => {
        assert.closeTo(velitherm.airDensity(lvl.h, lvl.p, lvl.t), lvl.rho, 1e-2);
      });
    }
  });
});
