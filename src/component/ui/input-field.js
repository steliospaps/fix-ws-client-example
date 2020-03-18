import React from 'react';
import {FormInput} from 'shards-react';

export default function InputField({ labelName, id, type, ...restProps }) {
  return (
    <div className="input-container">
      <label htmlFor={id}>{labelName}: </label>
        <FormInput type={type} id={id} {...restProps}/>
    </div>
  )
}
