import Clipboard from '@react-native-clipboard/clipboard';
import Icon from 'assets/icons';
import {ToastController} from 'controller';
import React, {useState} from 'react';
import {TouchableOpacity} from 'react-native';
import styled from 'styled-components/native';
import {color} from 'theme';

type CopyProps = {
  value: any;
};

const Container = styled.View`
  width: 35px;
  height: 35px;
  border-width: 1px;
  border-color: #dadcde;
  background-color: #f6f8fa;
  justify-content: center;
  align-items: center;
  border-radius: 7px;
`;

const Copy: React.FC<CopyProps> = props => {
  const {value} = props;

  const [copiedText, setCopiedText] = useState<boolean>(false);

  const copyToClipboard = async () => {
    Clipboard.setString(String(value));
    let content = await Clipboard.getString();
    if (content === String(value)) {
      setCopiedText(true);
      setTimeout(() => {
        setCopiedText(false);
      }, 2000);
      ToastController.type({
        type: 'success',
        message: `Copied ${content}`,
        visibilityTime: 2000,
      });
    }
  };

  return (
    <>
      {copiedText ? (
        <Icon name="checkmark" size={20} color={'#21883D'} />
      ) : (
        <TouchableOpacity onPress={copyToClipboard}>
          <Icon name="copy" size={20} color={color.secondary} />
        </TouchableOpacity>
      )}
    </>
  );
};

export default Copy;
