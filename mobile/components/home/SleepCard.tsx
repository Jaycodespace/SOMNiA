import { useThemeStore } from "@/store/themeStore";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
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

export default function SleepCard({
  title,
  date,
  sleepStart,
  sleepEnd,
  quality = 0.75,
  qualityTextOverride,
  durationOverride,
  isNap,
}: SleepCardProps) {
  const { colors } = useThemeStore();

  const computedIsNap =
    isNap ?? (sleepStart.getHours() > 6 && sleepStart.getHours() < 18);

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
    if (q >= 0.85) return "Excellent Quality";
    if (q >= 0.7) return "Good Quality";
    if (q >= 0.5) return "Okay Quality";
    return "Poor Quality";
  };

  const qualityText =
    qualityTextOverride ?? getQualityText(quality);

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
    <View style={[styles.wrapper, { backgroundColor: colors.cardDarker + "55" }]}>
      <LinearGradient
        colors={[colors.gradientStart + "55", colors.gradientEnd + "55"]}
        style={styles.container}
      >
        {/* Title */}
        <Text style={[styles.title, { color: colors.text }]}>
          {title ?? (computedIsNap ? "Nap Summary" : "Last Night’s Sleep")}
        </Text>

        {/* Date */}
        <Text style={[styles.date, { color: colors.text + "CC" }]}>
          {formattedDate}
        </Text>

        {/* Circular Graph */}
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
              strokeLinecap="butt"
              strokeDasharray={circumference}
              animatedProps={animatedProps}
            />
          </Svg>

          <Text style={[styles.qualityText, { color: colors.text }]}>
            {qualityText}
          </Text>
        </View>

        {/* Bottom Summary */}
        <Text style={[styles.bottomLine, { color: colors.text + "DD" }]}>
          {formatTime(sleepStart)} → {formatTime(sleepEnd)} • {hours} hrs
        </Text>
      </LinearGradient>
    </View>
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
  },
  container: {
    padding: 20,
    alignItems: "center",
  },

  /* -------- Typography Improvements -------- */

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
    fontSize: 40,
    fontWeight: "700",
    letterSpacing: -0.5,
    textShadowColor: "#00000088",
    textShadowOffset: { width: 1, height: 3 },
    textShadowRadius: 10,
  },

  bottomLine: {
    fontSize: 16,
    marginTop: 12,
    fontWeight: "500",
    letterSpacing: 0.2,
    textAlign: "center",
  },

  /* ------------ Layout ------------ */

  graphContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 6,
  },
});
