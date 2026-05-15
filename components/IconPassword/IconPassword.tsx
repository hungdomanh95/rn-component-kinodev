import React, { useState } from 'react';
import { color } from 'theme';
import * as S from './styled.input';
import { TouchableOpacity } from 'react-native';

type IconPasswordProps = {
  secureTextEntry: boolean
  setSecureTextEntry: React.Dispatch<React.SetStateAction<boolean>>
};

const IconPassword: React.FC<IconPasswordProps> = (props: IconPasswordProps) => {

  const {secureTextEntry,setSecureTextEntry} = props

  return (
    <TouchableOpacity onPress={() => setSecureTextEntry(!secureTextEntry)}>
      <S.IconRight
        name={secureTextEntry ? 'eye-off-outline' : 'eye-outline'}
        size={20}
        color={color.secondary}
      />
    </TouchableOpacity>
  );
};

export default IconPassword;
