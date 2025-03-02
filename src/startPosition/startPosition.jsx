import React from 'react';

import styles from './startPosition.module.scss'

export const StartPosition = ({shift , setShift }) => {

    return <div className={styles.startPosition}>
        Стартовый сдвиг
        <Line type={"x"} setShift={setShift} shift={shift}/>
        <Line type={"y"} setShift={setShift} shift={shift}/>

    </div>
};

const Line = ({shift  , setShift , type})=>{

   return <div>
       <label>
       {type}
       <input value={shift[type]} onChange={(e)=>{
           console.log(e.target.value)
           setShift(prev=>{
               return {...prev ,[type]:e.target.value }
           })
       }} defaultValue={100} type="number"/>
   </label>
   </div>
}