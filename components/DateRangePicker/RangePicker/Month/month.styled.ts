import { Row } from "../../../Row";
import styled from "styled-components/native";
import { color, size } from "theme";

export const ButtonChevron = styled.TouchableOpacity`
  height: 40px;
  width: 40px;
  align-items: center;
  justify-content: center;
  background-color: #F9FAFC;
  border-radius: 8px;
  border: 1px solid #ECEFF4;
`;

export const Container = styled(Row)`
  flex-wrap: wrap;
  gap:10px;
  justify-content: space-between;
`

type tabProps = {
  active?: boolean;
  current?: boolean;
  child?: boolean;
};

export const ItemPicker = styled.TouchableOpacity<tabProps>`
  align-items: center;
  justify-content: center;
  width: 20%;
  height: 40px;
  background-color: ${(props: any) => props.active ? "#2286B8" : props.child ? "#8DC8E8" :  "#F9FAFC"};
  border-radius: 4px;
  border: 1px solid #ECEFF4;
`
export const LabelMonth = styled.Text<tabProps>`
   color: ${(props: any) => (props.active || props.child) ? color.white : props.current ? color.secondary : color.black};
   font-weight: 500;
   font-size: 16px;
`

export const ActionYear = styled(Row)`
  justify-content: space-between;
  align-items: center;
  padding-bottom: ${size.spacing}px;
`