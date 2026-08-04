import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { t } from "../../src/i18n";
import { colors, radius, cardShadow } from "../../src/theme";

interface FaqItem {
  q: string;
  a: string;
}

const faqIds = ["1", "2", "3", "4", "5", "6", "7", "8"] as const;

const faqs: FaqItem[] = faqIds.map((n) => ({
  q: t(`help.faq${n}q`),
  a: t(`help.faq${n}a`),
}));

export default function Help() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>{t("help.title")}</Text>
        <Text style={styles.heroSubtitle}>{t("help.subtitle")}</Text>
      </View>

      {faqs.map((item, index) => {
        const open = openIndex === index;
        return (
          <TouchableOpacity
            key={index}
            style={[styles.card, open && styles.cardOpen]}
            onPress={() => setOpenIndex(open ? null : index)}
            activeOpacity={0.85}
          >
            <View style={styles.questionRow}>
              <Text style={styles.question}>{item.q}</Text>
              <Text style={[styles.chevron, open && styles.chevronOpen]}>›</Text>
            </View>
            {open && <Text style={styles.answer}>{item.a}</Text>}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  hero: { padding: radius.xl, paddingBottom: radius.lg },
  heroTitle: { fontSize: 24, fontWeight: "700", color: colors.primaryDark },
  heroSubtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 6, lineHeight: 20 },
  card: {
    backgroundColor: colors.surface,
    marginHorizontal: radius.lg,
    marginBottom: radius.md,
    borderRadius: radius.md,
    padding: radius.lg,
    ...cardShadow,
  },
  cardOpen: { borderLeftWidth: 4, borderLeftColor: colors.primary },
  questionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  question: { fontSize: 15, fontWeight: "600", color: colors.text, flex: 1, paddingRight: radius.md },
  chevron: { fontSize: 22, color: colors.textMuted, transform: [{ rotate: "90deg" }] },
  chevronOpen: { color: colors.primary, transform: [{ rotate: "270deg" }] },
  answer: { fontSize: 14, color: colors.textSecondary, marginTop: radius.md, lineHeight: 21 },
});
