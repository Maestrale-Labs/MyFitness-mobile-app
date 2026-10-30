import { SymbolView, type AndroidSymbol, type SymbolViewProps } from 'expo-symbols';
import type { ColorValue } from 'react-native';
import type { SFSymbol } from 'sf-symbols-typescript';

/** SF Symbol on iOS, Material Symbol on Android (and on the web preview). */
export type IconName = { ios: SFSymbol; android: AndroidSymbol };

type IconProps = Omit<SymbolViewProps, 'name' | 'tintColor'> & {
  name: IconName;
  color: ColorValue;
};

export function Icon({ name, color, size = 22, ...rest }: IconProps) {
  return (
    <SymbolView
      name={{ ios: name.ios, android: name.android, web: name.android }}
      tintColor={color}
      size={size}
      {...rest}
    />
  );
}
