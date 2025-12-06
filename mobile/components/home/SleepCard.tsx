import { useThemeStore } from "@/store/themeStore";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { useAnimatedProps } from "react-native-reanimated";
import { Circle, Defs, FeDropShadow, Filter, LinearGradient as SVGGradient, Stop, Svg } from "react-native-svg";


const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface SleepCardProps {
  title?: string;
  date?: Date;
  sleepStart: Date;
  sleepEnd: Date;
  quality?: number;
  qualityTextOverride?: string;
  durationOverride?: number;
  isNap?: boolean;
}
function formatDurationHM(hoursDecimal: number) {
  const hours = Math.floor(hoursDecimal);
  const minutes = Math.round((hoursDecimal - hours) * 60);
  return `${hours} hr ${minutes} min`;
}

export default function SleepCard({
  title,
  date,
  sleepStart,
  sleepEnd,
  quality = 0,
  qualityTextOverride,
  durationOverride,
  isNap,
}: SleepCardProps) {
  const { colors } = useThemeStore();
  const router = useRouter();
  const [showLegend, setShowLegend] = React.useState(false);

  const computedIsNap = isNap ?? (sleepStart.getHours() > 6 && sleepStart.getHours() < 18);

  const hours = useMemo(() => {
    if (typeof durationOverride === "number") return durationOverride;
    const diff = (sleepEnd.getTime() - sleepStart.getTime()) / 1000 / 60 / 60;
    return Math.max(0, Number(diff.toFixed(1)));
  }, [sleepStart, sleepEnd, durationOverride]);

  const formattedDate = (date ?? sleepEnd).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const getQualityText = (q: number) => {
    if (computedIsNap) {
      if (q >= 0.9) return "Excellent Nap";
      if (q >= 0.75) return "Good Nap";
      if (q >= 0.55) return "Okay Nap";
      return "Poor Nap";
    }
    if (q >= 0.85) return "Excellent Quality";
    if (q >= 0.7) return "Good Quality";
    if (q >= 0.5) return "Okay Quality";
    return "Poor Quality";
  };

  const qualityText = qualityTextOverride ?? getQualityText(quality);

  const size = 280;
  const strokeWidth = 22;
  const padding = strokeWidth / 2 + 4;
  const radius = (size - strokeWidth) / 2 - 4;
  const viewSize = size + padding * 2;
  const circumference = 2 * Math.PI * radius;

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - quality),
  }));

  return (
    <TouchableOpacity 
      activeOpacity={0.9} 
      onPress={() => router.push("../sleep-records")}
      style={[styles.wrapper, { backgroundColor: colors.cardDarker}]}
    >     
      <ImageBackground
        source={
          useThemeStore.getState().theme === "dark"
            ? require("@/assets/images/night_sky.png")
            : require("@/assets/images/noon_sky.png")
        }
        resizeMode="cover"
        style={styles.container}
        imageStyle={{ opacity: 0.9 }} // Optional blending
      >
        <Text style={[styles.cardHeader, { color: colors.text + "AA" }]}>
          Sleep
        </Text>

        <Text style={[styles.title, { color: colors.text }]}>
          {title ?? (computedIsNap ? "Nap Summary" : "Last Night’s Sleep")}
        </Text>

        <Text style={[styles.date, { color: colors.text + "CC" }]}>{formattedDate}</Text>

        <View style={styles.graphContainer}>
          <Svg width={viewSize} height={viewSize}>
            <Defs>
              <SVGGradient id="sleepGradient" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0%" stopColor={colors.gradientStart} />
                <Stop offset="100%" stopColor={colors.gradientEnd} />
              </SVGGradient>
            </Defs>

            <Defs>
              <Filter id="shadow">
                <FeDropShadow dx="2" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.5" />
              </Filter>
            </Defs>

            <Circle
              cx={viewSize / 2}
              cy={viewSize / 2}
              r={radius}
              stroke={colors.borderStrong}
              strokeWidth={strokeWidth + 8}
              fill="none"
              strokeOpacity={0.35}
            />

            <Circle
              cx={viewSize / 2}
              cy={viewSize / 2}
              r={radius}
              stroke={colors.subtleText + "33"}
              strokeWidth={strokeWidth}
              fill="none"
            />

            <AnimatedCircle
              cx={viewSize / 2}
              cy={viewSize / 2}
              r={radius}
              stroke="url(#sleepGradient)"
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              animatedProps={animatedProps}
            />
          </Svg>

          <Text style={[styles.qualityText, { color: colors.text }]}>{qualityText}</Text>
        </View>

        <Text style={[styles.bottomLine, { color: colors.text + "DD" }]}>
          {formatTime(sleepStart)} → {formatTime(sleepEnd)} • {formatDurationHM(hours)}
        </Text>

        <TouchableOpacity onPress={() => setShowLegend(!showLegend)}>
          <Text
            style={[styles.legendToggle, { color: colors.text, borderColor: colors.text + "44" }]}
          >
            {showLegend ? "Hide Sleep Info ▲" : "Show Sleep Info ▼"}
          </Text>
        </TouchableOpacity>

        {showLegend && (
          <View
            style={[styles.legendContainer, { backgroundColor: colors.cardDarker + "55", borderColor: colors.text + "22" }]}
          >
            {computedIsNap ? (
              <>
                <Text style={[styles.legendTitle, { color: colors.text }]}>Nap Quality Guide</Text>
                <Text style={[styles.legendItem, { color: colors.text + "CC" }]}>• Excellent: 90%+</Text>
                <Text style={[styles.legendItem, { color: colors.text + "CC" }]}>• Good: 75–89%</Text>
                <Text style={[styles.legendItem, { color: colors.text + "CC" }]}>• Okay: 55–74%</Text>
                <Text style={[styles.legendItem, { color: colors.text + "CC" }]}>• Poor: below 55%</Text>

                <View style={styles.legendSpacing} />

                <Text style={[styles.legendTitle, { color: colors.text }]}>Recommended Nap Durations</Text>
                <Text style={[styles.legendItem, { color: colors.text + "CC" }]}>• 20–30 min → Best for alertness</Text>
                <Text style={[styles.legendItem, { color: colors.text + "CC" }]}>• 60–90 min → Full sleep cycle</Text>
              </>
            ) : (
              <>
                <Text style={[styles.legendTitle, { color: colors.text }]}>Night Sleep Quality Guide</Text>
                <Text style={[styles.legendItem, { color: colors.text + "CC" }]}>• Excellent: 85%+</Text>
                <Text style={[styles.legendItem, { color: colors.text + "CC" }]}>• Good: 70–84%</Text>
                <Text style={[styles.legendItem, { color: colors.text + "CC" }]}>• Okay: 50–69%</Text>
                <Text style={[styles.legendItem, { color: colors.text + "CC" }]}>• Poor: below 50%</Text>
              </>
            )}
          </View>
        )}
      </ImageBackground>
    </TouchableOpacity>
  );
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.25)",
    elevation: 12,
  },
  container: {
    padding: 20,
    alignItems: "center",
  },
  cardHeader: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1,
    opacity: 0.9,
    marginBottom: 2,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
    letterSpacing: 0.5,
    textShadowColor: "#00000033",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  date: {
    fontSize: 16,
    letterSpacing: 0.3,
    marginBottom: 10,
  },
  qualityText: {
    position: "absolute",
    fontSize: 30,
    fontWeight: "700",
    letterSpacing: -0.5,
    textShadowColor: "#00000088",
    textShadowOffset: { width: 1, height: 3 },
    textShadowRadius: 10,
  },
  qualityPercent: {
    marginTop: 100,
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.3,
    textShadowColor: "#00000055",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
    position: "absolute",
  },
  bottomLine: {
    fontSize: 16,
    marginTop: 12,
    fontWeight: "500",
    letterSpacing: 0.2,
    textAlign: "center",
  },
  graphContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 6,
  },
  legendToggle: {
    marginTop: 14,
    fontSize: 14,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 10,
    textAlign: "center",
    fontWeight: "600",
  },
  legendContainer: {
    width: "100%",
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  legendItem: {
    fontSize: 13,
    marginBottom: 3,
    letterSpacing: 0.2,
  },
  legendSpacing: {
    height: 10,
  },
});