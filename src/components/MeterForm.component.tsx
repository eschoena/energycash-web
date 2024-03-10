import React, {FC, useContext, useEffect, useState} from "react";
import {FormProvider, useForm} from "react-hook-form";
import {useAppDispatch, useAppSelector} from "../store";
import {ratesSelector} from "../store/rate";
import {selectedTenant} from "../store/eeg";
import {removeMeteringPoint, selectedMeterIdSelector, selectedMeterSelector, selectedParticipantSelector, updateMeteringPoint} from "../store/participant";
import {Metering} from "../models/meteringpoint.model";
import MeterFormElement from "./core/MeterForm.element";
import EegPaneTemplate from "./core/EegPane.template";
import MeterAddressFormElement from "./core/forms/MeterAddressForm/MeterAddressForm.element";
import InverterFormElement from "./core/InverterForm.element";

interface MeterFromComponentProps {
  meteringPoint: Metering
}

const MeterFormComponent: FC<MeterFromComponentProps> = ({meteringPoint}) => {

  const dispatcher = useAppDispatch()
  const participant = useAppSelector(selectedParticipantSelector);

  const rates = useAppSelector(ratesSelector);
  const tenant = useAppSelector(selectedTenant);
  const metering = useAppSelector(selectedMeterSelector);

  // const [withWechselrichter, setWithWechselrichter] = useState(false);

  // const {handleSubmit, control, watch, formState: {errors, isDirty, dirtyFields}, reset, clearErrors} = useForm<Metering>({mode: 'onBlur', defaultValues: {...meteringPoint}, values: metering});

  const formMethods = useForm<Metering>({mode: 'onBlur', defaultValues: {...meteringPoint}, values: metering});
  const {handleSubmit, formState: { dirtyFields}, reset, setValue} = formMethods

  useEffect(() => {
    reset(metering)
  }, [metering])

  const onSubmit = (meter: Metering) => {
    console.log("dirtyFields ", dirtyFields)
    if (Object.keys(dirtyFields).length > 0) {
      const participantId = participant?.id;
      if (participantId) {
        dispatcher(updateMeteringPoint({tenant, participantId, meter}))
        reset(meter);
      }
    }
  }

  const onChangeDate = (name: string, value: any) => {
    console.log("handle change ", value)
    handleSubmit((data) => onSubmit(data))()
  }

  const onChange = (values: {name: string, value: any}[], event?: any) => {
    values.forEach(v => {
      setValue(v.name as keyof Metering, v.value, {shouldDirty: true, shouldValidate: true})
    })
    handleSubmit((data) => onSubmit(data))(event)
  }

  // const onRemoveInverter = (inverterid: string) => {
  //   const participantId = participant?.id;
  //   const m = {participantId: participantId, meteringPoint: inverterid, direction: "INVERTER"} as Metering
  //   if (participantId) dispatcher(removeMeteringPoint({tenant, participantId, meter: m}))
  // }

  const Contents = () => {
    
    if (metering?.direction === "INVERTER") {
      return (
        <EegPaneTemplate>
          <FormProvider {...formMethods} >
            <InverterFormElement readOnly={true}/>
          </FormProvider>
        </EegPaneTemplate>
      )
    } else {
      return (
        <EegPaneTemplate>
          <FormProvider {...formMethods} >
            <MeterFormElement rates={rates} metering={metering} meterReadOnly={true} onChange={onChange}/>
            <MeterAddressFormElement onChange={onChange}/>
          </FormProvider>
        </EegPaneTemplate>
      )
    }
  }

  return (
    // <form onBlur={handleSubmit((data) => onSubmit(data))}>
      <>
        {Contents()}
      </>
    // </form>
  )
}

export default MeterFormComponent;