import React from 'react';
import { Platform, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { sizes } from '../../theme';

export interface FooterProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

const Footer: React.FC<FooterProps> = ({ children, style }: FooterProps) => {
  return (
    <View style={[styles.footer, style]}>
      {React.Children.map(children, (child: React.ReactNode) => {
        if (!React.isValidElement(child)) return child;
        return React.cloneElement(child as React.ReactElement<any>, {
          style: [{ flex: 1 }, (child.props as any).style],
        });
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: Platform.OS === "android" ? sizes.padding * 2 : sizes.padding * 3,
    marginTop: sizes.padding * 2,
    paddingHorizontal: sizes.padding,
  },
});

export default Footer;
