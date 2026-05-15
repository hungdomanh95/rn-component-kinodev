import { color, size } from 'theme';
import styled from 'styled-components/native';

export const Container = styled.TouchableOpacity`
  flex: 1;
  justify-content: center;
  align-items: center;
`;
export const Title = styled.Text`
  color: ${color.primary};
  /* font-size: 16px; */
  /* margin: 16px 0px; */
  margin-top: ${size.spacing}px;
  font-weight: 700;
`