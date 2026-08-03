import { Row } from "../../Row";
import styled from "styled-components/native";
import { colors, sizes } from "../../../theme";

type tabProps = {
  active: boolean;
};

export const ContainerTab = styled.ScrollView``;

export const Tab = styled.TouchableOpacity<tabProps>`
  width: 100px;
  height: 40px;
  justify-content: center;
  align-items: center;
  border-color: ${(props: any) =>
    props.active ? colors.primary : colors.darkGray};
  border-radius: 8px;
  border-width: 1.5px;
  margin-right: 16px ;
`;

export const ContentTab = styled.Text<tabProps>`
  font-size: 12px;
`;

type Props = {
  active?: boolean;
};
export const ContainerDate = styled(Row)`
  justify-content: space-between;
`;
export const DatePicker = styled.View`
  width: ${(sizes.screenWidth - 3 * sizes.padding) / 2}px;
  gap: 6px;
`;

export const Picker = styled.TouchableOpacity<Props>`
  height: 40px;
  width: 100%;
  align-items: center;
  justify-content: space-around;
  border-radius: 7px;
  flex-direction: row;
  border-width: 1px;
  background-color: white;

  ${({ active }) => {
    return `
      border-color: ${active ? colors.secondary : colors.darkGray};
    `;
  }};
`;

export const ButtonRemove = styled.TouchableOpacity`
  background-color: #66676b;
  border-radius: 50px;
  width: 15px;
  height: 15px;
  justify-content: center;
  align-items: center;
`;
