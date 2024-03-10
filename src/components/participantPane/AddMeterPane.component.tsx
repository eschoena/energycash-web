import React, {FC, useContext, useEffect, useState} from "react";
import CorePageTemplate from "../core/CorePage.template";
import {Metering, ParticipantState} from "../../models/meteringpoint.model";
import EegWebContentPaneComponent from "../EegWebContentPane.component";
import {IonButton, IonFooter, IonToolbar} from "@ionic/react";
import {ParticipantContext} from "../../store/hook/ParticipantProvider";
import EegPaneTemplate from "../core/EegPane.template";
import MeterFormElement from "../core/MeterForm.element";
import {FormProvider, useForm} from "react-hook-form";
import {registerMeteringpoint, selectMetering, selectParticipant, selectedParticipantSelector} from "../../store/participant";
import {useAppDispatch, useAppSelector} from "../../store";
import {ratesSelector} from "../../store/rate";
import {selectedTenant} from "../../store/eeg";
import MeterAddressFormElement from "../core/forms/MeterAddressForm/MeterAddressForm.element";
import {useOnlineState} from "../../store/hook/Eeg.provider";
import moment from "moment";

const AddMeterPaneComponent: FC = () => {

  const dispatcher = useAppDispatch()
  const rates = useAppSelector(ratesSelector);
  const tenant = useAppSelector(selectedTenant);
  const participant = useAppSelector(selectedParticipantSelector);

  const isOnline = useOnlineState()

  const [withInverter, setWithInverter] = useState(false)

  const meter = {
    status: isOnline ? "NEW" : "ACTIVE",
    participantId: "",
    meteringPoint: "",
    direction: "CONSUMPTION",
    registeredSince: moment.utc().toDate(),
    participantState: {activeSince: new Date(Date.now()), inactiveSince: moment.utc([2999, 11, 31]).toDate()} as ParticipantState,
  } as Metering

  const formMethods = useForm<Metering>({mode: 'onBlur', defaultValues: meter});
  const {handleSubmit, control, watch, setValue, formState: {errors, isDirty, isValid}, reset} = formMethods

  const {
    setShowAddMeterPane,
    setShowAddInverter
  } = useContext(ParticipantContext);

  useEffect(() => {
    reset(meter)
    // setShowAddMeterPane(false);
  }, [participant])

  const onChancel = () => {
    reset(meter)
    setShowAddMeterPane(false);
  }

  const submitWithInverter = async (tenant: string, participantId: string, meter: Metering) => {
    await dispatcher(registerMeteringpoint({tenant, participantId, meter}))
      .then(p => dispatcher(selectParticipant(participantId)))
      .then(p => dispatcher(selectMetering(meter.meteringPoint)))
      .then(p => setShowAddInverter(true))
  }

  const onSubmit = (meter: Metering) => {
    if (isDirty && participant) {
      let participantId = participant.id;
      meter.participantId = participantId

      setShowAddMeterPane(false);
      if (withInverter) {
        submitWithInverter(tenant, participantId, meter)
      } else {
        dispatcher(registerMeteringpoint({tenant, participantId, meter}))
      }
      reset(meter);
    }
  }
  return (
    <EegWebContentPaneComponent>
      <CorePageTemplate>
        <form id="submit-register-meter" onSubmit={handleSubmit((data) => onSubmit(data))}>
          <EegPaneTemplate>
            <FormProvider {...formMethods}>
              <MeterFormElement rates={rates} setWithInverter={setWithInverter} withInverter={withInverter}/>
              <MeterAddressFormElement participant={participant} isEditable={true} isOnline={isOnline}/>
            </FormProvider>
          </EegPaneTemplate>
        </form>
      </CorePageTemplate>
      <IonFooter>
        <IonToolbar className={"ion-padding-horizontal"}>
          <IonButton fill="clear" slot="start" onClick={onChancel}>Zurück</IonButton>
          <IonButton form="submit-register-meter" type="submit" slot="end" disabled={!isDirty || !isValid}>Registrieren</IonButton>
        </IonToolbar>
      </IonFooter>
    </EegWebContentPaneComponent>
  )
}

export default AddMeterPaneComponent;