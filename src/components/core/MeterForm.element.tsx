import React, {ClipboardEvent, FC, useEffect, useState} from "react";
import {IonButton, IonCol, IonGrid, IonIcon, IonList, IonRow, IonToolbar} from "@ionic/react";
import SelectForm from "../form/SelectForm.component";
import InputForm from "../form/InputForm.component";
import CheckboxComponent from "../form/Checkbox.component";
import {Metering} from "../../models/meteringpoint.model";
import {EegTariff} from "../../models/eeg.model";
import {useFormContext} from "react-hook-form";
import ToggleButtonComponent from "../ToggleButton.component";
import {eegPlug, eegSolar} from "../../eegIcons";
import {trashBin} from "ionicons/icons";
import {EegParticipant} from "../../models/members.model";
import {useEegArea} from "../../store/hook/Eeg.provider";
import { NIL } from "uuid";

interface MeterFormElementProps {
  rates: EegTariff[]
  metering?: Metering
  meterReadOnly?: boolean
  onChange?: (values: {name: string, value: any}[], event?: any) => void
  setWithInverter?: (state: boolean) => void
  withInverter?: boolean
}

const MeterFormElement: FC<MeterFormElementProps> = ({rates, metering, meterReadOnly, onChange, setWithInverter, withInverter}) => {

  const area = useEegArea()

  const {control, watch, setValue, formState: {errors}} = useFormContext<Metering>()

  const [selectedDirection, setSelectedDirection] = useState(0);
  const [withWechselrichter, setWithWechselrichter] = useState(false);

  const direction = watch('direction')

  const isChangeable = () => {
    if (meterReadOnly === undefined || !meterReadOnly) {
      if (withWechselrichter) {
        return false
      }
      return true
    }
    return false
  } 
  
  useEffect(() => {
    // setSelectedDirection(0)
    if (metering) setWithWechselrichter(metering.inverterid == null ? false : true)
  }, [metering])

  useEffect(() => {
    switch (direction) {
      case "CONSUMPTION":
        setSelectedDirection(0)
        break
      case "GENERATION":
        setSelectedDirection(1)
        break
      case "INVERTER":
        setSelectedDirection(2)
        break
    }
  }, [direction])

  const getRatesOption = () => {
    const expectedRateType = selectedDirection === 0 ? 'VZP' : 'EZP'
    const r =  rates.filter(r => r.type === expectedRateType).map((r) => {
      return {key: r.id, value: r.name}
    })
    return [{key: null, value: "Kein Tarif"}, ...r]
  }

  const onChangeDirection = (s: number) => {
    // setSelectedDirection(s)
    switch (s) {
      case 0:
        setValue(`direction`, "CONSUMPTION");
        break
      case 1:
        setValue(`direction`, "GENERATION");
        break
      case 2:
        setValue(`direction`, "INVERTER");
        break
    }
  }

  const handleMeterPaste = (e: ClipboardEvent<HTMLIonInputElement>) => {

    e.persist()
    e.clipboardData.items[0].getAsString(text => {
      setValue && setValue("meteringPoint", text.replace(/[-_]/gi, "").replace(/\s/gi, ""))
    })
    e.stopPropagation()
  }

  const _onChange = (name: string, value: any, event?: any) => {
    if (onChange) onChange([{name, value}], event)
  }

  const getTarifHeaderString = () => {
    return selectedDirection === 0 ?
      ("Verbrauchertarife")
      :
      ("Erzeugertarife")
  }

  // const _onRemoveInverter = () => {
  //   if (metering?.inverterid && onRemoveInverter) onRemoveInverter(metering.inverterid)
  //   if (onChange) onChange([{name: `inverterid`, value: null}])
  // }

  return (
    <>
      <IonGrid>
        <IonRow>
          <IonCol size="auto">
            <ToggleButtonComponent
              buttons={meterReadOnly ?
                      [{label: 'Verbraucher', icon: eegPlug}, 
                      {label: 'Erzeuger', icon: eegSolar}, 
                      {label: 'Wechselrichter', icon: eegSolar}]
                      :
                      [{label: 'Verbraucher', icon: eegPlug}, 
                      {label: 'Erzeuger', icon: eegSolar}]}
              onChange={onChangeDirection}
              value={selectedDirection}
              changeable={isChangeable()}
            />
          </IonCol>
        </IonRow>
      </IonGrid>
      <IonList>
        <SelectForm name={"tariff_id"} label="Tarif" control={control} options={getRatesOption()} onChangePartial={_onChange} interfaceOptions={{header: getTarifHeaderString()}}/>
        <InputForm name={"meteringPoint"} label="Zählpunkt" control={control} type="text" readonly={meterReadOnly}
                   counter={true} maxlength={33}
                   rules={{
                     required: "Zählpunktnummer fehlt",
                     minLength: {value: 33, message: "MIN-Zählpunktnummer beginnt mit AT gefolgt von 31 Nummern"},
                     maxLength: {value: 33, message: "MAX-Zählpunktnummer beginnt mit AT gefolgt von 31 Nummern"},
                     pattern: {
                       value: /^AT[0-9A-Z]*$/,
                       message: "Zählpunktnummer beginnt mit AT gefolgt von 31 Nummern od. Großbuchstaben"
                     }
                   }}
                   error={errors?.meteringPoint}
                   onPaste={handleMeterPaste}
                   onChangePartial={_onChange}
        />
        {area && area === 'BEG' && <>
            <InputForm name={"gridOperatorId"} label="Netzbetreiber-ID" control={control} rules={{required: true}}
                       type="text" onChangePartial={_onChange}/>
            <InputForm name={"gridOperatorName"} label="Netzbetreiber-Name" control={control} rules={{required: true}}
                       type="text" onChangePartial={_onChange}/>
        </>}
        {direction === "GENERATION" && !withWechselrichter && setWithInverter && (withInverter == true || withInverter == false) && (
          <CheckboxComponent label="Wechselrichter anlegen" setChecked={setWithInverter}
          checked={withInverter} style={{paddingTop: "0px"}}></CheckboxComponent>
        )}
        {withWechselrichter && (
          // <IonToolbar color="eeglight" style={{marginBottom: "10px"}}>
            <InputForm name={"inverterid"} label="Wechselrichternummer" control={control} rules={{required: false}}
                      type="text" onChangePartial={_onChange} readonly={true}/>
          //   <IonButton slot="end" fill="clear" onClick={_onRemoveInverter} style={{marginRight:"20px"}}>
          //     <IonIcon icon={trashBin} color="medium" slot="icon-only"></IonIcon>
          //   </IonButton>
          // </IonToolbar>
        )}
        <InputForm name={"transformer"} label="Transformator" control={control} rules={{required: false}} type="text" onChangePartial={_onChange}/>
        <InputForm name={"equipmentNumber"} label="Anlagen-Nr." control={control} rules={{required: false}}
                   type="text" onChangePartial={_onChange}/>
        <InputForm name={"equipmentName"} label="Anlagename" control={control} rules={{required: false}} type="text" onChangePartial={_onChange}/>
      </IonList>
    </>
  )
}

export default MeterFormElement;