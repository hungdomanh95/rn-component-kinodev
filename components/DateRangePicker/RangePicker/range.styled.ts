
import { Row } from "../../Row";
import styled from "styled-components/native";
import { color, size } from "theme";


type tabProps = {
  active: boolean;
};

export const ContainerTab = styled.View`
  /* background-color: #f9f0e2; */
  background-color: ${color.secondary};
  border-width: 1px;
  border-radius: 12px;
  border-color: #f5efed;
  flex-direction: row;
  padding: 4px;
`;
export const Tab = styled.TouchableOpacity<tabProps>`
  flex: 1;
  padding: ${size.spacing}px 15px;
  justify-content: center;
  align-items: center;
  background-color: ${(props: any) => props.active ? color.white : "transparent"};
  border-radius: 8px;
`;
export const ContentTab = styled.Text<tabProps>`
  font-size: 15px;
  font-weight: 700;
  line-height: 18px;
  color: ${(props: any) => props.active ? color.secondary : color.white};
`;

type Props = {
  active?: boolean;
};
export const ContainerDate = styled(Row)`
  margin-top: ${size.spacing}px;
  justify-content: space-between;
`
export const DatePicker = styled.View`
 width: ${(size.width - 2*size.spacing)/2 - size.spacing/2}px;
`


export const Picker = styled.TouchableOpacity<Props>`
  height: 48px;
  width: 100%;
  align-items: center;
  justify-content: space-around;
  border-radius: 7px;
  flex-direction: row;
  border-width: 1px;
  background-color: white;

  ${({ active }) => {
    return `
      border-color: ${active ? color.secondary : color.darkGray};
    `;
  }};
`;

export const ButtonRemove = styled.TouchableOpacity`
  background-color: #66676B;
  border-radius: 50px;
  width: 15px;
  height: 15px;
  justify-content: center;
  align-items: center;
`
