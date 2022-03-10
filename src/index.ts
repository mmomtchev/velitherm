/**
 * velivole.fr/meteo.guru Basic Thermodynamics Equations for Soaring Flight
 *
 * Copyright © 2022 Momtchil Momtchev <momtchil@momtchev.com>
 *
 * Licensed under the LGPL License, Version 3.0 (the "License")
 * You may not use this file except in compliance with the License.
 * You may obtain a copy of the License at: https://www.gnu.org/licenses/lgpl-3.0.en.html
 *
 * All methods use:
 *
 * Pressure in hPa
 *
 * Temperature in °C
 *
 * Height in meters
 *
 * Relative humidity in % from 0 to 100
 *
 * Specific humidity in g/kg
 *
 * Mixing ratio in g/kg
 */
export const velitherm = 'velitherm';

/**
 * Earth's average gravity acceleration (m/s2)
 *
 * @const
 * @type {number}
 */
export const G = 9.81;

/**
 * The thermal capacity of air (J/kg)
 *
 * @const
 * @type {number}
 */
export const Cp = 1005;

/**
 * The enthalpy of vaporization of water (J/kg)
 *
 * @const
 * @type {number}
 */
export const L = 2500 * 10e6;

/**
 * The adiabatic lapse rate of dry air (°C/m)
 *
 * @const
 * @type {number}
 */
export const gamma = 0.00976;

/**
 * The average sea level pressure (hPa)
 *
 * @const
 * @type {number}
 */
export const P0 = 1013.25;

/**
 * The temperature of the ICAO standard atmosphere (°C)
 *
 * @const
 * @type {number}
 */
export const T0 = 15;

/**
 * The specific gas constant of dry air J/(kg*K)
 *
 * @const
 * @type {number}
 */
export const Rd = 287.058;

/**
 * The specific gas constant of water vapor J/(kg*K)
 *
 * @const
 * @type {number}
 */
export const Rv = 461.495;

/**
 * Molar mass of dry air kg/mol
 *
 * @const
 * @type {number}
 */
export const Md = 0.0289652;

/**
 * Molar mass of water vapor kg/mol
 *
 * @const
 * @type {number}
 */
export const Mv = 0.018016;

/**
 * Universal gas constant J/(kg*mol)
 *
 * @const
 * @type {number}
 */
export const R = 8.31446;

/**
 * Altitude from pressure using the barometric formula and ICAO's definition of standard atmosphere.
 *
 * This is a very rough approximation that is an ICAO standard. It is used when calculating QNH.
 * It does not take into account the pressure and temperature of the day.
 *
 * @param {number} pressure Pressure
 * @param {number} [pressure0] Optional sea-level pressure of the day
 * @returns {number}
 */
export function altitudeFromStandardPressure(pressure: number, pressure0: number = P0): number {
  pressure0 = pressure0 ?? P0;
  return 44330.0 * (1.0 - Math.pow(pressure / pressure0, 1 / 5.255));
}

/**
 * Pressure from altitude using the barometric formula and ICAO's definition of standard atmosphere.
 *
 * This is a very rough approximation that is an ICAO standard. It is used when calculating QNH.
 * It does not take into account the pressure and temperature of the day.
 *
 * @param {number} height Height
 * @param {number} [pressure0] Optional sea-level pressure of the day
 * @returns {number}
 */
export function pressureFromStandardAltitude(height: number, pressure0: number = P0): number {
  pressure0 = pressure0 ?? P0;
  return pressure0 * Math.pow(1 - height / 44330.0, 5.255);
}

/**
 * Altitude from pressure using the hypsometric formula.
 *
 * This is a better equation that takes into account the pressure and the temperature of the day.
 * It is not a standard and different weather institutions use slightly different parameters.
 * It is used when calculating the QFF.
 *
 * @param {number} pressure Pressure
 * @param {number} [pressure0] Optional sea-level pressure of the day
 * @param {number} [temp] Optional average temperature from the ground to the given level
 * @returns {number}
 */
export function altitudeFromPressure(pressure: number, pressure0: number = P0, temp: number = T0): number {
  temp = temp ?? T0;
  return Math.round((Math.pow(pressure0 / pressure, 1.0 / 5.257) - 1) * (temp + 273.15) / 0.0065);
}

/**
 * Pressure from altitude using the hypsometric formula.
 *
 * This is a better equation that takes into account the pressure and the temperature of the day.
 * It is not a standard and different weather institutions use slightly different parameters.
 * It is used when calculating the QFF.
 *
 * @param {number} height Height
 * @param {number} [pressure0] Optional sea-level pressure of the day
 * @param {number} [temp] Optional average temperature from the ground to the given level
 * @returns {number}
 */
export function pressureFromAltitude(height: number, pressure0: number = P0, temp: number = T0): number {
  pressure0 = pressure0 ?? P0;
  temp = temp ?? T0;
  return Math.round(pressure0 * Math.pow(1.0 - 0.0065 * height / (temp + 273.15 + 0.0065 * height), 5.257));
}

/**
 * (Saturation) Water vapor pressure.
 *
 * Clausius–Clapeyron equation - the most fundamental equation in weather science.
 *
 * This is the Magnus-Tetens approximation.
 *
 * @param {number} temp Temperature
 * @returns {number}
 */
export function waterVaporSaturationPressure(temp: number = T0): number {
  temp = temp ?? T0;

  return 6.1078 * Math.exp(17.27 * temp / (temp + 237.3));
}

/**
 * Relative humidity from specific humidity.
 *
 * @param {number} specificHumidity Specific humidity
 * @param {number} [pressure] Optional pressure
 * @param {number} [temp] Optional temperature
 * @returns {number}
 */
export function relativeHumidity(specificHumidity: number, pressure: number = P0, temp: number = T0): number {
  pressure = pressure ?? P0;
  temp = temp ?? T0;
  return specificHumidity / (6.22 * waterVaporSaturationPressure(temp) / pressure);
}

/**
 * Dew point from relative humidity.
 *
 * Approximation of the Magnus equation with the Sonntag 1990 coefficients.
 *
 * @param {number} relativeHumidity Relative humidity
 * @param {number} [temp] Optional temperature
 * @returns {number}
 */
export function dewPoint(relativeHumidity: number, temp: number = T0): number {
  temp = temp ?? T0;

  const b = 17.62;
  const c = 243.12;

  const gamma = Math.log(relativeHumidity / 100) + b * temp / (c + temp);

  return c * gamma / (b - gamma);
}

/**
 * Relative humidity from dew point.
 *
 * Approximation of the Magnus equation with the Sonntag 1990 coefficients.
 *
 * @param {number} dewPoint Relative humidity
 * @param {number} [temp] Optional temperature
 * @returns {number}
 */
export function relativeHumidityFromDewPoint(dewPoint: number, temp: number = T0): number {
  temp = temp ?? T0;

  const b = 17.62;
  const c = 243.12;

  const gamma = dewPoint * b / (dewPoint + c);

  return Math.exp(gamma - b * temp / (c + temp)) * 100;
}

/**
 * Mixing ratio from specific humidity.
 *
 * @param {number} specificHumidity Specific humidity
 * @returns {number}
 */
export const mixingRatio = (specificHumidity: number) => specificHumidity / (1 - specificHumidity / 1000);

/**
 * Specific humidity from mixing ratio.
 *
 * @param {number} mixingRatio Mixing ratio
 * @returns {number}
 */
export const specificHumidityFromMixingRatio = (mixingRatio: number) => mixingRatio / (1 + mixingRatio / 1000);

/**
 * Specific humidity from relative humidity.
 *
 * @param {number} relativeHumidity Relative humidity
 * @param {number} [pressure] Optional pressure
 * @param {number} [temp] Optional temperature
 * @returns {number}
 */
export function specificHumidity(relativeHumidity: number, pressure: number = P0, temp: number = T0): number {
  pressure = pressure ?? P0;
  temp = temp ?? T0;
  return relativeHumidity / 100 * (0.622 * waterVaporSaturationPressure(temp) / pressure) * 1000;
}

/**
 * Air density.
 *
 * @param {number} relativeHumidity Relative humidity
 * @param {number} [pressure] Optional pressure
 * @param {number} [temp] Optional temperature
 * @returns {number}
 */
export function airDensity(relativeHumidity: number, pressure: number = P0, temp: number = T0): number {
  pressure = pressure ?? P0;
  temp = temp ?? T0;

  const Psat = waterVaporSaturationPressure(temp);
  const Pv = relativeHumidity / 100 * Psat;
  const Pd = pressure - Pv;

  return 100 * (Pd * Md + Pv * Mv) / (R * (temp + 273.15));
}

/**
 * Lifted Condensation Level.
 *
 * This is the altitude at which a mechanically lifted air parcel from the ground will condensate.
 *
 * It corresponds to the cloud base level when the clouds are formed by mechanical lifting.
 *
 * This is the Espy equation with the Stull coefficient.
 *
 * @param {number} temp Temperature at 2m
 * @param {number} dewPoint Dew point at 2m
 * @returns {number}
 */
export const LCL = (temp: number, dewPoint: number) => 126.7 * (temp - dewPoint);

/**
 * Moist adiabatic lapse rate from pressure and temperature.
 *
 * (Roland Stull, Practical Meteorology)
 *
 * @param {number} temp Temperature
 * @param {number} [pressure] Optional pressure
 * @returns {number}
 */
export function gammaMoist(temp: number, pressure: number = P0): number {
  pressure = pressure ?? P0;

  const tK = temp + 273.15;
  const es = 6.113 * Math.exp(5423 * (1 / 273.15 - 1 / tK));
  const rs = 0.622 * es / (pressure - es);
  const gamma = 9.8e-3 * (1 + 8711 * rs / tK) / (1 + 1.35e7 * rs / (tK * tK));

  return gamma;
}
