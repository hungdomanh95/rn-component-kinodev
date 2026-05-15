import { View, SafeAreaView } from 'react-native'
import React from 'react'
import styled from 'styled-components/native'

export type PickerMultiFileProps = {
  size: "small" | "large";
  testID?: string;
  accessibilityLabel?: string;
};

const Text = styled.Text``

const PickerMultiFile:React.FC<PickerMultiFileProps> = ({ testID, accessibilityLabel }) => {
  return (
    <SafeAreaView testID={testID} accessibilityLabel={accessibilityLabel}>
      <Text>PickerMultiFile</Text>
    </SafeAreaView>
  )
}

export default PickerMultiFile
