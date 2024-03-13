import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import DatePicker from "./components/DatePicker";

function App() {

    const [dateValue, setDateValue] = useState<Date|null>(null);
    const [endDateValue, setEndDateValue] = useState<Date|null>(null);

  return (
    <>
      <DatePicker dateValue={dateValue} setDateValue={setDateValue} endDateValue={endDateValue} setEndDateValue={setEndDateValue}/>
    </>
  )
}

export default App
