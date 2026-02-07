import { format, parseISO } from "date-fns";
import { ja } from "date-fns/locale";

/**
 * 日付をフォーマット
 * @param dateString ISO形式の日付文字列
 * @param formatString フォーマット文字列（デフォルト: "yyyy/MM/dd (E) HH:mm"）
 */
export const formatDate = (
  dateString: string,
  formatString: string = "yyyy/MM/dd (E) HH:mm"
): string => {
  try {
    const date = parseISO(dateString);
    return format(date, formatString, { locale: ja });
  } catch (error) {
    console.error("日付のフォーマットに失敗しました:", error);
    return dateString;
  }
};

/**
 * 日付を短い形式でフォーマット（年月日のみ）
 */
export const formatDateShort = (dateString: string): string => {
  return formatDate(dateString, "yyyy/MM/dd (E)");
};

/**
 * 時刻のみをフォーマット
 */
export const formatTime = (dateString: string): string => {
  return formatDate(dateString, "HH:mm");
};
