import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Svg, { Path } from "react-native-svg";

const BackArrowIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M15 18L9 12L15 6"
      stroke="#333"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const AlertIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="#dc2626">
    <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
  </Svg>
);

const ClockIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="#d97706">
    <Path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
  </Svg>
);

const CalendarIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="#2563eb">
    <Path d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z" />
  </Svg>
);

const CheckIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="#16a34a">
    <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
  </Svg>
);

const ReportIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="#7c3aed">
    <Path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
  </Svg>
);

const TrashIcon = () => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill="#9ca3af">
    <Path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
  </Svg>
);

const getIconForType = (type) => {
  if (type.includes("inventory_alert")) return <AlertIcon />;
  if (type.includes("due_soon")) return <ClockIcon />;
  if (type.includes("appointment")) return <CalendarIcon />;
  if (type.includes("user_request")) return <CheckIcon />;
  if (type.includes("report")) return <ReportIcon />;
  return <AlertIcon />;
};

export default function NotificationModal({
  isVisible,
  onClose,
  notifications,
  onMarkAllRead,
  onDeleteAll,
  onDeleteOne,
  onNotificationPress,
}) {
  const navigation = useNavigation();

  const handleNotificationPress = (item) => {
    console.log("Notification pressed:", item.id, item.type);

    // First mark as read
    if (onNotificationPress) {
      onNotificationPress(item);
    }

    // Handle navigation based on notification type
    if (item.type.includes("inventory_alert")) {
      // For inventory notifications, navigate to Inventory tab
      console.log("Redirecting to Inventory screen");
      navigation.navigate("Inventory");
    } else if (item.type.includes("appointment")) {
      // For appointment notifications
      if (item.role === "USER/MOTHER/GUARDIAN") {
        navigation.navigate("Appointment");
      } else {
        navigation.navigate("Appointment");
      }
    } else if (item.type.includes("patient_due_soon")) {
      // For patient notifications
      navigation.navigate("Patient");
    } else if (item.type.includes("child_checkup_due")) {
      // For child notifications
      navigation.navigate("Patient");
    } else if (item.type.includes("report")) {
      // For report notifications
      navigation.navigate("Reports");
    } else {
      // Default to dashboard
      if (item.role === "USER/MOTHER/GUARDIAN") {
        navigation.navigate("Dashboard");
      } else {
        navigation.navigate("Dashboard");
      }
    }

    onClose();
  };

  const NotificationItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.itemContainer, !item.is_read && styles.unreadItem]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={styles.statusIndicator}>
        {!item.is_read && <View style={styles.unreadDot} />}
      </View>

      <View style={styles.iconContainer}>{getIconForType(item.type)}</View>

      <View style={styles.textContainer}>
        <Text style={[styles.itemTitle, !item.is_read && styles.unreadTitle]}>
          {item.type
            .replace(/_/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase())}
        </Text>
        <Text
          style={[styles.itemMessage, !item.is_read && styles.unreadMessage]}
        >
          {item.message}
        </Text>
        <Text style={styles.itemTime}>
          {new Date(item.created_at).toLocaleDateString()} •{" "}
          {new Date(item.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>

      <TouchableOpacity
        onPress={() => onDeleteOne(item.id)}
        style={styles.deleteButton}
      >
        <TrashIcon />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const unreadCount = notifications.filter((item) => !item.is_read).length;

  return (
    <Modal visible={isVisible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <BackArrowIcon />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Notifications</Text>
            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>
          <TouchableOpacity
            onPress={onMarkAllRead}
            disabled={unreadCount === 0}
          >
            <Text
              style={[
                styles.markReadText,
                unreadCount === 0 && styles.markReadDisabled,
              ]}
            >
              Mark all read
            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={notifications}
          renderItem={({ item }) => <NotificationItem item={item} />}
          keyExtractor={(item, index) =>
            item?.id?.toString() ?? `fallback-${index}`
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No notifications yet</Text>
              <Text style={styles.emptySubtext}>You're all caught up!</Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
        />

        {notifications.length > 0 && (
          <View style={styles.footer}>
            <TouchableOpacity onPress={onDeleteAll} style={styles.footerButton}>
              <Text style={styles.footerButtonText}>
                Clear All Notifications
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderColor: "#e2e8f0",
  },
  backButton: {
    padding: 4,
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
  },
  unreadBadge: {
    backgroundColor: "#dc2626",
    borderRadius: 12,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  unreadBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  markReadText: {
    color: "#3b82f6",
    fontWeight: "600",
    fontSize: 14,
  },
  markReadDisabled: {
    color: "#9ca3af",
  },
  listContent: {
    flexGrow: 1,
    padding: 8,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    marginVertical: 4,
    marginHorizontal: 8,
    backgroundColor: "white",
    borderRadius: 12,
  },
  unreadItem: {
    backgroundColor: "#f0f9ff",
    borderLeftWidth: 3,
    borderLeftColor: "#3b82f6",
  },
  statusIndicator: {
    width: 24,
    alignItems: "center",
    paddingTop: 2,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#3b82f6",
  },
  iconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  itemTitle: {
    fontWeight: "600",
    fontSize: 15,
    color: "#475569",
    marginBottom: 4,
  },
  unreadTitle: {
    color: "#1e293b",
    fontWeight: "700",
  },
  itemMessage: {
    color: "#64748b",
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 6,
  },
  unreadMessage: {
    color: "#334155",
    fontWeight: "500",
  },
  itemTime: {
    fontSize: 12,
    color: "#94a3b8",
  },
  deleteButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: "#64748b",
    fontWeight: "600",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#94a3b8",
  },
  footer: {
    padding: 16,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderColor: "#e2e8f0",
  },
  footerButton: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#fef2f2",
    alignItems: "center",
  },
  footerButtonText: {
    color: "#dc2626",
    fontWeight: "600",
    fontSize: 16,
  },
});
