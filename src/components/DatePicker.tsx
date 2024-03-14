import {
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
    ChangeEvent,
    MouseEvent as ReactMouseEvent,
    KeyboardEvent,
    FocusEventHandler, SyntheticEvent
} from 'react';
import styles from "./DatePicker.module.css"
import {
    addOptionalZero,
    getDateFromInputString,
    getDaysAmountInCurrentMonth,
    getInputValueFromDateValue,
    getNextMonthDays,
    getPreviousMonthDays, isDisabled, isValidEndDateValue, isValidStartDateValue,
    weekDays, months, getHMS, getDayOfTheWeek, getNextMonth
} from "../utils/datePickerUtils";

interface PickDateProps {
    dateValue:Date,
    setDateValue:(value:Date)=>void,
    endDateValue:Date,
    setEndDateValue:(value:Date)=>void
}


export interface DateCellItem {
    date:number,
    month:number,
    year:number,
    type?:"prev"|"next"
}
const hours  = Array(24).fill(null).map((_, index) => index);
const minutes  = Array(60).fill(null).map((_, index) => index);
const seconds  = Array(60).fill(null).map((_, index) => index);

const isToday = ({year:cellYear, month:cellMonth, date:cellDate}:DateCellItem):boolean =>{
    const newDate = new Date()
    const [year, month, date] = [newDate.getFullYear(), newDate.getMonth(), new Date().getDate()]
    return year === cellYear && month === cellMonth && date === cellDate
}
const PickDate = ({dateValue, setDateValue, endDateValue, setEndDateValue}:PickDateProps) => {
    const [panelYear, setPanelYear] = useState(new Date().getFullYear())
    const [panelMonth, setPanelMonth] = useState(new Date().getMonth());
    const [hoverValue, setHoverValue] = useState<string>("");
    const [hoverEndValue, setHoverEndValue] = useState<string>("");
    const [dateType, setDateType] = useState<"end"|"start">("start")
    const startDate = useMemo(()=>{
        if(!dateValue) return;
        const year = dateValue.getFullYear();
        const month = dateValue.getMonth();
        const day = dateValue.getDate();
        return [year, month, day];
    },[dateValue]);
    const endDate = useMemo(()=>{
        if(!endDateValue)return
        const year = endDateValue.getFullYear();
        const month =endDateValue.getMonth();
        const day =  endDateValue.getDate();
        return [year, month, day]
    }, [endDateValue])
    const [inputValue, setInputValue] = useState<string>(()=>{
        return getInputValueFromDateValue(dateValue)
    });
    const [inputEndValue, setInputEndValue] = useState<string>("")
    const setDateValueOnCellClick =  (cell:DateCellItem) => (): void =>{
        const isStart = dateType === "start";
        const ymd = isStart ? startDate : endDate;
        if(ymd) {
            const [year, month, date] = ymd;
            if(year===cell.year && month===cell.month && cell.date === date) {
                setShowPopup(false);
                return;
            }
        }
        const newDateType = isStart ? dateValue : endDateValue;
        let newDate:Date;
        if(newDateType) {
            newDate = new Date(newDateType)
        }else {
            newDate = new Date();
            newDate.setHours(0, 0, 0)
        }
        newDate.setFullYear(cell.year);
        newDate.setMonth(cell.month);
        newDate.setDate(cell.date);
        !isStart ? setEndDateValue(newDate) : setDateValue(newDate)
    }

    const dateCells:DateCellItem[] = useMemo(() => {
        const daysInPreviousMonth = getPreviousMonthDays(panelYear, panelMonth);
        const daysInCurrentMonth = getDaysAmountInCurrentMonth(panelYear, panelMonth);
        const daysInNextMonth = getNextMonthDays(panelYear, panelMonth);
        return [...daysInPreviousMonth, ...daysInCurrentMonth, ...daysInNextMonth];
    }, [panelMonth, panelYear]);
    const [showPopup, setShowPopup] = useState<boolean>(false)
    const divRef = useRef<HTMLDivElement|null>(null);
    const inpRef = useRef<HTMLInputElement|null>(null);
    const endInpRef = useRef<HTMLInputElement>();
    const onPanelNextMonth = () =>{
        if(!showPopup) return;
        if(panelMonth === 11) {
            setPanelMonth(0)
            setPanelYear(prev=> prev+1)
        }
        else {
            setPanelMonth(prev=> prev+1)
        }
    }
    const onPreviousPanelMonth = () =>{
        if(!showPopup) return;
        if(panelMonth === 0) {
            setPanelMonth(11)
            setPanelYear(prev => prev-1)
        }
        else {
            setPanelMonth(prev => prev-1)
        }
    }
    const onPanelNextYear = () => {
        if(!showPopup) return;
        setPanelYear(prev=> prev + 1)
    }
    const onPanelPreviousYear = () => {
        if(!showPopup)return
        setPanelYear(prev => prev - 1)
    }
    const handleInputChange = (e:ChangeEvent<HTMLInputElement>) =>{
        if(!showPopup) {
            setShowPopup(true)
        }
        const value = e.target.value
        if(dateType==="start") {
            setInputValue(value);
            setHoverValue(value);
        }
        else {
            setInputEndValue(value);
            setHoverEndValue(value)
        }

    }

    const dateFromInputValue = useMemo(() => {
        return getDateFromInputString(inputValue) ?? dateValue
    }, [inputValue]);
    const endDateFromInputValue = useMemo(()=>{
        return getDateFromInputString(inputEndValue) ?? endDateValue
    }, [inputEndValue])
    console.log(dateFromInputValue)
    const isChosenDate = ({year:cellYear, date:cellDate, month:cellMonth}:DateCellItem):boolean =>{
        const dateVal:Date = dateFromInputValue ?? dateValue;
        if(!dateVal) return false;
        return (dateVal.getFullYear()===cellYear) && (dateVal.getDate()===cellDate ) && (dateVal.getMonth() ===cellMonth)
    }
    const isChosenEndDate = ({year:cellYear, date:cellDate, month:cellMonth}:DateCellItem):boolean =>{
        const dateVal:Date = endDateFromInputValue ?? endDateValue;
        if(!dateVal) return false;
        return (dateVal.getFullYear()===cellYear) && (dateVal.getDate()===cellDate ) && (dateVal.getMonth() ===cellMonth)
    }
    const handleSubmit = () =>{
        if(dateType==="start") {
            const ref = (endInpRef.current as HTMLInputElement)
            if(!isValidStartDateValue(inputValue, endDateValue)) {
                setInputValue(getInputValueFromDateValue(dateValue))
            }else {
                const newValFromInput = getDateFromInputString(inputValue)
                setDateValue(newValFromInput)
            }
            if(!endDateValue ) {
                setDateType("end");
                ref.focus();
                return
            }
            setShowPopup(false);
            ref.blur()
        }

        else {
            const ref = (inpRef.current as HTMLInputElement);
            if(!isValidEndDateValue(dateValue, inputEndValue)) {
                setInputEndValue(getInputValueFromDateValue(endDateValue))
            }
            else {
                setEndDateValue(getDateFromInputString(inputEndValue))
            }
            if(!dateValue) {
                setDateType("start");
                ref.focus();
                return;
            }
            setShowPopup(false);
            ref.blur()
        }
    }
    const handleKeyDown = (cb:()=>void) => (e:KeyboardEvent<HTMLInputElement>) =>{
        if(e.key !=="Enter") return;
        cb();
    }
    useLayoutEffect(()=>{
        if(!dateFromInputValue) return;
        setPanelMonth(dateFromInputValue.getMonth());
        setPanelYear(dateFromInputValue.getFullYear());
    }, [dateFromInputValue]);
    useLayoutEffect(()=>{
        if(!endDateFromInputValue) return;
        setPanelMonth(endDateFromInputValue.getMonth());
        setPanelYear(endDateFromInputValue.getFullYear());
    }, [endDateFromInputValue]);

    useEffect(()=>{
        const inpVal = getInputValueFromDateValue(dateValue)
        setInputValue(inpVal);
        setHoverValue(inpVal)
    }, [dateValue]);
    useEffect(()=>{
        const inpVal = endDateValue ? getInputValueFromDateValue(endDateValue) : ""
        setInputEndValue(inpVal);
        setHoverEndValue(inpVal)
    }, [endDateValue])
    useEffect(()=>{
        const handleClickOutside = ( e:MouseEvent ) =>{
            const target = e.target as HTMLElement;
            if((target as HTMLInputElement).type==="text") return;
            if(!(divRef.current as HTMLDivElement).contains(target) && !showPopup)return
            if((divRef.current as HTMLDivElement).contains(target) && showPopup ) {
                e.preventDefault()
            }
            if(!(divRef.current as HTMLDivElement).contains(target)) {
                setInputValue(getInputValueFromDateValue(dateValue));
                setHoverValue(getInputValueFromDateValue(dateValue));
                setShowPopup(false)

            }
        }
        window.addEventListener("mousedown", handleClickOutside);
        return ()=>{
            window.removeEventListener("mousedown", handleClickOutside)
        }
    }, [dateValue, showPopup]);
    const setHoursOnSelect = (e:ReactMouseEvent<HTMLLIElement>) =>{
        const currentDateVal = dateType === "start" ? dateValue : endDateValue;
        let {dataset:{value}, id} = e.target as HTMLSelectElement & {dataset:{value:string}, id:"setHours"|"setMinutes"|"setSeconds"};
        if(value.charAt(0)==="0") {
            value = value.charAt(1)
        }
        let newDate:Date;
        if(currentDateVal) {
            newDate = new Date(currentDateVal);
            newDate[id](+value);
        }else  {
            newDate = new Date();
            switch (id) {
                case "setHours": {
                    newDate.setHours(+value, 0, 0, 0);
                    break;
                }
                case "setMinutes" : {
                    newDate.setHours(0, +value, 0);
                    break;
                }
                case "setSeconds": {
                    newDate.setHours(0, 0, +value)
                }
            }
        }



        if(dateType === "start") {
            if(!endDateValue || newDate.getTime() < endDateValue.getTime()) {
                setDateValue(newDate)
            }
        }else  {
            if(!dateValue || newDate.getTime() > dateValue.getTime()) {
                setEndDateValue(newDate)
            }
        }
    }
    
    const handleMouseOver = (cell:DateCellItem) => () => {
        const isStart = dateType === "start";
        const {date, month, year} = cell;
        const currentDate = isStart ? dateValue : endDateValue;
        let newDate:Date;

        if(currentDate) {
            newDate = new Date(currentDate)
        }else {
            newDate = new Date()
            newDate.setHours(0, 0, 0) 
        }

        newDate.setFullYear(year);
        newDate.setMonth(month);
        newDate.setDate(date);

        const dateString = getInputValueFromDateValue(newDate);
        isStart ? setHoverValue(dateString) : setHoverEndValue(dateString);
        const activeRef = isStart ? inpRef : endInpRef;
        (activeRef.current as HTMLInputElement).style.color = "gray";
    }
    const handleRange = ({year, month, date}:DateCellItem) => {
        const start = dateValue && dateType==="end";
        const end = endDateValue && dateType==="start"
        const inRange:boolean =  start || end ;
        if(!inRange) return false;
        const dateVal = new Date(year, month, date);
        if(start && !end) {
            return dateVal.getTime() < getDateFromInputString(hoverEndValue)?.getTime() && dateVal.getTime() > getDateFromInputString(hoverValue).getTime();
        }
        else if(end && !start) {
            return dateVal.getTime() > getDateFromInputString(hoverValue)?.getTime() && dateVal.getTime()  < getDateFromInputString(hoverEndValue).getTime()
        }else return false // ??????

    }
    const handleFocus:FocusEventHandler = (e:SyntheticEvent):void =>{
        const target  = e.target as HTMLInputElement;
        setDateType(target.id as "end"|"start");
        target.style.borderBottom = "1px solid red"
    }
    const selectThisWeek = (offset=0) => () => {
        const newDate = new Date();
        if(offset > 0) {
            newDate.setDate(newDate.getDate() - offset)
        }
        newDate.setHours(0, 0, 0)
        const dayOfTheWeek = getDayOfTheWeek(newDate)
        const date = newDate.getDate();
        const startDate = new Date(newDate);
        startDate.setDate(date - dayOfTheWeek);
        setDateValue(startDate);
        const endDate = new Date(newDate);
        const endDay = date + (6 - dayOfTheWeek);
        endDate.setDate(endDay)
        setEndDateValue(endDate)
    }
    const selectThisMonth = (adjustBy?:number) => () => {
         const newDate = new Date();
         newDate.setHours(0, 0, 0);
         newDate.setDate(1);
         if(adjustBy) {
             newDate.setMonth(getNextMonth(newDate))
         }
         const nextDate = new Date(newDate);
         nextDate.setMonth(getNextMonth(newDate));
         nextDate.setDate(0);
         setDateValue(newDate);
         setEndDateValue(nextDate)
    }

    const handleMouseLeave = () => {
        const isStart = dateType === "start"
        const activeRef = isStart ? inpRef : endInpRef;
        (activeRef.current as HTMLInputElement).style.color = "aliceblue";
        isStart ? setHoverValue(getInputValueFromDateValue(dateValue) ?? "") : setHoverEndValue(getInputValueFromDateValue(endDateValue) ?? "")
    }
    const last7Days = () => {
        const newDate = new Date();
        newDate.setHours(0, 0,0);
        const newEndDate = new Date(newDate)
        newDate.setDate(newDate.getDate() - 7);
        setDateValue(newDate);
        setEndDateValue(newEndDate)
    }
    const openPopup = () => {
            if(showPopup) return;
            setShowPopup(true);
    }
    return (
        <div ref={divRef} >
            <div className={styles.container} >
                <span onClick={onPanelPreviousYear} className={styles.arrow}>&laquo; </span>
                <span onClick={onPreviousPanelMonth} className={styles.arrow}> &lsaquo;  </span>

                <span onClick={onPanelNextMonth} className={styles.arrow}>&rsaquo;</span>
                <span onClick={onPanelNextYear} className={styles.arrow}>&raquo;</span>
                {dateFromInputValue && <span>{addOptionalZero(dateFromInputValue.getHours())}:{addOptionalZero(dateFromInputValue.getMinutes())}:{addOptionalZero(dateFromInputValue.getSeconds())}</span>}

                <input type="text" id={"start"} onFocus={handleFocus} onKeyDown={handleKeyDown(handleSubmit)} value={hoverValue} onChange={handleInputChange} ref={inpRef} onClick={openPopup}/>
                <input type="text" id={"end"} onFocus={handleFocus} onKeyDown={handleKeyDown(handleSubmit)} ref={endInpRef} value={hoverEndValue} onChange={handleInputChange} onClick={openPopup}/>
            </div>

            {showPopup &&
            <div className={styles.popup}>
                <div  className={styles.panel}>
                    {weekDays.map((day, index) => <div key={index}>{day}</div>)}
                    {dateCells.map((cell, index) => {
                        let cellDate:Date = new Date(cell.year, cell.month, cell.date);

                        let isDisabledCell:boolean = false;
                        const isStart = dateType === "start";
                        if(isStart) {
                            if(endDateValue) {
                                if(dateValue) {
                                    cellDate.setHours(...getHMS(dateValue))
                                }
                                isDisabledCell = isDisabled(cellDate, endDateValue, "start")
                            }
                        }else {
                            if(dateValue) {
                                if(endDateValue) {
                                    cellDate.setHours(...getHMS(endDateValue))
                                }
                                isDisabledCell = isDisabled(cellDate, dateValue, "end")
                            }
                        }
                        const isChosen = isChosenEndDate(cell) || isChosenDate(cell) ;
                        const inRange = handleRange(cell);
                        let style = `${styles.cell} `;
                        if(isDisabledCell) {
                            style += `${styles.disabled} `
                        }
                        if(inRange) {
                            style += `${styles.inRange} `
                        }
                        if(isChosen) {
                            style += `${styles.chosen} `
                        }
                        if(isToday(cell)) {
                            style += `${styles.isToday} `
                        }
                        return <div className={style} id="cell" onMouseEnter={handleMouseOver(cell)} onMouseLeave={handleMouseLeave} style={{

                        }} key={index} onClick={setDateValueOnCellClick(cell)}>{cell.date} </div>
                    })}
                    <button onClick={handleSubmit}>OK</button>
                    <button onClick={last7Days}>Last 7 days</button>
                    <button onClick={selectThisWeek()}>This week</button>
                    <button onClick={selectThisWeek(7)}>Previous week</button>
                    <button onClick={selectThisMonth()}>This month</button>
                    <button onClick={selectThisMonth(1)}>Next month</button>
                </div>

                <ul className={styles.list} >
                    {hours.map((hour)=> <li id="setHours" data-value={hour} key={hour} onClick={setHoursOnSelect}>{addOptionalZero(hour)}</li>)}
                </ul >
                <ul  className={styles.list}>
                    {minutes.map((hour)=> <li id="setMinutes" data-value={hour} key={hour} onClick={setHoursOnSelect}>{addOptionalZero(hour)}</li>)}
                </ul>
                <ul  className={styles.list}>
                    {seconds.map((hour)=> <li id="setSeconds" data-value={hour} key={hour} onClick={setHoursOnSelect}>{addOptionalZero(hour)}</li>)}
                </ul>
            </div>
            }
        </div>
    );
};

export default PickDate;