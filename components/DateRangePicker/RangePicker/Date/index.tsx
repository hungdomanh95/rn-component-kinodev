import { View, SafeAreaView } from 'react-native'
import React, { useCallback } from 'react'
import styled from 'styled-components/native'
import { Calendar, CalendarUtils } from "react-native-calendars";
import { color } from 'theme';
type DatePickerRangeProps = {
  fromDate: string
  toDate: string
  onPress: (value: any) => void
};

const Text = styled.Text``

const DatePickerRange:React.FC<DatePickerRangeProps> = (props: DatePickerRangeProps) => {

  const { fromDate, toDate, onPress } = props;

  const getDate = (count: number) => {
    const date = new Date(fromDate);
    const newDate = date.setDate(date.getDate() + count);
    return CalendarUtils.getCalendarDateString(newDate);
  };

  const renderPeriod = useCallback(() => {
    const cssFromTo = {color: '#2286B8', textColor: 'white'};
    const cssChild = {color: '#8DC8E8', textColor: 'white'};

    const start = new Date(fromDate);
    const end = new Date(toDate);
    const timeDiff = end.getTime() - start.getTime();
    const daysCount = Math.ceil(timeDiff / (1000 * 3600 * 24)) - 1;

    const dateList = Array.from({length: daysCount}, (_, idx) => getDate(idx + 1));
    const dateObject = dateList.reduce((result, date) => {
      return {...result, [date]: cssChild}
    }, {});

    return {
      [fromDate]: {...cssFromTo, startingDay: true},
      ...dateObject,
      [toDate]: {...cssFromTo, endingDay: true}
    };
  }, [fromDate, toDate, getDate]);

  return (
    <SafeAreaView>
       <Calendar
        onDayPress={onPress}
        markingType={'period'}
        markedDates={renderPeriod()}
        minDate={fromDate}
        theme={{
          arrowColor: color.secondary,
          todayTextColor: color.secondary,
        }}
        enableSwipeMonths
        hideExtraDays
        disableAllTouchEventsForDisabledDays
        firstDay={1}
      />
    </SafeAreaView>
  )
}

export default DatePickerRange
