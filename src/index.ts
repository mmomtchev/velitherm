/**
 * velivole.fr/meteo.guru Basic Thermodynamics Equations for Soaring Flight
 *
 * Copyright © 2022 Momtchil Momtchev <momtchil@momtchev.com>
 *
 * Licensed under the LGPL License, Version 3.0 (the "License")
 * You may not use this file except in compliance with the License.
 * You may obtain a copy of the License at:
 * https://www.gnu.org/licenses/lgpl-3.0.en.html
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
export const L = 2.5e6;

/**
 * The adiabatic lapse rate of dry air (°C/m)
 *
 * This is the rate of cooling of a rising air parcel
 * without water vapor condensation.
 * 
 * See gammaMoist() for the condensation case.
 *
 * @const
 * @type {number}
 */
export const gamma = 0.00976;

/**
 * Mean environmental lapse rate of the troposphere (°C/m)
 *
 * This is the mean rate of cooling of the troposphere when
 * the air is calm and stable. It works best over large
 * height differences. It is also the lapse rate of the
 * standard atmosphere.
 *
 * @const
 * @type {number}
 */
export const ELR = 0.0065;

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
 * Absolute zero in °C
 *
 * @const
 * @type {number}
 */
export const K = -273.15;


/**
 * Number of feets in one meter
 *
 * @const
 * @type {number}
 */
export const feetPerMeter = 3.28084;


/**
 * Altitude from pressure using the barometric formula and ICAO's definition
 * of standard atmosphere.
 *
 * This is a very rough approximation that is an ICAO standard.
 * It is used when calculating QNH.
 * It does not take into account the pressure and temperature of the day.
 *
 * @param {number} pressure Pressure
 * @param {number} [pressure0] Optional sea-level pressure of the day
 * @returns {number}
 */
export function altitudeFromStandardPressure(
  pressure: number, pressure0: number = P0): number {
  return 44330.0 * (1.0 - Math.pow(pressure / pressure0, 1 / 5.255));
}

/**
 * Pressure from altitude using the barometric formula and ICAO's definition
 * of standard atmosphere.
 *
 * This is a very rough approximation that is an ICAO standard. It is used
 * when calculating QNH.
 * It does not take into account the pressure and temperature of the day.
 *
 * @param {number} height Height
 * @param {number} [pressure0] Optional sea-level pressure of the day
 * @returns {number}
 */
export function pressureFromStandardAltitude(
  height: number, pressure0: number = P0): number {
  return pressure0 * Math.pow(1 - height / 44330.0, 5.255);
}

/**
 * Altitude from pressure using the hypsometric formula.
 *
 * This is a better equation that takes into account the pressure and the
 * temperature of the day.
 * It is not a standard and different weather institutions use slightly
 * different parameters.
 * It is used when calculating the QFF.
 *
 * @param {number} pressure Pressure
 * @param {number} [pressure0] Optional sea-level pressure of the day
 * @param {number} [temp] Optional average temperature from the ground
 *                        to the given level
 * @returns {number}
 */
export function altitudeFromPressure(
  pressure: number, pressure0: number = P0, temp: number = T0): number {
  return 29.3 * (temp - K) * Math.log(pressure0 / pressure);
}

/**
 * Pressure from altitude using the hypsometric formula.
 *
 * This is a better equation that takes into account the pressure and
 * the temperature of the day.
 * It is not a standard and different weather institutions use slightly
 * different parameters.
 * It is used when calculating the QFF.
 *
 * @param {number} height Height
 * @param {number} [pressure0] Optional sea-level pressure of the day
 * @param {number} [temp] Optional average temperature from the ground
 *                        to the given level
 * @returns {number}
 */
export function pressureFromAltitude(
  height: number, pressure0: number = P0, temp: number = T0): number {
  return pressure0 / Math.exp(height / (29.3 * (temp - K)));
}

/**
 * (Saturation) Water vapor pressure.
 *
 * Clausius–Clapeyron equation - the most fundamental equation in weather
 * science.
 *
 * This is the Magnus-Tetens approximation.
 *
 * @param {number} temp Temperature
 * @returns {number}
 */
export function waterVaporSaturationPressure(temp: number = T0): number {
  return 6.1078 * Math.exp(17.27 * temp / (temp + 237.3));
}

/**
 * Relative humidity from specific humidity.
 *
 * This is from the Magnus-Tetens approximation.
 *
 * @param {number} specificHumidity Specific humidity
 * @param {number} [pressure] Optional pressure
 * @param {number} [temp] Optional temperature
 * @returns {number}
 */
export function relativeHumidity(
  specificHumidity: number, pressure: number = P0, temp: number = T0): number {
  return specificHumidity / (6.22 * waterVaporSaturationPressure(temp) /
    pressure);
}

const Sonntag_1990_b = 17.62;
const Sonntag_1990_c = 243.12;
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
  const gamma = Math.log(relativeHumidity / 100) + Sonntag_1990_b * temp /
    (Sonntag_1990_c + temp);

  return Sonntag_1990_c * gamma / (Sonntag_1990_b - gamma);
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
export function relativeHumidityFromDewPoint(
  dewPoint: number, temp: number = T0): number {
  const gamma = dewPoint * Sonntag_1990_b / (dewPoint + Sonntag_1990_c);

  return Math.exp(gamma - Sonntag_1990_b * temp /
    (Sonntag_1990_c + temp)) * 100;
}

/**
 * Mixing ratio from specific humidity.
 *
 * Analytic equation from the definition.
 *
 * @param {number} specificHumidity Specific humidity
 * @returns {number}
 */
export function mixingRatio(specificHumidity: number) {
  return specificHumidity / (1 - specificHumidity / 1000);
}

/**
 * Specific humidity from mixing ratio.
 *
 * Analytic equation from the definition.
 *
 * @param {number} mixingRatio Mixing ratio
 * @returns {number}
 */
export function specificHumidityFromMixingRatio(mixingRatio: number) {
  return mixingRatio / (1 + mixingRatio / 1000);
}

/**
 * Specific humidity from relative humidity.
 *
 * Approximation of the Magnus equation with the Sonntag 1990 coefficients.
 *
 * @param {number} relativeHumidity Relative humidity
 * @param {number} [pressure] Optional pressure
 * @param {number} [temp] Optional temperature
 * @returns {number}
 */
export function specificHumidity(
  relativeHumidity: number, pressure: number = P0, temp: number = T0): number {
  return relativeHumidity / 100 *
    (0.622 * waterVaporSaturationPressure(temp) / pressure) * 1000;
}

/**
 * Air density.
 *
 * Analytic equation from Avogadro's Law.
 *
 * @param {number} relativeHumidity Relative humidity
 * @param {number} [pressure] Optional pressure
 * @param {number} [temp] Optional temperature
 * @returns {number}
 */
export function airDensity(
  relativeHumidity: number, pressure: number = P0, temp: number = T0): number {
  const Psat = waterVaporSaturationPressure(temp);
  const Pv = relativeHumidity / 100 * Psat;
  const Pd = pressure - Pv;

  return 100 * (Pd * Md + Pv * Mv) / (R * (temp - K));
}

/**
 * Lifted Condensation Level.
 *
 * This is the altitude at which a mechanically lifted air parcel from
 * the ground will condensate.
 *
 * It corresponds to the cloud base level when the clouds are formed by
 * mechanical lifting.
 *
 * This approximation is known as the Espy equation with the Stull coefficient.
 *
 * @param {number} temp Temperature at 2m
 * @param {number} dewPoint Dew point at 2m
 * @returns {number}
 */
export function LCL(temp: number, dewPoint: number) {
  return 126.7 * (temp - dewPoint);
}

/**
 * Moist adiabatic lapse rate from pressure and temperature.
 *
 * Copied from Roland Stull, Practical Meteorology
 * (copylefted, available online).
 *
 * Rather complex approximation based on the Magnus-Tetens equation and
 * the barometric equation.
 *
 * @param {number} temp Temperature
 * @param {number} [pressure] Optional pressure
 * @returns {number}
 */
export function gammaMoist(temp: number, pressure: number = P0): number {
  const tK = temp - K;
  const es = 6.113 * Math.exp(5423 * (-1 / K - 1 / tK));
  const rs = 0.622 * es / (pressure - es);
  const gamma = G * 1e-3 * (1 + 8711 * rs / tK) / (1 + 1.35e7 * rs / (tK * tK));

  return gamma;
}

const HCR = 1.4;
/**
 * Adiabatic expansion rate from pressure change rate.
 *
 * This equation allows to calculate the expansion ratio of an air parcel
 * from the the previous pressure and the new pressure.
 *
 * An adiabatic expansion is an isentropic process that is governed by
 * the Ideal gas law in general and the constant entropy relationship in
 * particular:
 * (P / P0) = (V / V0) ^ gamma
 * Where P=pressure, V=volume, gamma=heat capacity ratio (1.4 for air,
 * a diatomic gas)
 *
 * Analytic equation.
 *
 * @param {number} volume0 Old volume
 * @param {number} pressure New pressure
 * @param {number} pressure0 Old pressure
 * @returns {number}
 */
export function adiabaticExpansion(
  volume0: number, pressure: number, pressure0: number = P0): number {
  return volume0 * Math.pow(pressure0 / pressure, 1 / HCR);
}

/**
 * Adiabatic cooling rate from pressure change rate.
 *
 * This equation allows to calculate the cooling ratio of an air parcel from the
 * the previous pressure and the new pressure.
 *
 * It is by combining this equation with the barometric equation
 * that the adiabatic lapse rate of dry air can be obtained.
 *
 * An adiabatic expansion is an isentropic process that is governed by
 * the Ideal gas law in general and the constant entropy relationship
 * in particular:
 * (P / P0) = (V / V0) ^ gamma
 * Where P=pressure, V=volume, gamma=heat capacity ratio (1.4 for air,
 * a diatomic gas)
 *
 * Keep in mind that if you intend to use this method to calculate a rate
 * relative to height in meters, you will need very precise altitude
 * calculations for good results. As the dry adiabatic rate is a constant
 * that does not depend on the temperature or the pressure, most of the time
 * you will be better off simply using the `gamma` constant.
 *
 * https://en.wikipedia.org/wiki/Ideal_gas_law contains a very good
 * introduction to this subject.
 *
 * Analytic equation.
 *
 * @example
 * // Compute the adiabatic cooling per meter
 * // when rising from 0m AMSL to 100m AMSL starting at 15°C
 *
 * const gamma = (15 - velitherm.adiabaticCooling(15,
 *                       velitherm.pressureFromStandardAltitude(100),
 *                       velitherm.pressureFromStandardAltitude(0))
 *                ) / 100;
 *
 * // It should be very close to the provided constant
 * assert(Math.abs(gamma - velitherm.gamma) < 1e-5)
 *
 * @param {number} temp0 Old temperature
 * @param {number} pressure New pressure
 * @param {number} pressure0 Old pressure
 * @returns {number}
 */
export function adiabaticCooling(
  temp0: number, pressure: number, pressure0: number = P0): number {
  return (temp0 - K) * Math.pow(pressure / pressure0, (HCR - 1) / HCR) + K;
}

/**
 * Convert a Flight Level to pressure
 *
 * Flight levels are defined as pressure and not as a fixed
 * altitude. This means that a flight level can always be converted
 * to pressure without needing any other information in a fully
 * deterministic way.
  * 
 * A flight level of 115 means 11500 feet measured by barometer
 * using the ICAO standard atmosphere.
 * 
 * The returned pressure can then be converted to altitude using
 * any of the above functions, taking into account the MSL pressure and
 * temperature variations.
 *
 * @param {number} FL Flight Level
 * @returns {number}
 */
export function pressureFromFL(FL: number): number {
  return pressureFromStandardAltitude(FL * 100 / feetPerMeter, P0);
}

/**
 * Convert pressure to Flight Level.
 *
 * Flight levels are defined as pressure and not as a fixed
 * altitude. This means that a flight level can always be converted
 * to pressure without needing any other information in a fully
 * deterministic way.
  * 
 * A flight level of 115 means 11500 feet measured by barometer
 * using the ICAO standard atmosphere.
 * 
 * The returned Flight Level can be a fractional number, this should
 * be rounded to the closest integer as there are no fractional flight levels.
 *
 * @param {number} P pressure
 * @returns {number}
 */
export function FLFromPressure(P: number): number {
  return altitudeFromStandardPressure(P, P0) * feetPerMeter / 100;
}
