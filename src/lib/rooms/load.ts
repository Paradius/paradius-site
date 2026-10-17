import { getRooms, type Room, type RoomCandidate, type RoomPosition } from '../api';
import { onePagerFile, positionSlug } from './rooms';

export type RoomPositionPage = {
  room: Room;
  position: RoomPosition;
  path: string;
};

export type RoomDocument = {
  slug: string;
  file: string;
  candidate: RoomCandidate;
};

export async function roomPositionPages(): Promise<RoomPositionPage[]> {
  return (await getRooms()).flatMap((room) =>
    room.positions.map((position) => ({ room, position, path: positionSlug(position.title) })),
  );
}

export async function roomDocuments(): Promise<RoomDocument[]> {
  return (await roomPositionPages()).flatMap(({ room, position, path }) =>
    position.candidates
      .filter((candidate) => candidate.onePager)
      .map((candidate) => ({ slug: room.slug, file: onePagerFile(candidate.code, path), candidate })),
  );
}
