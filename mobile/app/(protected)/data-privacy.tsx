import OverlayWrapper from "@/components/theme/OverlayWrapper";
import { useThemeStore } from "@/store/themeStore";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

export default function DataPrivacyScreen() {
  const { colors } = useThemeStore();
  const [downloadVisible, setDownloadVisible] = useState(false);

  const SectionTitle = ({ title }: { title: string }) => (
    <Text style={[styles.sectionTitle, { color: colors.text }]}>
      {title}
    </Text>
  );

  return (
    <OverlayWrapper
      colors={[colors.gradientTop, colors.gradientBottom]}
      overlayImage={require("@/assets/images/crayon_overlay.png")}
      overlayOpacity={0.02}
    >
      <View style={{ padding: 20 }}>
        {/* Back Button */}
        <Pressable
          onPress={() => router.replace("/(protected)/settings")}
          style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}
        >
          <Feather name="chevron-left" size={26} color={colors.text} />
          <Text
            style={{
              color: colors.text,
              fontSize: 18,
              fontWeight: "600",
              marginLeft: 2,
            }}
          >
            Back
          </Text>
        </Pressable>

        {/* DATA PRIVACY TITLE */}
        <SectionTitle title="DATA PRIVACY" />

        {/* INFO CARD */}
        <View
          style={[
            styles.infoCard,
            {
              backgroundColor: colors.cardDarker,
              borderColor: colors.card,
            },
          ]}
        >
          <View style={styles.infoRow}>
            <Feather name="shield" size={18} color={colors.subtleText} />
            <Text style={[styles.infoText, { color: colors.text }]}>
              We value your privacy and ensure your data is handled securely.
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Feather name="lock" size={18} color={colors.subtleText} />
            <Text style={[styles.infoText, { color: colors.text }]}>
              Your personal details are encrypted in storage.
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Feather name="database" size={18} color={colors.subtleText} />
            <Text style={[styles.infoText, { color: colors.text }]}>
              You may request a copy of all data associated with your account.
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Feather name="trash-2" size={18} color={colors.subtleText} />
            <Text style={[styles.infoText, { color: colors.text }]}>
              You may delete your account at any time.
            </Text>
          </View>
        </View>

        {/* ACTIONS */}
        <SectionTitle title="ACTIONS" />

        {/* DOWNLOAD DATA */}
        <Pressable
          onPress={() => setDownloadVisible(true)}
          style={[
            styles.actionItem,
            { backgroundColor: colors.cardDarker, borderColor: colors.card },
          ]}
        >
          <View style={styles.actionLeft}>
            <Feather name="download" size={20} color={colors.text} />
            <Text style={[styles.actionLabel, { color: colors.text }]}>
              Download My Data
            </Text>
          </View>
        </Pressable>

        {/* PRIVACY POLICY */}
        <Pressable
          style={[
            styles.actionItem,
            { backgroundColor: colors.cardDarker, borderColor: colors.card },
          ]}
        >
          <View style={styles.actionLeft}>
            <Feather name="file-text" size={20} color={colors.text} />
            <Text style={[styles.actionLabel, { color: colors.text }]}>
              Privacy Policy
            </Text>
          </View>
        </Pressable>

        {/* DELETE ACCOUNT */}
        <Pressable
          onPress={() => router.push("/(protected)/account?delete=true")}
          style={[
            styles.actionItem,
            { backgroundColor: colors.cardDarker, borderColor: colors.card },
          ]}
        >
          <View style={styles.actionLeft}>
            <Feather name="trash" size={20} color={colors.error} />
            <Text style={[styles.actionLabel, { color: colors.error }]}>
              Delete Account
            </Text>
          </View>
        </Pressable>

        {/* DOWNLOAD DATA MODAL */}
        <Modal visible={downloadVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.modalContent,
                {
                  backgroundColor: colors.cardDarker,
                  borderColor: colors.card,
                },
              ]}
            >
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Download My Data
              </Text>

              <Text
                style={{
                  color: colors.subtleText,
                  fontSize: 15,
                  textAlign: "center",
                }}
              >
                A downloadable file containing your account data will be
                generated and sent to your email.
              </Text>

              <View style={styles.modalButtons}>
                <Pressable
                  onPress={() => setDownloadVisible(false)}
                  style={[styles.modalButton, { backgroundColor: colors.card }]}
                >
                  <Text style={[styles.modalButtonText, { color: colors.text }]}>
                    Cancel
                  </Text>
                </Pressable>

                <Pressable
                  style={[styles.modalButton, { backgroundColor: colors.primary }]}
                >
                  <Text style={[styles.modalButtonText, { color: "white" }]}>
                    Proceed
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </OverlayWrapper>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    marginTop: 18,
    marginBottom: 6,
    fontSize: 13,
    fontWeight: "700",
    opacity: 0.7,
    letterSpacing: 0.6,
  },

  /** INFO CARD */
  infoCard: {
    padding: 16,
    borderWidth: 5,
    borderRadius: 16,
    marginBottom: 14,
    gap: 14,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  infoText: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },

  /** ACTION ITEMS */
  actionItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 5,
    marginBottom: 8,
  },

  actionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  actionLabel: {
    fontSize: 16,
    fontWeight: "600",
  },

  /** MODALS */
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "rgba(0,0,0,0.55)",
  },

  modalContent: {
    padding: 22,
    borderRadius: 18,
    borderWidth: 3,
    gap: 18,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },

  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },

  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },

  modalButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
