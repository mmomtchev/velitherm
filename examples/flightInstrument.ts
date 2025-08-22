import * as velitherm from 'velitherm';

const barometerInput = 821;
const pressureMSL = 1017;
const temperatureBelow = 23;

// Rough estimate of the height using only the pressure
// We round it to 50m because it is a rough estimate
const alt = Math.round(velitherm.altitudeFromStandardPressure(barometerInput) /
  50) * 50;
console.log('Rough estimate of the altitude is', alt, 'm');

// Better estimate of the height using the ground pressure
const alt2 = Math.round(velitherm.altitudeFromPressure(barometerInput,
  pressureMSL));
console.log('Better estimate of the altitude is', alt2, 'm');

// Even better estimate of the height using the temperature
const alt3 = Math.round(velitherm.altitudeFromPressure(barometerInput,
  pressureMSL, temperatureBelow));
console.log('Even better estimate of the altitude is', alt3, 'm');

// Flight levels are in pressure-feet, so we do not need
// anything but the barometer input (this is the very reason for this)
const fl = velitherm.FLFromPressure(barometerInput);
console.log('The current closest flight level is FL', fl);

// What is the current altitude for FL115?
// FL115 means 11500 feet measured at pressure at standard atmospheric
// conditions
const pressureFL115 = velitherm.pressureFromFL(115);
console.log('FL115 means the altitude at which the pressure is',
  Math.round(pressureFL115), 'hPa');

// Get the actual altitude for today
const altitudeFL115 = Math.round(velitherm.altitudeFromPressure(
  pressureFL115, pressureMSL, temperatureBelow));
console.log('Today FL115 is at', altitudeFL115, 'm');
console.log('You can climb', altitudeFL115 - alt3, 'm before reaching FL115');

// Get the most pessimistic (lowest) possible estimate for FL115?
// This is possible only with a minimum pressure and a minimum air temperature
// We suppose that we are not flying in winter storm conditions
// Let's define these as 1000 hPa and -20°C
// You should never be flying in an ultralight aircraft is pressure
// is below 1000 hPa
const altitudeMinFL115 = Math.round(velitherm.altitudeFromPressure(
  pressureFL115, 1000, -20));
console.log('FL115 should not be below', altitudeMinFL115,
  'm even in bad winter weather');
console.log('You can climb', altitudeMinFL115 - alt3,
  'm before reaching the pessimistic estimate for FL115');
