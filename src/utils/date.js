import { startOfToday, setHours, setMinutes, setSeconds, startOfDay } from "date-fns";


export const formatLocalDate = (date) => {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    const hours = `${date.getHours()}`.padStart(2, '0');
    const minutes = `${date.getMinutes()}`.padStart(2, '0');
    const seconds = `${date.getSeconds()}`.padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};


export const formatHour = (fecha) => {
    const date = new Date(fecha);
    return date.toISOString().substring(11, 19);
};
export function parseHourHHMMNNToDate(time) {
if(time instanceof Date){
    return time
}
    const [hours, minutes, seconds] = time.split(":").map(Number);
    return setSeconds(setMinutes(setHours(startOfToday(), hours), minutes), seconds);
}

export const resetTimeToMidnight = (date) => {
    if (!date) return null;
    const dateObj = date instanceof Date ? date : new Date(date);
    return startOfDay(dateObj);
};

export const formatLocalDateAtMidnight = (date) => {
    if (!date) return '';
    const dateWithMidnight = resetTimeToMidnight(date);
    return formatLocalDate(dateWithMidnight);
};