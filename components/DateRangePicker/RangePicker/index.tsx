import Icon from 'assets/icons';
import dayjs from "dayjs";
import customParseFormat from 'dayjs/plugin/customParseFormat';
import isoWeek from 'dayjs/plugin/isoWeek';
import utc from 'dayjs/plugin/utc';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, View } from 'react-native';
import styled from 'styled-components/native';
import { color, size } from 'theme';
import DatePickerRange from './Date';
import { dateRange } from './dateRange';
import MonthPicker from './Month';
import * as S from './range.styled';
import { Text } from '../../Typography';


dayjs.extend(customParseFormat)
dayjs.extend(utc);
dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);

type RangePickerProps = {
  onChange:(value: any) => void
  picker?:"date" | "week" | "month" | "year"
};

const TAB_FILTER = [
  {
    id: 1,
    title: "Tuần",
  },
  {
    id: 2,
    title: "Tháng",
  },
  {
    id: 3,
    title: "Năm",
  },
];



const RangePicker:React.FC<RangePickerProps> = (props: RangePickerProps) => {

  const { onChange, picker = 'date' } = props;

  const [tab, setTab] = useState(TAB_FILTER[0]);
  const [pickFrom, setPickFrom] = useState<boolean>(false)
  const [pickTo, setPickTo] = useState<boolean>(false)
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  const [fromMonth, setFromMonth] = useState<string>("");
  const [toMonth, setToMonth] = useState<string>("");

  useEffect(() => {
    if (picker === 'date') {
      updateDateRange(dateRange.getWeekRange());
      return;
    }else if(picker === 'month'){
      updateDateRange(dateRange.getYearRange());
      return;
    }
  }, []);

  const handleTab = (item: { id: number; title: string }) => {
    if (item.id === tab.id) return;
    setTab(item);
    switch (item.id) {
        case 1:
            updateDateRange(dateRange.getWeekRange());
            break;
        case 2:
            updateDateRange(dateRange.getMonthRange());
            break;
        case 3:
            updateDateRange(dateRange.getYearRange());
            break;
        default:
            console.warn('Unknown tab id:', item.id);
    }
  };

  const updateDateRange = (range: { start: dayjs.Dayjs; end: dayjs.Dayjs }) => {
    if(picker === 'date'){
      setFromDate(range.start.format('YYYY-MM-DD'));
      setToDate(range.end.format('YYYY-MM-DD'));
    }else if(picker === 'month'){
      setFromMonth(range.start.format('M-YYYY'));
      setToMonth(range.end.format('M-YYYY'));
    }
    onChange({fromDate:range.start, toDate:range.end})
  };

  const handlePickFrom = () => {
    setPickFrom(!pickFrom)
    setPickTo(false)
  }

  const handlePickTo = () => {
    setPickTo(!pickTo)
    setPickFrom(false)
  }

  const handleDayPress = (value:any) => {
    if(pickFrom){
      setFromDate(value.dateString)
      setPickTo(true)
      setPickFrom(false)
      if(toDate){
        let end = dayjs.utc(toDate).valueOf()
        if(value.timestamp > end){
          setToDate('')
        }
      }
    }else if(pickTo){
      setPickTo(false)
      setPickFrom(false)
      setToDate(value.dateString)
    }
  };

  const handleMonthPress = (value:string) => {
    console.log('value: handleMonthPress', value);
    if(pickFrom){
      setFromMonth(value)
      setPickTo(true)
      setPickFrom(false)
    }else if(pickTo){
      setPickTo(false)
      setPickFrom(false)
      setToMonth(value)
    }
  }
  useEffect(() => {
    if(picker === 'date' && fromDate && toDate && !pickFrom && !pickTo){
      onChange({
        fromDate: dayjs.utc(fromDate).format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
        toDate : dayjs.utc(toDate).endOf('day').format('YYYY-MM-DDTHH:mm:ss.SSS[Z]')
      })
    }else if(picker === 'month' && fromMonth && toMonth && !pickFrom && !pickTo){
      onChange({
        fromDate: dayjs(fromMonth, 'M/YYYY').startOf('month').format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
        toDate : dayjs(toMonth, 'M/YYYY').endOf('month').format('YYYY-MM-DDTHH:mm:ss.SSS[Z]')
      })
    }
  }, [fromDate, toDate, pickFrom, pickTo])
  // dayjs(fromMonth, 'M/YYYY').startOf('month').valueOf()
  const renderFrom = () => {
    if(picker === 'date'){
      return <Text>{fromDate ? dayjs(fromDate).format('DD-MM-YYYY') : "--/--/----"}</Text>
    }else if(picker === 'month'){
      return <Text>{fromMonth ? fromMonth : "--/----"}</Text>
    }
  }
  const renderTo = () => {
    if(picker === 'date'){
      return <Text>{toDate ? dayjs(toDate).format('DD-MM-YYYY') : "--/--/----"}</Text>
    }else if(picker === 'month'){
      return <Text>{toMonth ? toMonth : "--/----"}</Text>
    }
  }

  const removeFrom = () => {
    setFromDate('')
    setFromMonth('')
    const key = picker === 'date' ? 'fromDate' : 'fromMonth';
    onChange({ [key]: '' });

  }

  const removeTo = () => {
    setToMonth('')
    setToDate('')
    const key = picker === 'date' ? 'toDate' : 'toMonth';
    onChange({ [key]: '' });
  }

  return (
    <SafeAreaView>
      {picker === 'date' &&
        <S.ContainerTab>
          {TAB_FILTER.map((item, idx) => (
            <S.Tab
              active={tab.id === item.id}
              key={idx}
              onPress={() => handleTab(item)}
            >
              <S.ContentTab active={tab.id === item.id}>
                {item.title}
              </S.ContentTab>
            </S.Tab>
          ))}
        </S.ContainerTab>
      }
      <S.ContainerDate>
        <S.DatePicker>
          <S.Picker active={pickFrom} onPress={handlePickFrom}>
            <Icon name="calendar" />
            {renderFrom()}
            {/* <Text>{fromDate ? dayjs(fromDate).format('DD-MM-YYYY') : "----/--/--"}</Text> */}
            <S.ButtonRemove onPress={removeFrom} >
              <Icon name="x" color={color.white} size={12} />
            </S.ButtonRemove>
          </S.Picker>
        </S.DatePicker>
        <S.DatePicker>
          <S.Picker active={pickTo} onPress={handlePickTo}>
            <Icon name="calendar" />
            {renderTo()}
            {/* <Text>{toDate ? dayjs(toDate).format('DD-MM-YYYY') : "----/--/--"}</Text> */}
            <S.ButtonRemove onPress={removeTo} >
              <Icon name="x" color={color.white} size={12} />
            </S.ButtonRemove>
          </S.Picker>
        </S.DatePicker>
      </S.ContainerDate>

      {(pickFrom || pickTo) &&
        <View style={{marginTop:size.spacing, borderRadius:8, overflow: 'hidden',}}>
          {picker === 'month' ?
            <MonthPicker fromMonth={fromMonth} toMonth={toMonth} onPress={handleMonthPress}  />
            :
            <DatePickerRange fromDate={fromDate} toDate={toDate} onPress={handleDayPress} />
        }
        </View>
      }
    </SafeAreaView>
  )
}

export default RangePicker
