import { DatePicker, parseDate, HStack, VStack, Select, Portal, createListCollection, Text, Button, type DateValue } from "@chakra-ui/react"
import { useDate } from "../../hooks/useDate"
import { toaster } from "../ui/toaster";
import { useDeviceStore } from "../../store/deviceStore";

interface CalendarPops {
  onTime: (
    year: number, 
    month: number, 
    day: number, 
    hour: number, 
    minute: number, 
    second: number, 
    timezone: number
  ) => Promise<void>;
}

export function Calendar({onTime}: CalendarPops) {
  const isConnected = useDeviceStore((state) => state.isConnected);
  const isTimeSuccess = useDeviceStore((state) => state.successFlags.time);
  const { dateValue, isErrorDate, errorMessageDate, year, month, day, hours, minutes, seconds, timezone, validDate, handleDateValue, handleHours, handleMinutes, handleSeconds, handleTimezone } = useDate();

  const hourCollection = createListCollection({
    items: Array.from({ length: 24 }, (_, i) => ({
      label: i.toString().padStart(2, '0'),
      value: i.toString().padStart(2, '0')
    }))
  });

  const minuteCollection = createListCollection({
    items: Array.from({ length: 60 }, (_, i) => ({
      label: i.toString().padStart(2, '0'),
      value: i.toString().padStart(2, '0')
    }))
  })

  const secondCollection = createListCollection({
    items: Array.from({ length: 60 }, (_, i) => ({
      label: i.toString().padStart(2, '0'),
      value: i.toString().padStart(2, '0')
    }))
  })

  const timezoneCollection = createListCollection({
    items: [
      { label: "UTC-12:00 (Бейкер)", value: "-1200" },
      { label: "UTC-11:00 (Паго-Паго)", value: "-1100" },
      { label: "UTC-10:00 (Гонолулу)", value: "-1000" },
      { label: "UTC-09:30 (Маркизские острова)", value: "-0930" },
      { label: "UTC-09:00 (Анкоридж)", value: "-0900" },
      { label: "UTC-08:00 (Лос-Анджелес)", value: "-0800" },
      { label: "UTC-07:00 (Денвер)", value: "-0700" },
      { label: "UTC-06:00 (Чикаго)", value: "-0600" },
      { label: "UTC-05:00 (Нью-Йорк)", value: "-0500" },
      { label: "UTC-04:00 (Галифакс)", value: "-0400" },
      { label: "UTC-03:30 (Сент-Джонс)", value: "-0330" },
      { label: "UTC-03:00 (Буэнос-Айрес)", value: "-0300" },
      { label: "UTC-02:00 (Южная Георгия)", value: "-0200" },
      { label: "UTC-01:00 (Понта-Делгада)", value: "-0100" },
      { label: "UTC+00:00 (Лондон)", value: "0000" },
      { label: "UTC+01:00 (Париж)", value: "+0100" },
      { label: "UTC+02:00 (Киев)", value: "+0200" },
      { label: "UTC+03:00 (Москва)", value: "+0300" },
      { label: "UTC+03:30 (Тегеран)", value: "+0330" },
      { label: "UTC+04:00 (Дубай)", value: "+0400" },
      { label: "UTC+04:30 (Кабул)", value: "+0430" },
      { label: "UTC+05:00 (Карачи)", value: "+0500" },
      { label: "UTC+05:30 (Мумбаи)", value: "+0530" },
      { label: "UTC+05:45 (Катманду)", value: "+0545" },
      { label: "UTC+06:00 (Астана)", value: "+0600" },
      { label: "UTC+06:30 (Янгон)", value: "+0630" },
      { label: "UTC+07:00 (Новосибирск)", value: "+0700" },
      { label: "UTC+08:00 (Иркутск)", value: "+0800" },
      { label: "UTC+08:45 (Юго-Восточная Австралия)", value: "+0845" },
      { label: "UTC+09:00 (Якутск)", value: "+0900" },
      { label: "UTC+09:30 (Аделаида)", value: "+0930" },
      { label: "UTC+10:00 (Владивосток)", value: "+1000" },
      { label: "UTC+10:30 (Лорд-Хау)", value: "+1030" },
      { label: "UTC+11:00 (Магадан)", value: "+1100" },
      { label: "UTC+12:00 (Камчатка)", value: "+1200" },
      { label: "UTC+12:45 (Острова Чатем)", value: "+1245" },
      { label: "UTC+13:00 (Нукуалофа)", value: "+1300" },
      { label: "UTC+13:45 (Острова Чатем)", value: "+1345" },
      { label: "UTC+14:00 (Киритимати)", value: "+1400" },
    ]
  });

  const formatSelectedDate = (dateValue: DateValue | null): string => {
    if (!dateValue) return "Дата не выбрана";
    
    // Преобразование DateValue в Date
    const date = new Date(dateValue.year, dateValue.month - 1, dateValue.day);
    
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleSaveDate = async () => {
    if (validDate(dateValue) && !isErrorDate) {
      await onTime(year, month, day, +hours, +minutes, +seconds, +timezone);
      if (isTimeSuccess) {
        toaster.create({
          description: "Время успешно записано",
          type: "success",
        });
      }
    } else if (isErrorDate) {
      toaster.create({
        description: errorMessageDate,
        type: "error",
      });
    } else {
      toaster.create({
        description: "Ошибка при записи времени",
        type: "error",
      });
    }
  }

  const handleSaveCurrentTime = async () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; 
    const currentDay = now.getDate();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentSecond = now.getSeconds();

    // Получаем смещение часового пояса в минутах и преобразуем его в формат ±HHMM
    const timezoneOffset = -now.getTimezoneOffset(); // количество минут, которое нужно добавить к местному времени для получения UTC
    const tzSign = timezoneOffset >= 0 ? "+" : "-";
    const tzHours = Math.floor(Math.abs(timezoneOffset) / 60).toString().padStart(2, '0');
    const tzMinutes = (Math.abs(timezoneOffset) % 60).toString().padStart(2, '0');
    const tzValue = `${tzSign}${tzHours}${tzMinutes}`;

    await onTime(currentYear, currentMonth, currentDay, currentHour, currentMinute, currentSecond, +tzValue);
    if (isTimeSuccess) {
      toaster.create({
        description: "Текущее время успешно записано",
        type: "success",
      });
    } else {
      toaster.create({
        description: "Ошибка при записи времени",
        type: "error",
      });
    }

  }

  return (
    <VStack gap={4}>
      <DatePicker.Root 
        min={parseDate("2000-01-01")}
        max={parseDate(new Date())}
        inline 
        width="fit-content"
        value={dateValue ? [dateValue] : undefined}
        onValueChange={(details) => {
          if (details.value && details.value[0]) {
            handleDateValue(details.value[0]);
          }
        }}  
      >
        <DatePicker.Content unstyled>
          <DatePicker.View view="day">
            <DatePicker.Header />
            <DatePicker.DayTable />
          </DatePicker.View>
          <DatePicker.View view="month">
            <DatePicker.Header />
            <DatePicker.MonthTable />
          </DatePicker.View>
          <DatePicker.View view="year">
            <DatePicker.Header />
            <DatePicker.YearTable />
          </DatePicker.View>
        </DatePicker.Content>
      </DatePicker.Root>
      {/* Показываем выбранную дату */}
      <Text fontSize="sm" color="gray.600">
        {formatSelectedDate(dateValue)}
      </Text>

      <VStack>
        <Text>Выбор времени:</Text>
        <HStack>
          {/* часы */}
          <Select.Root 
            collection={hourCollection} 
            size="sm" 
            value={[hours]}
            onValueChange={(details) => handleHours(details.value[0])}
            width="60px"
          >
            <Select.HiddenSelect />
            <Select.Control>
              <Select.Trigger>
                <Select.ValueText placeholder="Часы" />
              </Select.Trigger>
              <Select.IndicatorGroup>
                <Select.Indicator />
              </Select.IndicatorGroup>
            </Select.Control>
            <Portal>
              <Select.Positioner>
                <Select.Content>
                  {hourCollection.items.map((item) => (
                    <Select.Item item={item} key={item.value}>
                      {item.label}
                      <Select.ItemIndicator />
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Positioner>
            </Portal>
          </Select.Root>

          <Text>:</Text>

          {/* минуты */}
          <Select.Root 
            collection={minuteCollection} 
            size="sm" 
            value={[minutes]}
            onValueChange={(details) => handleMinutes(details.value[0])}
            width="60px"
          >
            <Select.HiddenSelect />
            <Select.Control>
              <Select.Trigger>
                <Select.ValueText placeholder="Минуты" />
              </Select.Trigger>
              <Select.IndicatorGroup>
                <Select.Indicator />
              </Select.IndicatorGroup>
            </Select.Control>
            <Portal>
              <Select.Positioner>
                <Select.Content>
                  {minuteCollection.items.map((item) => (
                    <Select.Item item={item} key={item.value}>
                      {item.label}
                      <Select.ItemIndicator />
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Positioner>
            </Portal>
          </Select.Root>

          <Text>:</Text>

          {/* секунды */}
          <Select.Root 
            collection={secondCollection} 
            size="sm" 
            value={[seconds]}
            onValueChange={(details) => handleSeconds(details.value[0])}
            width="60px"
          >
            <Select.HiddenSelect />
            <Select.Control>
              <Select.Trigger>
                <Select.ValueText placeholder="Секунды" />
              </Select.Trigger>
              <Select.IndicatorGroup>
                <Select.Indicator />
              </Select.IndicatorGroup>
            </Select.Control>
            <Portal>
              <Select.Positioner>
                <Select.Content>
                  {secondCollection.items.map((item) => (
                    <Select.Item item={item} key={item.value}>
                      {item.label}
                      <Select.ItemIndicator />
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Positioner>
            </Portal>
          </Select.Root>
        </HStack>
        {/* часовой пояс */}
        <Text fontWeight="medium">Выбор часового пояса:</Text>
        <Select.Root 
          collection={timezoneCollection} 
          size="sm" 
          value={[timezone]}
          onValueChange={(details) => handleTimezone(details.value[0])}
          width="220px"
        >
          <Select.HiddenSelect />
          <Select.Control>
            <Select.Trigger>
              <Select.ValueText placeholder="Часовой пояс" />
            </Select.Trigger>
            <Select.IndicatorGroup>
              <Select.Indicator />
            </Select.IndicatorGroup>
          </Select.Control>
          <Portal>
            <Select.Positioner>
              <Select.Content>
                {timezoneCollection.items.map((item) => (
                  <Select.Item item={item} key={item.value}>
                    {item.label}
                    <Select.ItemIndicator />
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Positioner>
          </Portal>
        </Select.Root>
      </VStack>
      <VStack>
        <Button onClick={handleSaveDate} disabled={!isConnected}>
          Записать время
        </Button>
        <Button onClick={handleSaveCurrentTime} disabled={!isConnected}>
          Записать время из текущей системы
        </Button>
      </VStack>
    </VStack>
  )
}