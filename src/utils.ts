import { 
  PROFESSIONS, 
  HEALTH_STATUS, 
  HOBBIES, 
  PHOBIAS, 
  GENDERS, 
  FACTS, 
  BAGGAGE,
  CATASTROPHES,
  BUNKER_CONDITIONS,
  SPECIAL_CARDS
} from './data';
import { Characteristics, Catastrophe } from './types';

const getRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

const generateAge = (): number => {
  const rand = Math.random();
  if (rand < 0.7) {
    // 70% chance for 20-40
    return Math.floor(Math.random() * 21) + 20;
  } else {
    // 30% chance for 41-120
    return Math.floor(Math.random() * 80) + 41;
  }
};

export const generateCharacteristics = (): Characteristics => {
  return {
    profession: { value: getRandom(PROFESSIONS), revealed: false },
    health: { value: getRandom(HEALTH_STATUS), revealed: false },
    hobby: { value: getRandom(HOBBIES), revealed: false },
    phobia: { value: getRandom(PHOBIAS), revealed: false },
    biology: { age: generateAge(), gender: getRandom(GENDERS), revealed: false },
    fact: { value: getRandom(FACTS), revealed: false },
    baggage: { value: getRandom(BAGGAGE), revealed: false },
    specialAction: { value: getRandom(SPECIAL_CARDS), revealed: false },
  };
};

export const getRandomCatastrophe = (): Catastrophe => {
  return CATASTROPHES[Math.floor(Math.random() * CATASTROPHES.length)];
};

export const getRandomBunkerConditions = (count: number = 5): string[] => {
  const shuffled = [...BUNKER_CONDITIONS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};
