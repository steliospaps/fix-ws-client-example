import React from 'react';
import {FormSelect} from 'shards-react';

export default function SelectField({options, labelName, id, onSelectChanged}) {

  return (
    <div className="select-field">
      <label htmlFor={id}>{labelName}: </label>
      <FormSelect id={id} onChange={(e) => onSelectChanged(e.target.value)}>
        {options.map(option =>
          <option key={option.value} value={option.value}>{option.name}</option>
        )}
      </FormSelect>
    </div>
  )
};
