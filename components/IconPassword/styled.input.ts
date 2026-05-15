import styled from "styled-components/native";
import IconFeather from 'react-native-vector-icons/Feather';
import IconMaterial from 'react-native-vector-icons/MaterialCommunityIcons';
import { Fade } from "animations";
import { Animated } from "react-native";
import { color, size } from "theme";

export const  Container = styled.View`
  height: 70px;
  border-bottom-width: 1px;
  border-bottom-color: black;
  border-bottom-style: solid;
  margin: 10px 0px;
  overflow: hidden;
  /* background-color: yellowgreen; */
`;
export const  IconLeft = styled(IconFeather)`
  /* flex:1; */
`;

export const  IconRight = styled(IconMaterial)`
  /* flex:1; */
  padding-left: 8px;
`;
export const  ContainerInput = styled.View`
  position: absolute;
  flex-direction: row;
  bottom: 10px;
  align-self: center;
  align-items: center;
`;
export const  FadeStyle = styled(Fade)`
  position: absolute;
  /* top: 10px; */
`;
export const  Slice = styled(Animated.View)`
  position: absolute;
  /* width: ${size.width - 80 + "px"}; */
  width: 100%;
  height: 1px;
  background-color: ${color.secondary};
  bottom: -1px;
`;
