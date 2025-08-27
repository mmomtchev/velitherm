# Changelog

### [2.0.1]
 - Use the equation, coefficients and test tables from *Practical Meteorology, Roland Stull* for a slightly increased accuracy of the hypsometric equation
 - Add the mean environmental lapse rate of the troposphere constant

# [2.0.0] 2025-08-24
 - Add functions for working with flight levels
 - Improve the C compatibility

## [1.2.0] 2020-03-18
 - Add C/C++ support
 - Add `adiabaticCooling` and `adiabaticExpansion`
 - Do not round the results from `pressureFromAltitude` and `altitudeFromPressure`
 - Fix the latent heat of vaporization of water (2500 * 10e3 or 2.5e6)

## [1.1.0] 2022-03-10
 - Add `specificHumidityFromMixingRatio`
 - Add `dewPoint`
 - Add `relativeHumidityFromDewPoint`
 - Add `gammaMoist`
 - Add `LCL`
 - Add an example
 - Documentation improvements

# [1.0.0] 2022-03-09

 - First release
