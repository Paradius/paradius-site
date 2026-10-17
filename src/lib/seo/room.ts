import type { Room, RoomPosition } from '../api';
import { SITE_URL } from './constants';
import type { PageSeo } from './types';

/** Client rooms are private: reachable by their hidden address, never indexed. */
export function buildRoomSeo(room: Room, position?: RoomPosition, positionPath?: string): PageSeo {
  const name = position ? `${position.title} | ${room.client}` : `Talent room | ${room.client}`;
  const description = `Engineers Paradius presents to ${room.client}.`;
  return {
    title: `${name} | Paradius LLC`,
    description,
    canonical: `${SITE_URL}/room/${room.slug}/${positionPath ? `${positionPath}/` : ''}`,
    webPageName: name,
    webPageDescription: description,
    robots: 'noindex, nofollow',
  };
}
