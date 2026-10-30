// App icon set: Hugeicons (https://hugeicons.com), free "core-free-icons" package,
// Stroke Rounded style, as in Paniere. Icons are picked here only, so swapping one
// never touches the screens.
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  BodyPartMuscleIcon,
  CancelCircleIcon,
  CheckmarkCircle02Icon,
  CircleIcon,
  Dumbbell01Icon,
  File01Icon,
  Globe02Icon,
  InformationCircleIcon,
  Moon02Icon,
  PencilEdit02Icon,
  Search01Icon,
  Shield01Icon,
  SmartPhone01Icon,
  Sun03Icon,
  Target02Icon,
  UserIcon,
  WorkoutRunIcon,
} from '@hugeicons/core-free-icons';

export const icons = {
  // tab bar
  tabExercises: Dumbbell01Icon,
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
  bodyPart: WorkoutRunIcon,
  equipment: Dumbbell01Icon,
  targetMuscle: Target02Icon,
  secondaryMuscles: BodyPartMuscleIcon,
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
} as const;
