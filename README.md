# Velitherm

[![License: LGPL v3](https://img.shields.io/badge/License-LGPL%20v3-blue.svg)](https://www.gnu.org/licenses/lgpl-3.0)
[![Node.js CI](https://github.com/mmomtchev/velitherm/actions/workflows/node.js.yml/badge.svg)](https://github.com/mmomtchev/velitherm/actions/workflows/node.js.yml)
[![npm version](https://img.shields.io/npm/v/velitherm)](https://www.npmjs.com/package/velitherm)
[![codecov](https://codecov.io/gh/mmomtchev/velitherm/branch/main/graph/badge.svg?token=aU1ATy8HKv)](https://codecov.io/gh/mmomtchev/velitherm)

A library of basic thermodynamics equations for soaring flight.

As used by the weather site https://www.velivole.fr / https://www.meteo.guru

Zero-dependency!

If you are new to weather thermodynamics, you should probably start here: [Basic Concepts of Thermodynamics for Soaring Flight](https://github.com/mmomtchev/velivole/blob/main/THERMODYNAMICS.md)

*Si vous n'êtes pas à l'aise en thermodynamique appliquée à la météorologie, vous devriez peut-être commencer ici: [Bases de la thermodynamique pour le vol libre et le vol à voile](https://github.com/mmomtchev/velivole/blob/main/THERMODYNAMIQUE.md)*

# Installation

```bash
npm install --save velitherm
```

# Usage

Keep in mind that some equations are numerical approximations of differential equations that have no analytic solutions. The approximations used are the typical weather science approximations which produce good results for temperatures in the range of -40°C to +40°C and air pressures in the range of 1050hPa to 200hPa - which are the typical values in the troposphere - but often lack precision outside this range.

You can check [velitherm-visu](https://github.com/mmomtchev/velitherm-visu) for a real-world example of using this library. It is hosted at [aircalc.velivole.fr](https://aircalc.velivole.fr).

## Common JS

```js
const velitherm = require('velitherm');

// must be very close to 1000
const alt = velitherm.altitudeFromPressure(898.746);
```

## ECMAScript 6

```js
import * as velitherm from 'velitherm';

// must be very close to 1000
const alt = velitherm.altitudeFromPressure(898.746);
```

## TypeScript

```js
import * as velitherm from 'velitherm';

// must be very close to 1000
const alt = velitherm.altitudeFromPressure(898.746);
```

## C/C++

```cpp
#include "node_modules/velitherm/include/velitherm.h"

// must be very close to 1000
double alt = velitherm::altitudeFromPressure(898.746);
```

## Barometric and hypsometric equations

There is no single analytical equation that can be used to give a precise value for the altitude / pressure relationship. In fact, this relationship depends on the full vertical temperature and humidity profile and it is impossible to reduce to a single formula. There are two levels of approximation that are widely used:

*   The barometric formula, which is an ICAO standard and gives a rough value that does not take into account the pressure or the temperature of the day and it is always constant - in aviation it is referred by the callsign **QNH**
*   The hypsometric formula, which is commonly used in weather science and it is a better estimation that takes into account the pressure and the temperature of the day - so it varies from one day to another - in aviation it is referred by the callsign **QFF**

If you are coming from an aviation background, and **QNH**, **QFF** and **QFE** are altimeter settings to you, then you should know that they actually refer to different equations for calculating the altitude from the pressure. **QFE** refers to the surface pressure of a given site - airport or weather station - and not an equation. If you want to use `velitherm` to convert between altimeter settings, the right way to do it would be to convert the pressure to altitude using the input setting and then convert it back to pressure using the output setting.

# Examples

## General weather science

An air parcel with relative humidify of 75% and temperature of 25°C rises from 0m AMSL to 500m AMSL where the surrounding temperature is 20°C. What is its new relative humidity? What is its new temperature? Has there been condensation and did it form a cloud? Has the convective top (ceiling) been reached or will the air parcel continue to rise? The pressure of the day is 1017hPa and the relative humidity at 500m AMSL is 50%.

Solution:

```ts
import * as velitherm from 'velitherm';

// When the air rises, its specific humidity remains constant
const q = velitherm.specificHumidity(75, 1017, 25);
console.log('Specific humidity = ', Math.round(q), 'g/kg');
console.log('Dew point = ', velitherm.dewPoint(75, 25));

// Find the current pressure at 500m AMSL
const P1 = velitherm.pressureFromAltitude(500, 1017, 25);
console.log('Pressure at 500m = ', Math.round(P1), 'hPa');

// Take into account the dry adiabatic cooling over 500m
const T1 = 25 - 500 * velitherm.gamma;
console.log('The new temperature of the air parcel at 500m = ', T1, '°C');

// Compute the new relative humidity of the air parcel at this pressure and temperature
const w1 = velitherm.relativeHumidity(q, P1, T1);
console.log('Relative humidity after rising to 500m = ', Math.round(w1), '%');

// If the air parcel has reached 100% relative humidity, then there will be condensation
if (w1 < 100) {
  console.log('No, it did not form a cloud');
} else {
  console.log('Yes, it did form a cloud');
}

// If the density of the air parcel is still lower than the
// surrounding air at 500m AMSL, then it will continue to rise
const rhoParcel = velitherm.airDensity(w1, P1, T1);
const rhoAir500 = velitherm.airDensity(50, P1, 20);
if (rhoParcel < rhoAir500) {
  console.log('The air parcel will continue to rise');
} else {
  console.log('The ceiling has been reached');
}
```

You can run the example program with
```shell
npx tsx examples/risingAir.ts
```

*Note that the dew point of the air parcel at sea level is 20.26°C, yet it does not form a cloud when cooled down to 20.12°C at 500m AMSL. The reason is that a dew point is valid only for a given pressure. At a lower pressure, the dew point will also be lower.*

## Flight instruments

I know that the surrounding air pressure is 821 hPa. How can I tell what is my current altitude? How can I tell what is my current flight level and how far I am from FL115?

My local weather information provider tells me that the mean sea level pressure of the day at my location is 1017 hPa. How can I improve the accuracy of my height estimate? And if I know that the temperature at the ground is 23°C? How can I get an even better estimate?

Solution:

```ts
import * as velitherm from 'velitherm';

const barometerInput = 821;
const pressureMSL = 1017;
const temperatureGround = 23;

const feetPerMeter = 3.28084;

// Rough estimate of the height using only the pressure
// We round it to 50m because it is a rough estimate
const alt = Math.round(velitherm.altitudeFromStandardPressure(barometerInput) / 50) * 50;
console.log('Rough estimate of the altitude is', alt, 'm');

// Better estimate of the height using the ground pressure
const alt2 = Math.round(velitherm.altitudeFromPressure(barometerInput, pressureMSL));
console.log('Better estimate of the altitude is', alt2, 'm');

// Even better estimate of the height using the temperature
const alt3 = Math.round(velitherm.altitudeFromPressure(barometerInput, pressureMSL, temperatureGround));
console.log('Even better estimate of the altitude is', alt3, 'm');

// Flight levels are in pressure-feet, so we do not need
// anything but the barometer input (this is the very reason for this)
const fl = Math.round((alt * feetPerMeter) / 100);
console.log('The current closest flight level is FL', fl);

// What is the current altitude for FL115?
// FL115 means 11500 feet measured at pressure at standard atmospheric conditions
const pressureFL115 = velitherm.pressureFromStandardAltitude(115 * 100 / feetPerMeter);
console.log('FL115 means the altitude at which the pressure is', Math.round(pressureFL115), 'hPa');

// Get the actual altitude for today
const altitudeFL115 = Math.round(velitherm.altitudeFromPressure(pressureFL115, pressureMSL, temperatureGround));
console.log('Today FL115 is at', altitudeFL115, 'm');
console.log('You can climb', altitudeFL115 - alt3, 'm before reaching FL115');
```

Run this example with:

```shell
npx tsx examples/flightInstrument.ts
```

*Please note the huge difference between the usual 3505m estimate for FL115 and the actual 3945m altitude for this given day!*

# API

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

### Table of Contents

*   [velitherm](#velitherm)
*   [G](#g)
*   [Cp](#cp)
*   [L](#l)
*   [gamma](#gamma)
*   [P0](#p0)
*   [T0](#t0)
*   [Rd](#rd)
*   [Rv](#rv)
*   [Md](#md)
*   [Mv](#mv)
*   [R](#r)
*   [K](#k)
*   [altitudeFromStandardPressure](#altitudefromstandardpressure)
    *   [Parameters](#parameters)
*   [pressureFromStandardAltitude](#pressurefromstandardaltitude)
    *   [Parameters](#parameters-1)
*   [altitudeFromPressure](#altitudefrompressure)
    *   [Parameters](#parameters-2)
*   [pressureFromAltitude](#pressurefromaltitude)
    *   [Parameters](#parameters-3)
*   [waterVaporSaturationPressure](#watervaporsaturationpressure)
    *   [Parameters](#parameters-4)
*   [relativeHumidity](#relativehumidity)
    *   [Parameters](#parameters-5)
*   [dewPoint](#dewpoint)
    *   [Parameters](#parameters-6)
*   [relativeHumidityFromDewPoint](#relativehumidityfromdewpoint)
    *   [Parameters](#parameters-7)
*   [mixingRatio](#mixingratio)
    *   [Parameters](#parameters-8)
*   [specificHumidityFromMixingRatio](#specifichumidityfrommixingratio)
    *   [Parameters](#parameters-9)
*   [specificHumidity](#specifichumidity)
    *   [Parameters](#parameters-10)
*   [airDensity](#airdensity)
    *   [Parameters](#parameters-11)
*   [LCL](#lcl)
    *   [Parameters](#parameters-12)
*   [gammaMoist](#gammamoist)
    *   [Parameters](#parameters-13)
*   [adiabaticExpansion](#adiabaticexpansion)
    *   [Parameters](#parameters-14)
*   [adiabaticCooling](#adiabaticcooling)
    *   [Parameters](#parameters-15)
    *   [Examples](#examples)

## velitherm

velivole.fr/meteo.guru Basic Thermodynamics Equations for Soaring Flight

Copyright © 2022 Momtchil Momtchev <momtchil@momtchev.com>

Licensed under the LGPL License, Version 3.0 (the "License")
You may not use this file except in compliance with the License.
You may obtain a copy of the License at: <https://www.gnu.org/licenses/lgpl-3.0.en.html>

All methods use:

Pressure in hPa

Temperature in °C

Height in meters

Relative humidity in % from 0 to 100

Specific humidity in g/kg

Mixing ratio in g/kg

Type: [string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)

## G

Earth's average gravity acceleration (m/s2)

Type: [number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)

## Cp

The thermal capacity of air (J/kg)

Type: [number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)

## L

The enthalpy of vaporization of water (J/kg)

Type: [number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)

## gamma

The adiabatic lapse rate of dry air (°C/m)

Type: [number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)

## P0

The average sea level pressure (hPa)

Type: [number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)

## T0

The temperature of the ICAO standard atmosphere (°C)

Type: [number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)

## Rd

The specific gas constant of dry air J/(kg\*K)

Type: [number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)

## Rv

The specific gas constant of water vapor J/(kg\*K)

Type: [number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)

## Md

Molar mass of dry air kg/mol

Type: [number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)

## Mv

Molar mass of water vapor kg/mol

Type: [number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)

## R

Universal gas constant J/(kg\*mol)

Type: [number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)

## K

Absolute zero in °C

Type: [number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)

## altitudeFromStandardPressure

Altitude from pressure using the barometric formula and ICAO's definition of standard atmosphere.

This is a very rough approximation that is an ICAO standard. It is used when calculating QNH.
It does not take into account the pressure and temperature of the day.

### Parameters

*   `pressure` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** Pressure
*   `pressure0` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)?** Optional sea-level pressure of the day (optional, default `P0`)

Returns **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** 

## pressureFromStandardAltitude

Pressure from altitude using the barometric formula and ICAO's definition of standard atmosphere.

This is a very rough approximation that is an ICAO standard. It is used when calculating QNH.
It does not take into account the pressure and temperature of the day.

### Parameters

*   `height` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** Height
*   `pressure0` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)?** Optional sea-level pressure of the day (optional, default `P0`)

Returns **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** 

## altitudeFromPressure

Altitude from pressure using the hypsometric formula.

This is a better equation that takes into account the pressure and the temperature of the day.
It is not a standard and different weather institutions use slightly different parameters.
It is used when calculating the QFF.

### Parameters

*   `pressure` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** Pressure
*   `pressure0` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)?** Optional sea-level pressure of the day (optional, default `P0`)
*   `temp` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)?** Optional average temperature from the ground to the given level (optional, default `T0`)

Returns **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** 

## pressureFromAltitude

Pressure from altitude using the hypsometric formula.

This is a better equation that takes into account the pressure and the temperature of the day.
It is not a standard and different weather institutions use slightly different parameters.
It is used when calculating the QFF.

### Parameters

*   `height` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** Height
*   `pressure0` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)?** Optional sea-level pressure of the day (optional, default `P0`)
*   `temp` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)?** Optional average temperature from the ground to the given level (optional, default `T0`)

Returns **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** 

## waterVaporSaturationPressure

(Saturation) Water vapor pressure.

Clausius–Clapeyron equation - the most fundamental equation in weather science.

This is the Magnus-Tetens approximation.

### Parameters

*   `temp` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** Temperature (optional, default `T0`)

Returns **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** 

## relativeHumidity

Relative humidity from specific humidity.

This is from the Magnus-Tetens approximation.

### Parameters

*   `specificHumidity` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** Specific humidity
*   `pressure` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)?** Optional pressure (optional, default `P0`)
*   `temp` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)?** Optional temperature (optional, default `T0`)

Returns **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** 

## dewPoint

Dew point from relative humidity.

Approximation of the Magnus equation with the Sonntag 1990 coefficients.

### Parameters

*   `relativeHumidity` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** Relative humidity
*   `temp` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)?** Optional temperature (optional, default `T0`)

Returns **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** 

## relativeHumidityFromDewPoint

Relative humidity from dew point.

Approximation of the Magnus equation with the Sonntag 1990 coefficients.

### Parameters

*   `dewPoint` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** Relative humidity
*   `temp` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)?** Optional temperature (optional, default `T0`)

Returns **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** 

## mixingRatio

Mixing ratio from specific humidity.

Analytic equation from the definition.

### Parameters

*   `specificHumidity` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** Specific humidity

Returns **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** 

## specificHumidityFromMixingRatio

Specific humidity from mixing ratio.

Analytic equation from the definition.

### Parameters

*   `mixingRatio` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** Mixing ratio

Returns **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** 

## specificHumidity

Specific humidity from relative humidity.

Approximation of the Magnus equation with the Sonntag 1990 coefficients.

### Parameters

*   `relativeHumidity` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** Relative humidity
*   `pressure` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)?** Optional pressure (optional, default `P0`)
*   `temp` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)?** Optional temperature (optional, default `T0`)

Returns **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** 

## airDensity

Air density.

Analytic equation from Avogadro's Law.

### Parameters

*   `relativeHumidity` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** Relative humidity
*   `pressure` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)?** Optional pressure (optional, default `P0`)
*   `temp` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)?** Optional temperature (optional, default `T0`)

Returns **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** 

## LCL

Lifted Condensation Level.

This is the altitude at which a mechanically lifted air parcel from the ground will condensate.

It corresponds to the cloud base level when the clouds are formed by mechanical lifting.

This approximation is known as the Espy equation with the Stull coefficient.

### Parameters

*   `temp` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** Temperature at 2m
*   `dewPoint` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** Dew point at 2m

Returns **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** 

## gammaMoist

Moist adiabatic lapse rate from pressure and temperature.

Copied from Roland Stull, Practical Meteorology (copylefted, available online).

Rather complex approximation based on the Magnus-Tetens equation and the barometric equation.

### Parameters

*   `temp` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** Temperature
*   `pressure` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)?** Optional pressure (optional, default `P0`)

Returns **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** 

## adiabaticExpansion

Adiabatic expansion rate from pressure change rate.

This equation allows to calculate the expansion ratio of an air parcel from the
the previous pressure and the new pressure.

An adiabatic expansion is an isentropic process that is governed by the Ideal gas law
in general and the constant entropy relationship in particular:
(P / P0) = (V / V0) ^ gamma
Where P=pressure, V=volume, gamma=heat capacity ratio (1.4 for air, a diatomic gas)

Analytic equation.

### Parameters

*   `volume0` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** Old volume
*   `pressure` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** New pressure
*   `pressure0` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** Old pressure (optional, default `P0`)

Returns **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** 

## adiabaticCooling

Adiabatic cooling rate from pressure change rate.

This equation allows to calculate the cooling ratio of an air parcel from the
the previous pressure and the new pressure.

It is by combining this equation with the barometric equation
that the adiabatic lapse rate of dry air can be obtained.

An adiabatic expansion is an isentropic process that is governed by the Ideal gas law
in general and the constant entropy relationship in particular:
(P / P0) = (V / V0) ^ gamma
Where P=pressure, V=volume, gamma=heat capacity ratio (1.4 for air, a diatomic gas)

Keep in mind that if you intend to use this method to calculate a rate relative
to height in meters, you will need very precise altitude calculations for good
results. As the dry adiabatic rate is a constant that does not depend on the
temperature or the pressure, most of the time you will be better off simply
using the `gamma` constant.

<https://en.wikipedia.org/wiki/Ideal_gas_law> contains a very good
introduction to this subject.

Analytic equation.

### Parameters

*   `temp0` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** Old temperature
*   `pressure` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** New pressure
*   `pressure0` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** Old pressure (optional, default `P0`)

### Examples

```javascript
// Compute the adiabatic cooling per meter
// when rising from 0m AMSL to 100m AMSL starting at 15°C

const gamma = (15 - velitherm.adiabaticCooling(15,
                      velitherm.pressureFromStandardAltitude(100),
                      velitherm.pressureFromStandardAltitude(0))
               ) / 100;

// It should be very close to the provided constant
assert(Math.abs(gamma - velitherm.gamma) < 1e-5)
```

Returns **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** 
