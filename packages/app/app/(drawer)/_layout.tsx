import { Drawer } from "expo-router/drawer";
import { t } from "../../src/i18n";

export default function DrawerLayout() {
  return (
    <Drawer
      screenOptions={{
        drawerActiveTintColor: "#4A90D9",
        drawerInactiveTintColor: "#666",
        headerStyle: { backgroundColor: "#4A90D9" },
        headerTintColor: "#fff",
      }}
    >
      <Drawer.Screen name="dashboard" options={{ title: t("nav.dashboard"), drawerLabel: t("nav.dashboard") }} />
      <Drawer.Screen name="calendar" options={{ title: t("nav.calendar"), drawerLabel: t("nav.calendar") }} />
      <Drawer.Screen name="patients/index" options={{ title: t("nav.patients"), drawerLabel: t("nav.patients") }} />
      <Drawer.Screen name="payments/index" options={{ title: t("nav.payments"), drawerLabel: t("nav.payments") }} />
      <Drawer.Screen name="reports" options={{ title: t("nav.reports"), drawerLabel: t("nav.reports") }} />
      <Drawer.Screen name="settings" options={{ title: t("nav.settings"), drawerLabel: t("nav.settings") }} />
    </Drawer>
  );
}
