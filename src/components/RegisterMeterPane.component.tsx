import React, {FC, useMemo, useState} from "react";
import {Metering} from "../models/meteringpoint.model";
import {IonButton, IonFooter, IonToolbar} from "@ionic/react";
import {FormProvider, useForm, useFormContext} from "react-hook-form";
import {useAppSelector} from "../store";
import {ratesSelector} from "../store/rate";
import {EegParticipant} from "../models/members.model";
import MeterFormElement from "./core/MeterForm.element";
import MeterAddressFormElement from "./core/forms/MeterAddressForm/MeterAddressForm.element";
import {useOnlineState} from "../store/hook/Eeg.provider";

interface RegisterMeterPaneComponentProps {
  meteringPoint: Metering
  onAdd: (meter: Metering, addInv: boolean) => void
  onChancel: () => void
}

const RegisterMeterPaneComponent: FC<RegisterMeterPaneComponentProps> = ({
                                                                           meteringPoint,
                                                                           onAdd,
                                                                           onChancel
                                                                         }) => {

  const rates = useAppSelector(ratesSelector);
  const formMethods = useForm({defaultValues: meteringPoint})
  const {handleSubmit, setValue, control, watch, formState: {errors}, clearErrors} = formMethods;
  const isOnline = useOnlineState()

  const {getValues} = useFormContext<EegParticipant>();
  const participant = useMemo(() => getValues(), [getValues])
  const [withInverter, setWithInverter] = useState(false)

  const onAppend = (m: Metering) => {
    onAdd(m, withInverter)
  }

  return (
    <div style={{display: "grid", gridTemplateColumns: "50% 50%", justifyContent: "space-between"}}>
      <FormProvider {...formMethods}>
        <div style={{flexGrow: "1", height: "100%"}}>
          <MeterFormElement rates={rates} metering={meteringPoint} withInverter={withInverter} setWithInverter={setWithInverter}/>
        </div>
        <div style={{flexGrow: "1", height: "100%"}}>
          <MeterAddressFormElement participant={participant} isOnline={isOnline} isEditable={true}/>
        </div>
      </FormProvider>
      <div style={{gridColumnStart: "1", gridColumnEnd: "3", display: "grid"}}>
        <IonFooter>
          <IonToolbar className={"ion-padding-horizontal"}>
            <IonButton fill="clear" slot="start" onClick={() => onChancel()}>Abbrechen</IonButton>
            <IonButton slot="end" onClick={handleSubmit(onAppend)}>Hinzufügen</IonButton>
          </IonToolbar>
        </IonFooter>
      </div>
    </div>
  )
}

export default RegisterMeterPaneComponent;