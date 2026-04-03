export interface Characteristic {
  value: string;
  revealed: boolean;
  explanation?: string;
}

export interface Biology {
  age: number | null;
  gender: string;
  revealed: boolean;
  explanation?: string;
}

export interface Characteristics {
  profession: Characteristic;
  health: Characteristic;
  hobby: Characteristic;
  phobia: Characteristic;
  biology: Biology;
  fact: Characteristic;
  baggage: Characteristic;
  specialAction: Characteristic;
}

export interface Player {
  uid: string;
  name: string;
  characteristics: Characteristics;
  isAlive: boolean;
  votes: number;
  isMuted: boolean;
  isTalking: boolean;
}

export interface Catastrophe {
  title: string;
  description: string;
  outsideCondition: string;
  future: string;
}

export interface Room {
  id: string;
  status: 'lobby' | 'playing' | 'ended';
  phase: 'lobby' | 'playing' | 'defense' | 'discussion' | 'voting' | 'ended';
  catastrophe: Catastrophe | null;
  bunkerConditions: string[];
  revealedBunkerConditions: number;
  hostId: string;
  currentRound: number;
  createdAt: any;
  activeSpeakerId?: string;
  phaseEndTime?: any;
  discussionEndVotes?: string[];
}
