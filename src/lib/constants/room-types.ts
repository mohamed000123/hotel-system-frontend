/** Room types allowed when creating or updating inventory (matches backend enum). */
export const ROOM_TYPE_OPTIONS = [
  'Standard Single',
  'Standard Double',
  'Deluxe King',
  'Junior Suite',
  'Family Room',
] as const;

export type RoomTypeLabel = (typeof ROOM_TYPE_OPTIONS)[number];
