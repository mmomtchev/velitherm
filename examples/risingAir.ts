import * as velitherm from '..';

// As the air rises, its specific humidity remains constant.
const q = velitherm.specificHumidity(80, 1017, 25);
console.log('Specific humidity = ', Math.round(q), 'g/kg');

// Find the current pressure at 500m AMSL
const P1 = velitherm.pressureFromAltitude(500, 1017, 25);
console.log('Pressure at 500m = ', Math.round(P1), 'hPa');

// Compute the new relative humidity of the air parcel at this pressure
const w1 = velitherm.relativeHumidity(q, P1, 22);
console.log('Relative humidity after rising to 500m = ', Math.round(w1), '%');

// If the air parcel has reached 100% humidity, there is condensation
if (w1 < 100) {
  console.log('No, it did not form a cloud');
} else {
  console.log('Yes, it did form a cloud');
}
