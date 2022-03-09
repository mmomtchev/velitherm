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
 * Mixing ration in g/kg
 */
export const velitherm = '1.0.0';

/**
 * @const
 * @type {number}
 * Earth's average gravity acceleration (m/s2)
 */
export const G = 9.81;

/**
 * @const
 * @type {number}
 * The thermal capacity of air (J/kg)
 */
export const Cp = 1005;

/**
 * @const
 * @type {number}
 * The enthalpy of vaporization of water (J/kg)
 */
export const L = 2500 * 10e6;

/**
 * @const
 * @type {number}
 * The adiabatic lapse rate of dry air (°C/m)
 */
export const gamma = 0.00976;

/**
 * @const
 * @type {number}
 * The average sea level pressure (hPa)
 */
export const P0 = 1013.25;

/**
 * @const
 * @type {number}
 * The temperature of the ICAO standard atmosphere (°C)
 */
export const T0 = 15;

/**
 * @const
 * @type {number}
 * The specific gas constant of dry air J/(kg*K)
 */
export const Rd = 287.058;

/**
 * @const
 * @type {number}
 * The specific gas constant of water vapor J/(kg*K)
 */
export const Rv = 461.495;

/**
 * @const
 * @type {number}
 * Molar mass of dry air kg/mol
 */
export const Md = 0.0289652;

/**
 * @const
 * @type {number}
 * Molar mass of water vapor kg/mol
 */
export const Mv = 0.018016;

/**
 * @const
 * @type {number}
 * Universal gas constant J/(kg*mol)
 */
export const R = 8.31446;

/**
 * Altitude from pressure using the barometric formula and ICAO's definition of standard atmosphere
 *
 * @param {number} pressure Pressure
 * @param {number} [pressure0] Optional sea-level pressure of the day, P0 otherwise
 * @returns {number}
 */
export function altitudeFromStandardPressure(pressure: number, pressure0: number = P0): number {
  pressure0 = pressure0 ?? P0;
  return 44330.0 * (1.0 - Math.pow(pressure / pressure0, 1 / 5.255));
}

/**
 * Pressure from altitude using the barometric formula and ICAO's definition of standard atmosphere
 *
 * @param {number} height Height
 * @param {number} [pressure0] Optional sea-level pressure of the day, P0 otherwise
 * @returns {number}
 */
export function pressureFromStandardAltitude(height: number, pressure0: number = P0): number {
  pressure0 = pressure0 ?? P0;
  return pressure0 * Math.pow(1 - height / 44330.0, 5.255);
}

/**
 * Altitude from pressure using the hypsometric formula
 *
 * @param {number} pressure Pressure
 * @param {number} [pressure0] Optional sea-level pressure of the day, P0 otherwise
 * @param {number} [temp] Optional temperature, T0 otherwise
 * @returns {number}
 */
export function altitudeFromPressure(pressure: number, pressure0: number, temp: number = T0): number {
  temp = temp ?? T0;
  return Math.round((Math.pow(pressure0 / pressure, 1.0 / 5.257) - 1) * (temp + 273.15) / 0.0065);
}

/**
 * Pressure from altitude using the hypsometric formula
 *
 * @param {number} height Height
 * @param {number} [pressure0] Optional sea-level pressure of the day, P0 otherwise
 * @param {number} [temp] Optional temperature, T0 otherwise
 * @returns {number}
 */
export function pressureFromAltitude(height: number, pressure0: number = P0, temp: number = T0): number {
  pressure0 = pressure0 ?? P0;
  temp = temp ?? T0;
  return Math.round(pressure0 * Math.pow(1.0 - 0.0065 * height / (temp + 273.15 + 0.0065 * height), 5.257));
}

/**
 * (Saturation) Water vapor pressure
 *
 * @param {number} temp Temperature
 * @returns {number}
 */
export function waterVaporSaturationPressure(temp: number = T0): number {
  temp = temp ?? T0;
  // Tetens equation
  return 6.1078 * Math.exp(17.27 * temp / (temp + 237.3));
}

/**
 * Relative humidity
 *
 * @param {number} specificHumidity Specific humidity
 * @param {number} [pressure] Optional pressure, P0 otherwise
 * @param {number} [temp] Optional temperature, T0 otherwise
 * @returns {number}
 */
export function relativeHumidity(specificHumidity: number, pressure: number = P0, temp: number = T0): number {
  pressure = pressure ?? P0;
  temp = temp ?? T0;
  return specificHumidity / (6.22 * waterVaporSaturationPressure(temp) / pressure);
}

/**
 * Mixing ratio
 *
 * @param {number} specificHumidity Specific humidity
 * @returns {number}
 */
export const mixingRatio = (specificHumidity: number) => specificHumidity / (1 - specificHumidity / 1000);

/**
 * Specific humidity
 *
 * @param {number} relativeHumidity Relative humidity
 * @param {number} [pressure] Optional pressure, P0 otherwise
 * @param {number} [temp] Optional temperature, T0 otherwise
 * @returns {number}
 */
export function specificHumidity(relativeHumidity: number, pressure: number = P0, temp: number = T0): number {
  pressure = pressure ?? P0;
  temp = temp ?? T0;
  return relativeHumidity / 100 * (0.622 * waterVaporSaturationPressure(temp) / pressure) * 1000;
}

/**
 * Air density
 *
 * @param {number} relativeHumidity Relative humidity
 * @param {number} [pressure] Optional pressure, P0 otherwise
 * @param {number} [temp] Optional temperature, T0 otherwise
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
