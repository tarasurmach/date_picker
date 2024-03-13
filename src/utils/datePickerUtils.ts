import {DateCellItem} from "../../../trello/src/components/PickDate";

export const getDaysAmountInMonth = (year:number, month:number):number =>{
    return new Date(year, month+1, 0).getDate()
}
const sundayToMonday:Record<number, number> = {
    0:6,
    1:0,
    2:1,
    3:2,
    4:3,
    5:4,
    6:5
}

const getDayOfTheWeek = (date:Date):number =>{
    console.log(date)
    const day = date.getDay();
    console.log(day)
    return sundayToMonday[day]
}
export const weekDays:string[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const months:string[] = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec"]
const TOTAL_CELLS = 6*7;
export const getPreviousMonthDays = (year:number, month:number):DateCellItem[] =>{
    const firstDayOfCurrentMonth = new Date(year, month, 1);
    const cellsAmountInPreviousMonth = getDayOfTheWeek(firstDayOfCurrentMonth);

    const daysAmountInPreviousMonth = getDaysAmountInMonth(year, month-1);
    const [cellYear, cellMonth] = month ===0 ? [year - 1 , 11] : [year, month-1];
    const dateCells:DateCellItem[] = [];
    for(let i = daysAmountInPreviousMonth; i>daysAmountInPreviousMonth-cellsAmountInPreviousMonth; i--) {
        dateCells.unshift({
            date:i,
            year:cellYear,
            month:cellMonth
        })
    }
    return dateCells

}
export const getNextMonthDays = (year:number, month:number):DateCellItem[] =>{
    const firstDayOfTheCurrentMonth = new Date(year, month, 1);
    const cellsAmountInPreviousMonth = getDayOfTheWeek(firstDayOfTheCurrentMonth);
    const nextMonthDaysAmount = TOTAL_CELLS - cellsAmountInPreviousMonth - getDaysAmountInMonth(year, month);
    const dateCells:DateCellItem[] = [];
    const [cellYear, cellMonth] = month === 11 ? [year+1, 0] : [year, month+1]
    for(let i = 1; i <=nextMonthDaysAmount; i++) {
        dateCells.push({
            date:i,
            year:cellYear,
            month:cellMonth
        })
    }
    return dateCells
}
export const getDaysAmountInCurrentMonth = (year:number, month:number):DateCellItem[] =>{
    const daysAmountInMonth = getDaysAmountInMonth(year, month);
    const dateCells:DateCellItem[] = [];
    console.log(daysAmountInMonth)
    for(let i =1; i <= daysAmountInMonth; i++) {
        dateCells.push({
            date:i,
            year,
            month
        })
    }
    return dateCells
}
const inputStringToNumber = (inputValue:string):number[] =>{
    const dateProps = inputValue.split(" ");
    const [date, month, year] = dateProps[0].split("-").map(Number);
    const [hour, minute, second] = dateProps[1].split(":").map(Number)
    return [date, month, year, hour, minute, second]
}
export const isValidInputString = (inputValue:string) =>{
    const inputDateRegex = /^\d{2}-\d{2}-\d{4}\s{1}\d{2}:\d{2}:\d{2}$/ ;
    const isValidRegex = inputDateRegex.test(inputValue);
    //console.log(isValidRegex)
    if(!isValidRegex) return false;
    const [date, month, year]  = inputStringToNumber(inputValue)
    if(month<1 || month > 12) return false;
    const maxDayAmountInMonth = getDaysAmountInMonth(year, month-1)
    return !(date < 1 || date > maxDayAmountInMonth);
}

export const getDateFromInputString = (inputString:string):Date =>{
    if(!isValidInputString(inputString)) return
    const [date, month, year, hour, minute, second] = inputStringToNumber(inputString);
    //console.log("setting from input")
    return new Date(year, month-1, date, hour, minute, second)
}
export const addOptionalZero = (num:number) =>{
    return num < 10 ? `0${num}` : num
}
export const getInputValueFromDateValue = (dateValue:Date):string =>{
    if(!dateValue) return
    const [date, month, year, hour, minute, second] = [dateValue.getDate(), dateValue.getMonth()+1, dateValue.getFullYear(), dateValue.getHours(), dateValue.getMinutes(), dateValue.getSeconds()];
    console.log(date, month, year)
    return `${addOptionalZero(date)}-${addOptionalZero(month)}-${year} ${addOptionalZero(hour)}:${addOptionalZero(minute)}:${addOptionalZero(second)}`
}
export const isValidEndDateValue= (startDate:Date, endDateString:string):boolean =>{
    if(!isValidInputString(endDateString)) return false;
    if(!startDate) return true;
    const endDate:Date = getDateFromInputString(endDateString);
    return endDate.getTime() > startDate.getTime()
}
export const isValidStartDateValue = (startDateString:string, endDate:Date):boolean =>{
    if(!isValidInputString(startDateString)) return false;
    if(!endDate) return true;
    const startDate = getDateFromInputString(startDateString);
    return startDate.getTime() < endDate.getTime();
}
export const isDisabled = (date:Date, endDate:Date, type:"start"|"end"):boolean => {
    if(type === "start") {
        return date.getTime() > endDate.getTime()
    }else {
        return endDate.getTime() > date.getTime()
    }

}
export const getHMS = (dateValue:Date):[number, number, number] =>   {
    if(!(dateValue instanceof Date)) return;
    return [dateValue.getHours(), dateValue.getMinutes(), dateValue.getSeconds()];
}