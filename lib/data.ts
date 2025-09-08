"use client";

import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { get, MessagesPage, RoomsListResponse } from "./api";

export function useRoomsQuery() {
  return useQuery({
    queryKey: ["rooms"],
    queryFn: () => get<RoomsListResponse>("/rooms"),
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  });
}

export function useRoomMessagesInfinite(roomId: string | null, limit = 30) {
  return useInfiniteQuery({
    queryKey: ["messages", roomId, limit],
    enabled: !!roomId,
    queryFn: async ({ pageParam }) => {
      const cursor = pageParam ? `&cursor=${encodeURIComponent(String(pageParam))}` : "";
      return get<MessagesPage>(`/rooms/${roomId}/messages?limit=${limit}${cursor}`);
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    refetchOnWindowFocus: false,
  });
}

