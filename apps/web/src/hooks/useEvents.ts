import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getEventList,
  getEventDetail,
  getEventTypes,
  createEvent,
  updateEvent,
  deleteEvent,
} from "@/services/events.service";
import type { CreateEventInput, UpdateEventInput } from "@/types/event";

/**
 * イベント一覧を取得
 */
export const useEventList = () => {
  return useQuery({
    queryKey: ["events", "list"],
    queryFn: getEventList,
  });
};

/**
 * イベント詳細を取得
 */
export const useEventDetail = (eventId: string) => {
  return useQuery({
    queryKey: ["events", "detail", eventId],
    queryFn: () => getEventDetail(eventId),
    enabled: !!eventId,
  });
};

/**
 * イベント種別一覧を取得
 */
export const useEventTypes = () => {
  return useQuery({
    queryKey: ["events", "types"],
    queryFn: getEventTypes,
  });
};

/**
 * イベント作成
 */
export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateEventInput) => createEvent(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events", "list"] });
    },
  });
};

/**
 * イベント更新
 */
export const useUpdateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateEventInput) => updateEvent(input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["events", "list"] });
      queryClient.invalidateQueries({
        queryKey: ["events", "detail", variables.eventId],
      });
    },
  });
};

/**
 * イベント削除
 */
export const useDeleteEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: string) => deleteEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events", "list"] });
    },
  });
};
