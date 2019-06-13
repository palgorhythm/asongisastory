import scale from 'music-scale';

export default {
  minorScaleHigh: scale('minor', 'C4').concat(scale('minor', 'C5')),
  majorScaleHigh: scale('major', 'C4').concat(scale('major', 'C5')),
  minorScaleLow: scale('lydian', 'C3').concat(scale('minor', 'C4')),
  majorScaleLow: scale('lydian', 'C3').concat(scale('major', 'C4'))
};
