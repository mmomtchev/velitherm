import * as velitherm from 'velitherm';

// When the air rises, its specific humidity remains constant
const q = velitherm.specificHumidity(75, 1017, 25);
console.log('Specific humidity = ', Math.round(q), 'g/kg');
console.log('Dew point = ', velitherm.dewPoint(75, 25).toFixed(2), '°C');

// Find the current pressure at 500m AMSL
const P1 = velitherm.pressureFromAltitude(500, 1017, 25);
console.log('Pressure at 500m = ', Math.round(P1), 'hPa');

// Take into account the dry adiabatic cooling over 500m
const T1 = 25 - 500 * velitherm.gamma;
console.log('The new temperature of the air parcel at 500m = ', T1, '°C');

// Compute the new relative humidity of the air parcel at this pressure and
// temperature
const w1 = velitherm.relativeHumidity(q, P1, T1);
console.log('Relative humidity after rising to 500m = ', Math.round(w1), '%');

// If the air parcel has reached 100% relative humidity, then there is
// condensation
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
