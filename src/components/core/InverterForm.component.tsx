import React, {FC, useContext, useEffect, useState} from "react";
import {IonButton, IonToolbar} from "@ionic/react";
import "../../styles/Pane.style.scss"

import {FormProvider, useForm} from "react-hook-form";
import {registerMeteringpoint, selectedMeterSelector, selectedParticipantSelector, updateMeteringPoint} from "../../store/participant";
import {useAppDispatch, useAppSelector} from "../../store";
import {selectedTenant} from "../../store/eeg";
import {useOnlineState} from "../../store/hook/Eeg.provider";
import moment from "moment";
import {Metering, ParticipantState} from "../../models/meteringpoint.model";
import InverterFormElement from "./InverterForm.element";
import { ParticipantContext } from "../../store/hook/ParticipantProvider";

interface InverterFormComponentProps {
}

const InverterFormComponent: FC<InverterFormComponentProps> = ({}) => {
    const dispatcher = useAppDispatch()
    const isOnline = useOnlineState()
    const tenant = useAppSelector(selectedTenant);
    const participant = useAppSelector(selectedParticipantSelector);
    const parentMeter = useAppSelector(selectedMeterSelector);
    const {setShowAddInverter} = useContext(ParticipantContext);
    const [Open, setOpen] = useState(false)

    const inverter = {
        status: isOnline ? "NEW" : "ACTIVE",
        participantId: "",
        meteringPoint: "",
        direction: "INVERTER",
        registeredSince: moment.utc().toDate(),
        participantState: {activeSince: new Date(Date.now()), inactiveSince: moment.utc([2999, 11, 31]).toDate()} as ParticipantState,
    } as Metering
    
    const formMethods = useForm<Metering>({mode: 'onBlur', defaultValues: inverter});
    const {handleSubmit, control, watch, setValue, formState: {errors, isDirty, isValid}, reset} = formMethods

    useEffect(() => {
        if (Open) setShowAddInverter(false)
        setOpen(true)
    }, [parentMeter])

    const _onSubmit = (inverter: Metering) => {
        if (isDirty && participant) {
            let participantId = participant.id;
            inverter.participantId = participantId
            
            dispatcher(registerMeteringpoint({tenant, participantId, meter: inverter}))
            if (parentMeter) {
                const _parentMeter = { ...parentMeter };
                _parentMeter.inverterid = inverter.meteringPoint
                dispatcher(updateMeteringPoint({tenant, participantId, meter: _parentMeter}))
            }
            setShowAddInverter(false)
            reset(inverter);
        }
    }

    const onCancel = () => {
        setShowAddInverter(false)
        reset(inverter);
    }

    

    return (
        <div className="pane-body" style={{height: "100%"}}>
            <div className="pane-content">
                <form id="submit-register-meter" onSubmit={handleSubmit((data) => _onSubmit(data))}>
                    <FormProvider {...formMethods}>
                        <InverterFormElement/>
                    </FormProvider>
                </form>
            </div>
            <div className="pane-footer">
                <IonToolbar className={"ion-padding-horizontal"}>
                <IonButton fill="clear" slot="start" onClick={onCancel}>Zurück</IonButton>
                <IonButton form="submit-register-meter" type="submit" slot="end" disabled={!isDirty || !isValid}>Registrieren</IonButton>
                </IonToolbar>
            </div>
        </div>
    )
}

export default InverterFormComponent