import { defaultJourney } from './calculator.js';

// These are editable examples, not surveyed station measurements. The original
// repository contains no station-specific distance data to restore.
export const stationPresets = [
  {
    id: 'verdaguer', station: { name: 'Verdaguer', fromLine: 'L4', toLine: 'L5' },
    values: { ...defaultJourney },
  },
  {
    id: 'passeig-de-gracia', station: { name: 'Passeig de Gràcia', fromLine: 'L3', toLine: 'L4' },
    values: { walkDistance: '320', escalatorDistance: '24', stairDistance: '8', walkwayLength: '60' },
  },
  {
    id: 'diagonal', station: { name: 'Diagonal', fromLine: 'L3', toLine: 'L5' },
    values: { walkDistance: '140', escalatorDistance: '20', stairDistance: '10', walkwayLength: '0' },
  },
  {
    id: 'catalunya', station: { name: 'Catalunya', fromLine: 'L1', toLine: 'L3' },
    values: { walkDistance: '90', escalatorDistance: '15', stairDistance: '6', walkwayLength: '0' },
  },
];
