import { Alert, Platform } from "react-native";

export function showAlert(title: string, message?: string): void {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined" && typeof window.alert === "function") {
      window.alert(message ?? title);
      return;
    }
  }
  Alert.alert(title, message);
}

export function confirmAction(
  title: string,
  message: string,
  onConfirm: () => void,
  okLabel = "OK",
  cancelLabel = "Cancel"
): void {
  if (Platform.OS === "web" && typeof window !== "undefined" && typeof window.confirm === "function") {
    if (window.confirm(message)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: cancelLabel, style: "cancel" },
    { text: okLabel, onPress: () => onConfirm() },
  ]);
}