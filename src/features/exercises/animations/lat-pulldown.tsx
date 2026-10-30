import { useEffect } from 'react';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

import { useTheme } from '@/hooks/use-theme';

import { solveElbow } from './ik';

const AnimatedLine = Animated.createAnimatedComponent(Line);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);

// Front view, in a 200 × 220 box. The figure sits facing us; only the bar and the arms move.
const VIEW_WIDTH = 200;
const VIEW_HEIGHT = 220;
const SHOULDER_Y = 108;
const SHOULDER_X = { left: 80, right: 120 };
// Overhand grip, wider than the shoulders: the hands stay at these x positions on the bar.
const GRIP_X = { left: 60, right: 140 };
const BAR_TOP = 44;
const BAR_BOTTOM = 106;
const UPPER_ARM = 34;
const FOREARM = 34;

// One repetition: pull in 1.1 s, short squeeze at the bottom, controlled 1.5 s return.
const PULL_MS = 1100;
const SQUEEZE_MS = 250;
const RETURN_MS = 1500;
const REST_MS = 400;

function barY(progress: number) {
  'worklet';
  return BAR_TOP + (BAR_BOTTOM - BAR_TOP) * progress;
}

function useArm(progress: SharedValue<number>, side: 'left' | 'right') {
  const shoulderX = SHOULDER_X[side];
  const handX = GRIP_X[side];
  const outward = side === 'left' ? -1 : 1;

  const elbow = () => {
    'worklet';
    return solveElbow(
      shoulderX,
      SHOULDER_Y,
      handX,
      barY(progress.value),
      UPPER_ARM,
      FOREARM,
      outward,
    );
  };

  const upperArm = useAnimatedProps(() => {
    const [x, y] = elbow();
    return { x2: x, y2: y };
  });
  const forearm = useAnimatedProps(() => {
    const [x, y] = elbow();
    return { x1: x, y1: y, y2: barY(progress.value) };
  });
  const hand = useAnimatedProps(() => ({ cy: barY(progress.value) }));

  return { shoulderX, handX, upperArm, forearm, hand };
}

/** Lat pulldown, drawn in the app's style. Loops for as long as it is on screen. */
export function LatPulldownAnimation({ size }: { size: number }) {
  const theme = useTheme();
  const progress = useSharedValue(0);

  useEffect(() => {
    const ease = Easing.inOut(Easing.cubic);
    progress.value = withRepeat(
      withSequence(
        withDelay(REST_MS, withTiming(1, { duration: PULL_MS, easing: ease })),
        withDelay(SQUEEZE_MS, withTiming(0, { duration: RETURN_MS, easing: ease })),
      ),
      -1,
    );
    return () => cancelAnimation(progress);
  }, [progress]);

  const left = useArm(progress, 'left');
  const right = useArm(progress, 'right');

  const bar = useAnimatedProps(() => {
    const y = barY(progress.value);
    return { y1: y, y2: y };
  });
  const cable = useAnimatedProps(() => ({ y2: barY(progress.value) }));
  const leftHandle = useAnimatedProps(() => {
    const y = barY(progress.value);
    return { d: `M50 ${y} L42 ${y + 7}` };
  });
  const rightHandle = useAnimatedProps(() => {
    const y = barY(progress.value);
    return { d: `M150 ${y} L158 ${y + 7}` };
  });
  // The working muscle lights up as the bar comes down.
  const lats = useAnimatedProps(() => ({ fillOpacity: 0.35 + 0.65 * progress.value }));

  const machine = theme.textSecondary;
  const body = theme.heading;
  const muscle = theme.brand;

  return (
    <Svg
      width={size}
      height={(size * VIEW_HEIGHT) / VIEW_WIDTH}
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}>
      {/* Machine frame */}
      <Line
        x1={24}
        y1={14}
        x2={176}
        y2={14}
        stroke={machine}
        strokeWidth={4}
        strokeLinecap="round"
      />
      <Line
        x1={24}
        y1={14}
        x2={24}
        y2={212}
        stroke={machine}
        strokeWidth={4}
        strokeLinecap="round"
      />
      <Line
        x1={176}
        y1={14}
        x2={176}
        y2={212}
        stroke={machine}
        strokeWidth={4}
        strokeLinecap="round"
      />
      <Line
        x1={14}
        y1={212}
        x2={186}
        y2={212}
        stroke={machine}
        strokeWidth={4}
        strokeLinecap="round"
      />
      <Circle cx={100} cy={20} r={5} fill="none" stroke={machine} strokeWidth={2.5} />
      <AnimatedLine
        animatedProps={cable}
        x1={100}
        y1={25}
        x2={100}
        stroke={machine}
        strokeWidth={1.5}
      />
      <Rect x={74} y={156} width={52} height={10} rx={4} fill={machine} />
      <Line x1={24} y1={171} x2={70} y2={171} stroke={machine} strokeWidth={2.5} />
      <Line x1={130} y1={171} x2={176} y2={171} stroke={machine} strokeWidth={2.5} />

      {/* Legs, coming towards us */}
      <Line
        x1={92}
        y1={160}
        x2={86}
        y2={178}
        stroke={body}
        strokeWidth={13}
        strokeLinecap="round"
      />
      <Line
        x1={108}
        y1={160}
        x2={114}
        y2={178}
        stroke={body}
        strokeWidth={13}
        strokeLinecap="round"
      />
      <Line
        x1={86}
        y1={178}
        x2={84}
        y2={204}
        stroke={body}
        strokeWidth={10}
        strokeLinecap="round"
      />
      <Line
        x1={114}
        y1={178}
        x2={116}
        y2={204}
        stroke={body}
        strokeWidth={10}
        strokeLinecap="round"
      />
      <Line x1={76} y1={208} x2={88} y2={208} stroke={body} strokeWidth={6} strokeLinecap="round" />
      <Line
        x1={112}
        y1={208}
        x2={124}
        y2={208}
        stroke={body}
        strokeWidth={6}
        strokeLinecap="round"
      />
      <Rect x={66} y={166} width={68} height={10} rx={5} fill={machine} />

      {/* Torso, neck and head */}
      <Path
        d="M78 104 Q100 98 122 104 L114 158 Q100 164 86 158 Z"
        fill={body}
        stroke={body}
        strokeWidth={4}
        strokeLinejoin="round"
      />
      <AnimatedPath
        animatedProps={lats}
        d="M80 112 Q76 132 90 152 L94 142 Q87 128 88 112 Z"
        fill={muscle}
      />
      <AnimatedPath
        animatedProps={lats}
        d="M120 112 Q124 132 110 152 L106 142 Q113 128 112 112 Z"
        fill={muscle}
      />
      <Rect x={95} y={94} width={10} height={12} rx={3} fill={body} />
      <Circle cx={100} cy={84} r={12} fill={body} />

      {/* Arms and bar */}
      {[left, right].map((arm) => (
        <AnimatedLine
          key={`upper-${arm.shoulderX}`}
          animatedProps={arm.upperArm}
          x1={arm.shoulderX}
          y1={SHOULDER_Y}
          stroke={body}
          strokeWidth={11}
          strokeLinecap="round"
        />
      ))}
      {[left, right].map((arm) => (
        <AnimatedLine
          key={`forearm-${arm.shoulderX}`}
          animatedProps={arm.forearm}
          x2={arm.handX}
          stroke={body}
          strokeWidth={9}
          strokeLinecap="round"
        />
      ))}
      <AnimatedLine
        animatedProps={bar}
        x1={50}
        x2={150}
        stroke={theme.text}
        strokeWidth={5}
        strokeLinecap="round"
      />
      <AnimatedPath
        animatedProps={leftHandle}
        stroke={theme.text}
        strokeWidth={5}
        strokeLinecap="round"
        fill="none"
      />
      <AnimatedPath
        animatedProps={rightHandle}
        stroke={theme.text}
        strokeWidth={5}
        strokeLinecap="round"
        fill="none"
      />
      {[left, right].map((arm) => (
        <AnimatedCircle
          key={`hand-${arm.shoulderX}`}
          animatedProps={arm.hand}
          cx={arm.handX}
          r={5.5}
          fill={body}
        />
      ))}
    </Svg>
  );
}
