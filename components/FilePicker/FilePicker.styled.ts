import { Label as SubTitle, Text } from "../Typography";
import styled from "styled-components/native";
import { color, size } from "theme";
import FastImage from "react-native-fast-image";
export const Container = styled.View`
  /* height: ${size.height / 4}px; */
  background-color: #fff;
  border-radius: 8px;
  border-width: 1px;
  border-color: rgba(24, 68, 120, 0.5);
  padding: 0px ${size.spacing}px;
  padding-top: ${size.spacing}px;
  margin-bottom: ${size.spacing}px;
`;

export const Upload = styled.View`
  /* flex: 1; */
  border-top-width: 1px;
  border-top-color: rgba(24, 68, 120, 0.5);
  flex-direction: row;
  align-items: center;
  /* padding:${size.spacing}px 0; */
`;
export const ButtonUpload = styled.TouchableOpacity`
  flex: 1;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  height: 48px;
`;
export const LineVertical = styled.View`
  width: 1px;
  height: 60%;
  background-color: rgba(24, 68, 120, 0.5);
`;
const WIDTH_CONTAINER_MULTI = size.width - 6 * size.spacing;
const SIZE_ITEM_MULTI = WIDTH_CONTAINER_MULTI / 3 - 1;

export const Content = styled.View`
  /* flex: 7; */
  flex-direction: row;
  margin-top: ${size.spacing}px;
  flex-wrap: wrap;
  gap: ${size.spacing}px;
  /* border-width: 1px; */
  /* justify-content: space-between; */
  /* max-height: ${3 * SIZE_ITEM_MULTI + 3 * size.spacing}px; */
`;

export const ItemUpload = styled.View`
  width: ${SIZE_ITEM_MULTI}px;
  height: ${SIZE_ITEM_MULTI}px;
  border-width: 1px;
  border-color: rgba(24, 68, 120, 0.5);
  border-style: dashed;
  border-radius: 7px;
  justify-content: center;
  align-items: center;
  /* margin-right: ${size.spacing}px; */
  margin-bottom: ${size.spacing}px;
  padding: 8px;
`;
export const Title = styled(SubTitle)`
  font-size: 13px;
  color: ${color.primary};
`;

export const ViewImage = styled(FastImage)`
  width: 100%;
  height: 100%;
  border-radius: 7px;
`;
export const ViewPDF = styled.View`
  width: 80%;
  /* height: 100%; */
  flex:1;
  border-radius: 7px;
  background-color: ${color.primary};
  justify-content: center;
  align-items: center;
`;
export const NameFile = styled(Text)`
  font-size: 10px;
  /* color: ${color.white}; */
  font-weight: 600;
  /* position: absolute; */
  margin-top: 8px;
  text-align: center;
`
export const ButtonRemove = styled.TouchableOpacity`
  position: absolute;
  z-index: 1;
  right: 5px;
  top: 5px;
  border-radius: 50px;
  width: 20px;
  height: 20px;
  background-color: ${color.blackGray};
  justify-content: center;
  align-items: center;
`;
export const TitleButton = styled(Text)`
  font-size: 12px;
  margin-left: 6px;
  font-weight: 700;
`;

export const ContainerSingle = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`;
export const ContentSingle = styled.View`
  width: ${SIZE_ITEM_MULTI}px;
  height: ${SIZE_ITEM_MULTI}px;
  border-width: 1px;
  border-color: rgba(24, 68, 120, 0.5);
  border-style: dashed;
  border-radius: 7px;
  padding: 8px;
  /* margin-top: ${size.spacing}px; */
`;
export const LineHorizontal = styled.View`
  width: 100%;
  height: 1px;
  background-color: rgba(24, 68, 120, 0.5);
`;
