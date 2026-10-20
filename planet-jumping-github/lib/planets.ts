export interface Planet {
  id: string; name: string; size: number; spin: number; glow: string; blurb: string;
  facts: [string, string][];
}

export const planets: Planet[] = [
  { id: 'mercury', name: 'Mercury', size: 0.55, spin: 4, glow: '170,160,150', blurb: 'The smallest planet and the closest to the Sun. It has almost no air to hold heat, so days burn and nights freeze.',
    facts: [['Distance:', '57.9 million km from the Sun (0.39 AU).'], ['Diameter:', '4,879 km.'], ['Day:', 'One rotation takes about 59 Earth days.'], ['Year:', '88 Earth days.'], ['Temperature:', 'From -180 °C at night to 430 °C by day.'], ['Moons:', 'None.'], ['Atmosphere:', 'Almost none, only a very thin exosphere.']] },
  { id: 'venus', name: 'Venus', size: 0.82, spin: -3, glow: '240,200,130', blurb: 'Earth\u2019s twin in size, but a runaway greenhouse world. It spins backwards, very slowly, under thick acid clouds.',
    facts: [['Distance:', '108.2 million km from the Sun (0.72 AU).'], ['Diameter:', '12,104 km.'], ['Day:', 'One rotation takes 243 Earth days, backwards.'], ['Year:', '225 Earth days.'], ['Temperature:', 'Around 465 °C, the hottest planet.'], ['Moons:', 'None.'], ['Atmosphere:', 'About 96% carbon dioxide, with sulfuric acid clouds.']] },
  { id: 'earth', name: 'Earth', size: 0.86, spin: 14, glow: '110,170,255', blurb: 'The only world known to host life. Liquid water covers most of the surface, and the atmosphere shields it from space.',
    facts: [['Distance:', '149.6 million km from the Sun (1 AU).'], ['Diameter:', '12,742 km.'], ['Day:', '24 hours.'], ['Year:', '365.25 days.'], ['Temperature:', 'Average surface temperature around 15 °C.'], ['Moons:', '1, the Moon.'], ['Atmosphere:', 'About 78% nitrogen and 21% oxygen.']] },
  { id: 'mars', name: 'Mars', size: 0.66, spin: 14, glow: '230,130,90', blurb: 'A cold red desert with the tallest volcano in the solar system, Olympus Mons, and the longest canyon system, Valles Marineris.',
    facts: [['Distance:', 'About 228 million km from the Sun (1.5 AU).'], ['Diameter:', '6,779 km.'], ['Day:', '24 hours 37 minutes.'], ['Year:', '687 Earth days.'], ['Temperature:', 'Around -60 °C, down to -125 °C at the poles.'], ['Moons:', '2, Phobos and Deimos.'], ['Atmosphere:', 'Very thin, 95% carbon dioxide, with dust storms.']] },
  { id: 'jupiter', name: 'Jupiter', size: 1.12, spin: 30, glow: '240,210,170', blurb: 'The giant of the solar system, with more than twice the mass of all other planets combined. Its Great Red Spot is a storm older than 150 years.',
    facts: [['Distance:', '778.5 million km from the Sun (5.2 AU).'], ['Diameter:', '139,820 km.'], ['Day:', 'About 9.9 hours, the fastest spin of any planet.'], ['Year:', '11.9 Earth years.'], ['Temperature:', 'Around -110 °C at the cloud tops.'], ['Moons:', 'More than 90 known.'], ['Atmosphere:', 'Mostly hydrogen and helium.']] },
  { id: 'saturn', name: 'Saturn', size: 0.9, spin: 26, glow: '240,220,170', blurb: 'Best known for its bright rings of ice and rock. It is the least dense planet and would float in water if a bathtub were big enough.',
    facts: [['Distance:', '1.43 billion km from the Sun (9.6 AU).'], ['Diameter:', '116,460 km.'], ['Day:', 'About 10.7 hours.'], ['Year:', '29.4 Earth years.'], ['Temperature:', 'Around -140 °C at the cloud tops.'], ['Moons:', 'More than 270 known.'], ['Atmosphere:', 'Mostly hydrogen and helium.']] },
  { id: 'uranus', name: 'Uranus', size: 0.95, spin: -18, glow: '170,235,240', blurb: 'An ice giant that rolls around the Sun tipped on its side, so each pole gets about 42 years of sunlight, then 42 of darkness.',
    facts: [['Distance:', '2.87 billion km from the Sun (19.2 AU).'], ['Diameter:', '50,724 km.'], ['Day:', 'About 17 hours, spinning backwards.'], ['Year:', '84 Earth years.'], ['Temperature:', 'Around -195 °C, among the coldest atmospheres.'], ['Moons:', '29 known.'], ['Atmosphere:', 'Hydrogen, helium and methane, which gives the blue-green color.']] },
  { id: 'neptune', name: 'Neptune', size: 0.94, spin: 20, glow: '90,140,255', blurb: 'The most distant planet, a dark, windy ice giant. Its winds are the fastest in the solar system, reaching about 2,000 km/h.',
    facts: [['Distance:', '4.5 billion km from the Sun (30.1 AU).'], ['Diameter:', '49,244 km.'], ['Day:', 'About 16 hours.'], ['Year:', '165 Earth years.'], ['Temperature:', 'Around -200 °C.'], ['Moons:', '16 known.'], ['Atmosphere:', 'Hydrogen, helium and methane.']] },
];
