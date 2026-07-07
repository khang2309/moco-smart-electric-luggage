export type ToastType = "success" | "error" | "info";

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

export function showToast(message: string, type: ToastType = "success") {
  if (typeof window !== "undefined") {
    const event = new CustomEvent<ToastMessage>("moco-toast", {
      detail: {
        id: Math.random().toString(36).substring(2, 9),
        message,
        type,
      },
    });
    window.dispatchEvent(event);
  }
}
