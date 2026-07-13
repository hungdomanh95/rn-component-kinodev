import { View, SafeAreaView } from 'react-native'
import React from 'react'
import styled from 'styled-components/native'

export type PickerMultiFileProps = {
  size: "small" | "large";
};

const Text = styled.Text``

const PickerMultiFile:React.FC<PickerMultiFileProps> = () => {
  return (
    <SafeAreaView>
      <Text>PickerMultiFile</Text>
    </SafeAreaView>
  )
}

export default PickerMultiFile
