"use client";
import { useSyncExternalStore } from "react";
import { getBook, getServerBook, subscribeBook } from "@/lib/wrongBook";

export const useWrongBook = () => useSyncExternalStore(subscribeBook, getBook, getServerBook);
const noop = () => () => {};
/** true sau khi chạy ở trình duyệt (sổ chỉ có trên máy, server luôn thấy sổ rỗng). */
export const useMounted = () => useSyncExternalStore(noop, () => true, () => false);
