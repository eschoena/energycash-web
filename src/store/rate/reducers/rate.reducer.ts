import {createReducer} from "@reduxjs/toolkit";
import {fetchRatesModel, saveNewRate, selectRate, updateRate} from "../actions/rate.action";
import {adapter, initialState} from "../states";

export const reducer = createReducer(initialState, builder =>
  builder
    .addCase(fetchRatesModel.fulfilled, (state, action) => {
      const {rates} = action.payload
      return adapter.setAll({...state, selectedRate: undefined}, rates)
    })
    .addCase(saveNewRate.fulfilled, (state, action) => {
      return adapter.addOne({...state, selectedRate: action.payload}, action.payload)
    })
    .addCase(updateRate.fulfilled, (state, action) => {
      // return adapter.setOne(state, action.payload);
      console.log(action.payload)
      return adapter.updateOne({...state, selectedRate: action.payload}, {id: action.payload.id, changes: action.payload})
    })
    .addCase(selectRate, (state, action) => {
      return {...state, selectedRate: action.payload}
    })
);
