import type { APIRoute, GetStaticPaths } from 'astro';
import { getRoomOnePager } from '../../../lib/api';
import { roomDocuments, type RoomDocument } from '../../../lib/rooms/load';

export const getStaticPaths: GetStaticPaths = async () =>
  (await roomDocuments()).map((document) => ({
    params: { slug: document.slug, document: document.file.replace(/\.pdf$/, '') },
    props: document,
  }));

export const GET: APIRoute = async ({ props }) => {
  const { candidate } = props as RoomDocument;
  return new Response(await getRoomOnePager(candidate.candidacyId), {
    headers: { 'Content-Type': 'application/pdf' },
  });
};
