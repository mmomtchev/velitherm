import * as velitherm from '..';

// When the air rises, its specific humidity remains constant
const q = velitherm.specificHumidity(75, 1017, 25);
console.log('Specific humidity = ', Math.round(q), 'g/kg');

// Find the current pressure at 500m AMSL
const P1 = velitherm.pressureFromAltitude(500, 1017, 25);
console.log('Pressure at 500m = ', Math.round(P1), 'hPa');

// Take into account the adiabatic cooling
const T1 = 25 - 500 * velitherm.gamma;
console.log('The new temperature of the air parcel at 500m = ', T1, '°C');

// Compute the new relative humidity of the air parcel at this pressure and temperature
const w1 = velitherm.relativeHumidity(q, P1, (T1 - 25) / 2);
console.log('Relative humidity after rising to 500m = ', Math.round(w1), '%');

// If the air parcel has reached 100% humidity, then there is condensation
if (w1 < 100) {
  console.log('No, it did not form a cloud');
} else {
  console.log('Yes, it did form a cloud');
}

if (T1 < 20) {
  console.log('The ceiling has been reached');
} else {
  console.log('The air parcel will continue to rise');
}
