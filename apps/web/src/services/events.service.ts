import { supabase } from "@/lib/supabase";
import type {
  EventListItem,
  EventDetail,
  EventType,
  CreateEventInput,
  UpdateEventInput,
} from "@/types/event";

/**
 * イベント一覧を取得
 */
export const getEventList = async (): Promise<EventListItem[]> => {
  const { data, error } = await supabase.functions.invoke("event_list", {
    method: "GET",
  });

  if (error) throw error;
  return data.events as EventListItem[];
};

/**
 * イベント詳細を取得
 */
export const getEventDetail = async (
  eventId: string
): Promise<EventDetail> => {
  const { data, error } = await supabase.functions.invoke("event_detail", {
    method: "GET",
    body: { eventId },
  });

  if (error) throw error;
  return data as EventDetail;
};

/**
 * イベント種別一覧を取得
 */
export const getEventTypes = async (): Promise<EventType[]> => {
  const { data, error } = await supabase.functions.invoke("get_event_types", {
    method: "GET",
  });

  if (error) throw error;
  return data.eventTypes as EventType[];
};

/**
 * イベントを作成（運営のみ）
 */
export const createEvent = async (
  input: CreateEventInput
): Promise<{ eventId: string }> => {
  const { data, error } = await supabase.functions.invoke("event_create", {
    body: input,
  });

  if (error) throw error;
  return data;
};

/**
 * イベントを更新（運営のみ）
 */
export const updateEvent = async (
  input: UpdateEventInput
): Promise<void> => {
  const { error } = await supabase.functions.invoke("event_update", {
    body: input,
  });

  if (error) throw error;
};

/**
 * イベントを削除（運営のみ）
 */
export const deleteEvent = async (eventId: string): Promise<void> => {
  const { error } = await supabase.functions.invoke("event_delete", {
    body: { eventId },
  });

  if (error) throw error;
};
