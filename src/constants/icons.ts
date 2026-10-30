// App icon set: Hugeicons (https://hugeicons.com), free "core-free-icons" package,
// Stroke Rounded style, as in Paniere. Icons are picked here only, so swapping one
// never touches the screens.
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  BodyPartMuscleIcon,
  Bug01Icon,
  Calendar03Icon,
  CancelCircleIcon,
  ChartLineData01Icon,
  CheckmarkCircle02Icon,
  CircleIcon,
  Clock01Icon,
  Dumbbell01Icon,
  File01Icon,
  Globe02Icon,
  Idea01Icon,
  InformationCircleIcon,
  Message01Icon,
  MoreHorizontalCircle01Icon,
  Moon02Icon,
  PencilEdit02Icon,
  Search01Icon,
  Shield01Icon,
  SparklesIcon,
  SmartPhone01Icon,
  Sun03Icon,
  Target02Icon,
  TaskDaily01Icon,
  UserIcon,
  WorkoutRunIcon,
} from '@hugeicons/core-free-icons';

export const icons = {
  // tab bar
  tabExercises: Dumbbell01Icon,
  tabWorkouts: TaskDaily01Icon,
  tabProfile: UserIcon,
  // navigation
  back: ArrowLeft01Icon,
  chevronRight: ArrowRight01Icon,
  // choices
  checked: CheckmarkCircle02Icon,
  unchecked: CircleIcon,
  // search
  search: Search01Icon,
  clear: CancelCircleIcon,
  // exercise facts
  muscleGroup: WorkoutRunIcon,
  equipment: Dumbbell01Icon,
  targetMuscle: Target02Icon,
  secondaryMuscles: BodyPartMuscleIcon,
  // workout plans
  plan: TaskDaily01Icon,
  daysPerWeek: Calendar03Icon,
  duration: Clock01Icon,
  tips: Idea01Icon,
  // profile
  user: UserIcon,
  name: PencilEdit02Icon,
  language: Globe02Icon,
  themeSystem: SmartPhone01Icon,
  themeLight: Sun03Icon,
  themeDark: Moon02Icon,
  version: InformationCircleIcon,
  terms: File01Icon,
  privacy: Shield01Icon,
  analytics: ChartLineData01Icon,
  feedback: Message01Icon,
  // feedback categories
  feedbackBug: Bug01Icon,
  feedbackFeature: SparklesIcon,
  feedbackIdea: Idea01Icon,
  feedbackOther: MoreHorizontalCircle01Icon,
} as const;
