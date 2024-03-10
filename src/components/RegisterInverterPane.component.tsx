import React, {FC} from "react";
import {IonButton, IonToolbar} from "@ionic/react";

import {FormProvider, useForm} from "react-hook-form";
import {Metering} from "../models/meteringpoint.model";
import InverterFormElement from "./core/InverterForm.element";

interface RegisterInverterPaneProps {
    onAdd: (meter: Metering, parentMeter: Metering) => void
    onCancel: () => void
    parentMeter: Metering
    inverter: Metering
}

const RegisterInverterPane: FC<RegisterInverterPaneProps> = ({inverter, parentMeter, onAdd, onCancel}) => {
    const formMethods = useForm<Metering>({mode: 'onBlur', defaultValues: inverter});
    const {handleSubmit, control, watch, setValue, formState: {errors, isDirty, isValid}, reset} = formMethods

    const _onSubmit = (inverter: Metering) => {
        const _parentMeter = { ...parentMeter };
        _parentMeter.inverterid = inverter.meteringPoint
        onAdd(inverter, _parentMeter)
        console.log(_parentMeter)
    }

    return (
        <div className="pane-body" style={{height: "100%"}}>
            <div className="pane-content">
                
                    <FormProvider {...formMethods}>
                        <InverterFormElement/>
                    </FormProvider>
                
            </div>
            <div className="pane-footer">
                <IonToolbar className={"ion-padding-horizontal"}>
                <IonButton fill="clear" slot="start" onClick={onCancel}>Zurück</IonButton>
                <IonButton slot="end" onClick={handleSubmit(_onSubmit)}>Hinzufügen</IonButton>
                </IonToolbar>
            </div>
        </div>
    )
}

export default RegisterInverterPane