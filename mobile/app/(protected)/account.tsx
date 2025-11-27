import OverlayWrapper from "@/components/theme/OverlayWrapper";
import { useStoreAuth } from "@/store/authStore";
import { useThemeStore } from "@/store/themeStore";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function AccountScreen() {
  const { colors } = useThemeStore();
  const { user } = useStoreAuth();

  const [editVisible, setEditVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);

  const maskedEmail =
    user?.email?.replace(/(.{2}).+(@.*)/, "$1****$2") || "unknown@example.com";

  const dateJoined = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString()
    : "Unknown";

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

        {/* ACCOUNT INFO */}
        <SectionTitle title="ACCOUNT INFORMATION" />

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
            <Feather name="user" size={18} color={colors.subtleText} />
            <Text style={[styles.infoText, { color: colors.text }]}>
              {user?.name || "Unknown"}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Feather name="mail" size={18} color={colors.subtleText} />
            <Text style={[styles.infoText, { color: colors.text }]}>
              {maskedEmail}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Feather name="calendar" size={18} color={colors.subtleText} />
            <Text style={[styles.infoText, { color: colors.text }]}>
              Joined {dateJoined}
            </Text>
          </View>
        </View>

        {/* CHANGE NAME */}
        <Pressable
          onPress={() => setEditVisible(true)}
          style={[
            styles.actionItem,
            { backgroundColor: colors.cardDarker, borderColor: colors.card },
          ]}
        >
          <View style={styles.actionLeft}>
            <Feather name="edit" size={20} color={colors.text} />
            <Text style={[styles.actionLabel, { color: colors.text }]}>
              Change Name
            </Text>
          </View>
        </Pressable>

        {/* DELETE ACCOUNT */}
        <Pressable
          onPress={() => setDeleteVisible(true)}
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

        {/* EDIT NAME MODAL */}
        <Modal visible={editVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.modalContent,
                { backgroundColor: colors.cardDarker, borderColor: colors.card },
              ]}
            >
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Change Name
              </Text>

              <TextInput
                placeholder="Enter new name"
                placeholderTextColor={colors.subtleText}
                style={[
                  styles.input,
                  { borderColor: colors.border, color: colors.text },
                ]}
              />

              <View style={styles.modalButtons}>
                <Pressable
                  onPress={() => setEditVisible(false)}
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
                    Save
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* DELETE MODAL */}
        <Modal visible={deleteVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.modalContent,
                { backgroundColor: colors.cardDarker, borderColor: colors.card },
              ]}
            >
              <Text
                style={[
                  styles.modalTitle,
                  { color: colors.error, marginBottom: 8 },
                ]}
              >
                Delete Account
              </Text>

              <Text
                style={{
                  color: colors.subtleText,
                  fontSize: 15,
                  textAlign: "center",
                }}
              >
                Are you sure? This action cannot be undone.
              </Text>

              <View style={styles.modalButtons}>
                <Pressable
                  onPress={() => setDeleteVisible(false)}
                  style={[styles.modalButton, { backgroundColor: colors.card }]}
                >
                  <Text style={[styles.modalButtonText, { color: colors.text }]}>
                    Cancel
                  </Text>
                </Pressable>

                <Pressable
                  style={[styles.modalButton, { backgroundColor: colors.error }]}
                >
                  <Text style={[styles.modalButtonText, { color: "white" }]}>
                    Delete
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

  /** ACCOUNT INFO CARD */
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

  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
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
