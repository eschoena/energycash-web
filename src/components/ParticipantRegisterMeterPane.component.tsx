import React, {FC, useEffect, useState} from "react";
import {IonCard, IonCardContent, IonCol, IonGrid, IonIcon, IonItem, IonLabel, IonRow, IonText} from "@ionic/react";
import {add} from "ionicons/icons";
import {EegParticipant} from "../models/members.model";
import MeterCardComponent from "./participantPane/MeterCard.component";
import {useFieldArray, useFormContext} from "react-hook-form";
import RegisterMeterPaneComponent from "./RegisterMeterPane.component";
import {Metering} from "../models/meteringpoint.model";
import {useEegArea, useGridOperator, useOnlineState} from "../store/hook/Eeg.provider";
import RegisterInverterPane from "./RegisterInverterPane.component";

interface ParticipantRegisterMeterPaneComponentProps {
  participant: EegParticipant;
  onAddMeter: (meter: Metering) => void
}

const ParticipantRegisterMeterPaneComponent: FC<ParticipantRegisterMeterPaneComponentProps> = ({participant}) => {

  const isOnline = useOnlineState()
  const {gridOperatorId, gridOperatorName} = useGridOperator()

  const defaultMeter =  {
    status: isOnline ? "NEW" : "ACTIVE",
    participantId: "",
    meteringPoint: "",
    direction: "CONSUMPTION",
    registeredSince: isOnline ? new Date() : new Date(2023, 0, 1, 0, 0, 0, 0),
    gridOperatorName: gridOperatorName,
    gridOperatorId: gridOperatorId,
  } as Metering

  const defaultInverter =  {
    status: isOnline ? "NEW" : "ACTIVE",
    participantId: "",
    meteringPoint: "",
    direction: "INVERTER",
    registeredSince: isOnline ? new Date() : new Date(2023, 0, 1, 0, 0, 0, 0),
    gridOperatorName: gridOperatorName,
    gridOperatorId: gridOperatorId,
  } as Metering

  const [addMeterPaneActive, setAddMeterPaneActive] = useState(false)
  const [addInverterPane, setAddInverterPane] = useState(false)
  const [meteringPoint, setMeteringPoint] = useState<Metering | undefined>()
  const [parentMeter, setParentMeter] = useState<Metering | undefined>()

  const { control, watch} = useFormContext<EegParticipant>();
  const {fields, append, update, remove} = useFieldArray<EegParticipant>({control, name: 'meters'})

  useEffect(() => {
    remove(0)
  }, [remove])

 const meters = watch("meters")

  const showMeter = (
    e: React.MouseEvent<HTMLIonCardElement, MouseEvent>,
    participantId: string,
    meter: Metering
  ) => {
    e.stopPropagation();
    removeMeter();
    if (meter.direction === "INVERTER") {
      const currentFieldIdx = fields.findIndex((m) => m.inverterid === meter.meteringPoint)
      setParentMeter(fields[currentFieldIdx]);
      setMeteringPoint(meter);
      setAddInverterPane(true);
    } else {
      setMeteringPoint(meter);
      setAddMeterPaneActive(true);
    }
  }

  const appendMeter = (meter: Metering, addInv: boolean) => {
    setAddMeterPaneActive(false)
    const currentFieldIdx = fields.findIndex((m) => m.meteringPoint === meter.meteringPoint)
    if (currentFieldIdx >= 0) {
      update(currentFieldIdx, meter)
    } else {
      append(meter)
    }
    const currentFieldIdxInv = fields.findIndex((m) => m.meteringPoint === meter.inverterid)
    if (addInv && !(currentFieldIdxInv >= 0)) {
      setParentMeter(meter);
      setMeteringPoint(defaultInverter);
      setAddInverterPane(true);
    } else {
      setMeteringPoint(undefined);
    }
  }

  const appendInverter = (inverter: Metering, parentMeter: Metering) => {
    setAddInverterPane(false)
    if (fields.findIndex((m) => m.meteringPoint === inverter.meteringPoint) >= 0) return
    const currentFieldIdx = fields.findIndex((m) => m.meteringPoint === parentMeter.meteringPoint)
    update(currentFieldIdx, parentMeter)
    const currentFieldIdxInv = fields.findIndex((m) => m.meteringPoint === inverter.meteringPoint)
    if (currentFieldIdxInv >= 0) {
      update(currentFieldIdxInv, inverter)
    } else {
      append(inverter)
    }
    setParentMeter(undefined)
    setMeteringPoint(undefined)
  }

  const removeMeter = () => {
    setAddMeterPaneActive(false);
    setAddInverterPane(false);
    setMeteringPoint(undefined);
    setParentMeter(undefined);
  }

  const allMeteringPoints = () => {
    if (meters === undefined || meters.length === 0) {
      return (
        <IonCard style={{boxShadow: "none", background: "rgba(43, 104, 96, 0.08)", color: "#005457"}}>
          <IonCardContent>
            <IonText>
              Jedes Mitglied benötigt mindestens einen Zählpunkt.
            </IonText>
          </IonCardContent>
        </IonCard>
      )
    }
    return fields.map((m) => {
      if (m.direction !== "INVERTER") {
        if (!m.inverterid) {
           return <MeterCardComponent key={m.id} participant={participant} meter={m} hideMeter={true} onSelect={showMeter}/>
        } else {
          var inverter = {} as Metering
          var key 
          {fields.map((i) => {
            if (i.meteringPoint === m.inverterid) {
              inverter = i
              key = i.id
            }
          })}
          return (
            <MeterCardComponent key={m.id} participant={participant} meter={m} hideMeter={true} onSelect={showMeter}>
              {key &&
              <MeterCardComponent key={key} participant={participant} meter={inverter} hideMeter={true} onSelect={showMeter}></MeterCardComponent>}
            </MeterCardComponent>
          )
        }
      }
      
    })
  }

  return (
    <div style={{
      background: "var(--ion-color-eeglight, #fff)",
      boxShadow: "0px 1px 1px rgba(0, 0, 0, 0.14), 0px 2px 1px rgba(0, 0, 0, 0.12), 0px 1px 3px rgba(0, 0, 0, 0.2)",
      borderRadius: "4px"
    }}>
      <div style={{display: "flex", flexDirection: "column"}}>
        <div style={{flexGrow: 1}}>
          <IonGrid>
            <IonRow>
              <IonCol>
                {allMeteringPoints()}
              </IonCol>
            </IonRow>
            <IonRow class="ion-justify-content-end">
              <IonCol size="5">
                <IonItem button lines="none" onClick={(e) => showMeter(e, participant.id, defaultMeter)}>
                  <IonIcon icon={add}></IonIcon>
                  <IonLabel>Zählpunkt hinzufügen</IonLabel>
                </IonItem>
              </IonCol>
            </IonRow>
          </IonGrid>
        </div>
        <div style={{flexGrow: 1}}>
          {addMeterPaneActive && meteringPoint && <RegisterMeterPaneComponent meteringPoint={meteringPoint} onAdd={appendMeter} onChancel={removeMeter} />}
          {addInverterPane && meteringPoint && parentMeter && <RegisterInverterPane inverter={meteringPoint} parentMeter={parentMeter} onAdd={appendInverter} onCancel={removeMeter}/>}
        </div>
      </div>
    </div>
  )
}

export default ParticipantRegisterMeterPaneComponent;