import { View, SafeAreaView, TouchableOpacity } from "react-native";
import React from "react";
import styled from "styled-components/native";
import * as S from "./month.styled";
import Icon from "../../../Icon/Icon";
import { dateRange } from "../dateRange";
import dayjs from "dayjs";

type MonthPickerRangeProps = {
  onPress: (value: any) => void;
  fromMonth: string;
  toMonth: string;
};

const Text = styled.Text``;

const months = [
  { value: 1, label: "Jan" },
  { value: 2, label: "Feb" },
  { value: 3, label: "Mar" },
  { value: 4, label: "Apr" },
  { value: 5, label: "May" },
  { value: 6, label: "Jun" },
  { value: 7, label: "Jul" },
  { value: 8, label: "Aug" },
  { value: 9, label: "Sep" },
  { value: 10, label: "Oct" },
  { value: 11, label: "Nov" },
  { value: 12, label: "Dec" },
];

const MonthPickerRange: React.FC<MonthPickerRangeProps> = (props) => {
  const { onPress, fromMonth, toMonth } = props;

  const { currentDay, currentMonth, currentYear } = dateRange.getCurrentTime();

  const [month, setMonth] = React.useState(currentMonth);
  const [year, setYear] = React.useState(currentYear);

  const handlePick = (value: number) => {
    setMonth(value);
    onPress(`${value}-${year}`);
  };

  const isPickedMonth = (itemValue: number, itemYear: number) =>
    fromMonth === `${itemValue}-${itemYear}` || toMonth === `${itemValue}-${itemYear}`;

  const isChildMonth = (itemValue: number, itemYear: number) =>
    dayjs(fromMonth, 'M/YYYY').startOf('month').valueOf() < dayjs(`${itemValue}-${itemYear}`, 'M/YYYY').startOf('month').valueOf() &&
    dayjs(toMonth, 'M/YYYY').endOf('month').valueOf() > dayjs(`${itemValue}-${itemYear}`, 'M/YYYY').endOf('month').valueOf();
  return (
    <SafeAreaView>
      <S.ActionYear>
        <S.ButtonChevron onPress={() => setYear(year - 1)}>
          <Icon name="chevron-back" size={20} />
        </S.ButtonChevron>
        <Text style={{ fontWeight: "700", fontSize: 16 }}>{year}</Text>
        <S.ButtonChevron onPress={() => setYear(year + 1)}>
          <Icon name="chevron-forward" size={20} />
        </S.ButtonChevron>
      </S.ActionYear>
      <S.Container>
        {months.map((item, idx) => {
          return (
            <S.ItemPicker
              key={item.value}
              active={isPickedMonth(item.value, year)}
              child={isChildMonth(item.value, year)}
              onPress={() => handlePick(item.value)}
            >
              <S.LabelMonth
                active={isPickedMonth(item.value, year)}
                child={isChildMonth(item.value, year)}
                current={item.value === currentMonth && year === currentYear}
              >
                {item.label}
              </S.LabelMonth>
            </S.ItemPicker>
          );
        })}
      </S.Container>
    </SafeAreaView>
  );
};

export default MonthPickerRange;
