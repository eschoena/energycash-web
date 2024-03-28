import React, {FC} from "react";
import {IonCol, IonGrid, IonList, IonRow} from "@ionic/react";
import InputForm from "../form/InputForm.component";
import {Metering} from "../../models/meteringpoint.model";
import {useFormContext} from "react-hook-form";
import ToggleButtonComponent from "../ToggleButton.component";
import {eegPlug, eegSolar} from "../../eegIcons";

interface InverterFormElementProps {
    readOnly?: boolean
}

const InverterFormElement: FC<InverterFormElementProps> = ({readOnly}) => {
    const {control, watch, setValue, formState: {errors}} = useFormContext<Metering>()
    
    const isReadOnly = () => {
        if (readOnly === undefined) {
            return false
        }
        return readOnly
    }

    const onChangeDirection = () => {}
    
    return (<>
        <IonGrid>
            <IonRow>
                <IonCol size="auto">
                    <ToggleButtonComponent
                    buttons={[{label: 'Verbraucher', icon: eegPlug}, 
                            {label: 'Erzeuger', icon: eegSolar}, 
                            {label: 'Wechselrichter', icon: eegSolar}]}
                    value={2}
                    onChange={onChangeDirection}
                    changeable={false}
                    />
                </IonCol>
            </IonRow>
        </IonGrid>
        <IonList>
            <InputForm name={"meteringPoint"} label="Wechselrichternummer" control={control} readonly={isReadOnly()}
                    rules={{required: "Wechselrichternummer fehlt"}}/>
        </IonList>
    </>)
}

export default InverterFormElement;