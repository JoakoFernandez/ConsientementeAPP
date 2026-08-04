import { Drawer } from "expo-router/drawer";
import { t } from "../../src/i18n";
import { colors } from "../../src/theme";

export default function DrawerLayout() {
  return (
    <Drawer
      screenOptions={{
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.textSecondary,
        drawerActiveBackgroundColor: colors.primarySoft,
        drawerStyle: { backgroundColor: colors.surface },
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.white,
        sceneContainerStyle: { backgroundColor: colors.background },
        drawerLabelStyle: { fontWeight: "600" },
      }}
    >
      <Drawer.Screen name="dashboard" options={{ title: t("nav.dashboard"), drawerLabel: t("nav.dashboard") }} />
      <Drawer.Screen name="calendar" options={{ title: t("nav.calendar"), drawerLabel: t("nav.calendar") }} />
      <Drawer.Screen name="patients/index" options={{ title: t("nav.patients"), drawerLabel: t("nav.patients") }} />
      <Drawer.Screen name="patients/new" options={{ drawerItemStyle: { display: "none" } }} />
      <Drawer.Screen name="patients/edit" options={{ drawerItemStyle: { display: "none" } }} />
      <Drawer.Screen name="patients/[id]" options={{ drawerItemStyle: { display: "none" } }} />
      <Drawer.Screen name="payments/index" options={{ title: t("nav.payments"), drawerLabel: t("nav.payments") }} />
      <Drawer.Screen name="reports" options={{ title: t("nav.reports"), drawerLabel: t("nav.reports") }} />
      <Drawer.Screen name="help" options={{ title: t("nav.help"), drawerLabel: t("nav.help") }} />
      <Drawer.Screen name="settings" options={{ title: t("nav.settings"), drawerLabel: t("nav.settings") }} />
    </Drawer>
  );
}
