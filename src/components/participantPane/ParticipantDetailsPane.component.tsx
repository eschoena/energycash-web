import React, {FC, useEffect, useState, useContext} from "react";
import {EegParticipant} from "../../models/members.model";
import cn from "classnames";

import "./ParticipantDetailsPane.compoenent.css"
import {
  IonButton, IonButtons, IonCard,
  IonIcon,
  IonItem,
  IonLabel,
  IonTitle,
  IonToggle,
  IonToolbar, useIonAlert, useIonToast
} from "@ionic/react";
import {
  add,
  caretForwardOutline,
  documentTextOutline,
  logoEuro,
  person,
  trashBin,
} from "ionicons/icons";
import {eegPlug, eegSandClass, eegShieldCrown, eegSolar, eegStar} from "../../eegIcons";
import {useAppDispatch, useAppSelector} from "../../store";
import {Metering} from "../../models/meteringpoint.model";
import MemberFormComponent from "../MemberForm.component";
import MeterFormComponent from "../MeterForm.component";
import {
  archiveParticipant,
  confirmParticipant, removeMeteringPoint,
  selectedMeterSelector,
  selectedParticipantSelector, selectParticipantById,
  updateParticipant, updateParticipantPartial
} from "../../store/participant";
import {formatMeteringPointString, GetWeek} from "../../util/Helper.util";
import {selectedTenant} from "../../store/eeg";
import AllowParticipantDialog from "../dialogs/AllowParticipant.dialog";
import {OverlayEventDetail} from "@ionic/react/dist/types/components/react-component-lib/interfaces";
import InvoiceDocumentComponent from "./InvoiceDocument.component";
import ContractDocumentComponent from "./ContractDocument.component";
import {ratesSelector} from "../../store/rate";
import {fileService} from "../../service/file.service";
import {meteringInterReportSelectorV2, meteringReportSelectorV2, selectedPeriodSelector} from "../../store/energy";
import MeterChartComponent from "./MeterChart.component";
import {participantService} from "../../service/participant.service";
import { ParticipantContext } from "../../store/hook/ParticipantProvider";
import InverterFormComponent from "../core/InverterForm.component";

type DynamicComponentKey = "memberForm" | "meterForm" | "documentForm" | "invoiceForm" | "participantDocumentForm"

// interface ParticipantDetailsPaneProps {
//   activePeriod: SelectedPeriod | undefined;
// }
//
// type NonNullable<T> = Exclude<T, null | undefined>;

const ParticipantDetailsPaneComponent: FC = () => {

  const dispatcher = useAppDispatch();
  const selectedParticipant = useAppSelector(selectedParticipantSelector);
  const selectedMeter = useAppSelector(selectedMeterSelector);
  const tenant = useAppSelector(selectedTenant)
  const rates = useAppSelector(ratesSelector);
  const activePeriod = useAppSelector(selectedPeriodSelector);
  const report = useAppSelector(meteringInterReportSelectorV2(selectedParticipant?.id, selectedMeter?.meteringPoint))
  const {showAddInverter, setShowAddInverter} = useContext(ParticipantContext);

  // const [selectedMeter, setSelectedMeter] = useState<Metering | undefined>(undefined)

  const [activeMenu, setActiveMenu] = useState<DynamicComponentKey>("memberForm")
  // const [selectedPeriod, setSelectedPeriod] = useState<SelectedPeriod | undefined>(activePeriod)
  // const [activeEnergySeries, setActiveEnergySeries] = useState<MeterEnergySeries|undefined>(report)

  const [toaster] = useIonToast();
  const [participantAlert] = useIonAlert();

  const isMeterNew = () => selectedMeter?.status === 'NEW';
  const isMeterActive = () => selectedMeter?.status === "ACTIVE" || selectedMeter?.status === "INACTIVE"
  const isMeterPending = () => selectedMeter?.status === "PENDING"

  // useEffect(() => {
  //   if (selectedMeterId && selectedParticipant) {
  //     const meter = selectedParticipant.meters.find(m => m.meteringPoint === selectedMeterId)
  //     if (meter) {
  //       setSelectedMeter(meter)
  //     }
  //   } else {
  //     setSelectedMeter(undefined)
  //   }
  // }, [])

  const icon = () => {
    if (selectedMeter) switch (selectedMeter.direction) {
      case "CONSUMPTION":
        return eegPlug
      case "GENERATION":
        return eegSolar
      case "INVERTER":
        return eegSolar
    }
  }

  const onUpdateParticipant = (participant: EegParticipant) => {
    dispatcher(updateParticipant({tenant, participant})).unwrap().then(() => console.log("Participant Updated"))
  }

  const onUpdateParticipantPartial = (participantId: string, value: Record<string, any>) => {
    dispatcher(updateParticipantPartial({tenant: tenant, participantId: participantId, value: {path: Object.keys(value)[0], value: Object.values(value)[0]}})).unwrap()
      .then(() => console.log("Participant Updated"))
      .catch((e) => console.log("Error by updating participant: ", e))
  }

  const dynamicComponent = (componentKey: DynamicComponentKey) => {
    if (showAddInverter) return <InverterFormComponent/>
    switch (componentKey) {
      case "memberForm":
        return selectedParticipant ? <MemberFormComponent participant={selectedParticipant} rates={rates} formId={""}
                                                          onSubmit={onUpdateParticipant} onSubmitPartial={onUpdateParticipantPartial} changeable={false}/> : <></>
      case "meterForm":
        return selectedMeter ? <MeterFormComponent meteringPoint={selectedMeter}/> : <></>
      case "invoiceForm":
        return selectedParticipant ?
          <InvoiceDocumentComponent tenant={tenant} participant={selectedParticipant}/> : <></>
      case "documentForm":
        return selectedParticipant ?
          <ContractDocumentComponent tenant={tenant} participant={selectedParticipant}/> : <></>
      default:
        return <></>
    }
  }

  const presentToast = (message: string) => {
    toaster({
      message: message,
      duration: 3500,
      position: 'bottom'
    });
  };

  function onWillDismiss(participant: EegParticipant, ev: CustomEvent<OverlayEventDetail<FormData>>) {

    const uploadFiles = async (tenant: string, participantId: string, data?: FormData) => {
      if (data) {
        const files = data.getAll("docfiles").map(e => e as File)
        if (files.length > 0) {
          return fileService.uploadContractDocuments(tenant, participantId, files)
        }
      }
      return new Promise<any>((resolve) => resolve(true))
    }

    // if (ev.detail.role === 'confirm' && ev.detail.data) {
    //   const data:FormData = ev.detail.data
    //   fileService.uploadContractDocuments(tenant, participant.id,
    //     data.getAll("docfiles").map(e => e as File)
    //   )
    //     .then(() => dispatcher(confirmParticipant({tenant, participantId: participant.id})).unwrap())
    //     .then((value) => presentToast(`${value.firstname} ist nun Mitglied deiner EEG. Ein Infomail wurde an ${value.contact.email} gesendet.`))
    //     .catch(() => presentToast('Mitglied konnte nicht aktiviert werden.'))
    // }

    if (ev.detail.role === 'confirm') {
      uploadFiles(tenant, participant.id, ev.detail.data)
        .then(() => dispatcher(confirmParticipant({tenant, participantId: participant.id})).unwrap())
        .then((value) => presentToast(`${value.firstname} ist nun Mitglied deiner EEG. Ein Infomail wurde an ${value.contact.email} gesendet.`))
        .catch(() => presentToast('Mitglied konnte nicht aktiviert werden.'))
    }

    // clearAll();
    // setIsActivationActive(undefined);
  }

  const meterStatusText = (meter: Metering) => {
    switch (meter.status) {
      case 'NEW':
        return "Antwort des Netzbetreibers noch ausstehend"
      case 'PENDING':
        return "Zustimmung des Mitglieds noch ausstehend"
      case 'APPROVED':
        return "Abschluss Meldung von Netzbetreiber noch ausstehend"
      case 'REJECTED':
        return "Zählpunkt wurde vom Netzbetreiber abgewiesen"
      case 'REVOKED':
        return "Zählpunkt wurde vom Netzbetreiber aufgehoben"
      case 'INVALID':
        return "Zählpunkt wurde vom Netzbetreiber nicht angenommen"
      default:
        return ""
    }
  }

  if (!selectedParticipant) {
    return <></>
  }

  const onRemoveMeteringPoint = () => {
    if (selectedMeter && selectedParticipant) {
      dispatcher(removeMeteringPoint(
        {tenant: tenant, participantId: selectedParticipant.id, meter: selectedMeter}))
    }
  }

  const onAddInverter = () => {
    setShowAddInverter(true)
  }

  const archive = () => {
    participantAlert({
      subHeader: "Mitglied archivieren",
      message: "Das Mitglied ist nach dem ARCHIVIERUNG'S Prozess in deiner Übersicht nicht mehr verhanden.",
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'OK',
          role: 'confirm',
        },
      ],
      onDidDismiss: (e: CustomEvent) => {
        if (e.detail.role === 'confirm') {
          dispatcher(archiveParticipant({participant: selectedParticipant, tenant: tenant}))
            .unwrap()
            .catch(() => {
              toaster({
                message: 'Mitglied konnte nicht gelöscht werden. Bitte kontaktieren Sie ihren Administrator.',
                duration: 4500,
                color: "danger"
              })
            })
        }
      },
    })
  }

  return (
    <div className={"details-body"} style={{display: "flex", flexDirection: "column", height: "100%"}}>
      <div className={"details-header"}>
        <div><h4>{selectedParticipant.firstname} {selectedParticipant.lastname}</h4></div>
        <IonItem button lines="none" style={{fontSize: "12px", marginRight: "60px"}} className={"participant-header"}
                 onClick={() => archive()}>
          <IonIcon icon={trashBin} slot="start" style={{marginRight: "10px", fontSize: "16px"}}></IonIcon>
          <IonLabel>Benutzer archivieren</IonLabel>
        </IonItem>
      </div>
      <div style={{display: "flex", flexDirection: "row", height: "95%"}}>
        <div style={{display: "flex", flexDirection: "column", width: "50%"}}>
          <div className={"details-box"}>
            {(selectedParticipant.status === 'NEW' || selectedParticipant.status === 'PENDING') ? (
              <div style={{color: "black"}}>
                <AllowParticipantDialog trigger="open-participant-allow-dialog" participant={selectedParticipant}
                                        onDismiss={onWillDismiss}/>
                <IonCard color="warning-light">
                  <IonItem lines="none" color="warning-light">
                    <IonIcon icon={eegStar} slot="start"/>
                    <IonLabel>Möchtest du {selectedParticipant.lastname} in deine EEG aufnehmen?</IonLabel>
                  </IonItem>
                  <IonItem lines="none" color="warning-light">
                    <IonButton id="open-participant-allow-dialog" slot="end" color="warning" size="default">Ja,
                      Zulassen</IonButton>
                  </IonItem>
                </IonCard>
              </div>) : (<></>)}
            <div>
              <IonItem button lines="full" className={cn("eeg-item-box", {"selected": activeMenu === "memberForm"})}
                       onClick={() => setActiveMenu("memberForm")}>
                <IonIcon icon={person} slot="start"></IonIcon>
                <IonLabel>
                  <div className={"detail-header"}>Details</div>
                  <div className={"detail-subheader"}>Kontakt, Adresse, Bankdaten, ...</div>
                </IonLabel>
              </IonItem>
            </div>
            <div>
              <IonItem button lines="full" className={cn("eeg-item-box", {"selected": activeMenu === "documentForm"})}
                       onClick={() => setActiveMenu("documentForm")}>
                <IonIcon icon={documentTextOutline} slot="start"></IonIcon>
                <div>
                  <div className={"detail-header"}>Dokumente</div>
                  <div className={"detail-subheader"}>z.B. Verträge</div>
                </div>
              </IonItem>
            </div>
            <div>
              <IonItem button lines="full" className={cn("eeg-item-box", {"selected": activeMenu === "invoiceForm"})}
                       onClick={() => setActiveMenu("invoiceForm")}>
                <IonIcon icon={logoEuro} slot="start"></IonIcon>
                <IonLabel>
                  <div className={"detail-header"}>Meine Rechnungen</div>
                </IonLabel>
              </IonItem>
            </div>
            <div>
              <IonItem lines="full" className={"eeg-item-box"}>
                <IonIcon icon={eegShieldCrown} slot="start"></IonIcon>
                <div>
                  <div
                    className={"detail-header"}>{`Mitglied ist ${selectedParticipant?.role === 'EEG_USER' ? 'kein' : ''} Administrator`}</div>
                </div>
                <IonToggle slot="end" checked={selectedParticipant?.role !== 'EEG_USER'} disabled={true}></IonToggle>
              </IonItem>
            </div>
          </div>
          <div className={"details-box"}>
            {selectedMeter ? (
                <div className="ion-padding" slot="content">
                  <IonToolbar color="primary">
                    <IonTitle>{formatMeteringPointString(selectedMeter.meteringPoint)}</IonTitle>
                    {selectedMeter.direction === "GENERATION" && !selectedMeter.inverterid && (
                      <IonButton slot="end" fill="clear" onClick={onAddInverter}>
                        <IonIcon icon={add} slot="icon-only" style={{color: "#ffffff"}}/>
                      </IonButton>
                    )}
                  </IonToolbar>

                  {!isMeterActive() &&
                      <IonCard color="warning-light">
                          <IonItem lines="none" color="warning-light">
                              <IonIcon icon={eegSandClass} slot="start"/>
                              <IonLabel>{meterStatusText(selectedMeter)}</IonLabel>
                          </IonItem>
                        {selectedMeter.status === "INVALID" &&
                            <IonItem>
                                <IonButton color="warning" slot="end" size="small" fill="outline"
                                           onClick={() => onRemoveMeteringPoint()}>Löschen</IonButton>
                            </IonItem>
                        }
                      </IonCard>
                  }

                  <IonItem button lines="full"
                           className={cn("eeg-item-box", {"selected": activeMenu === "meterForm"})}
                           onClick={() => setActiveMenu("meterForm")}>
                    <IonIcon icon={icon()} slot="start"></IonIcon>
                    <div>
                      <div className={"detail-header"}>Details und Adresse</div>
                    </div>
                  </IonItem>
                  <IonItem lines="full" className={"eeg-item-box"} disabled={isMeterNew()}>
                    <IonIcon icon={caretForwardOutline} slot="start"></IonIcon>
                    <div>
                      <div
                        className={"detail-header"}>{`Zählpunkt ${selectedMeter.status === "ACTIVE" ? "aktiv" : "inaktiv"}`}</div>
                    </div>
                    <IonToggle slot="end" checked={selectedMeter.status === "ACTIVE"} disabled={true}></IonToggle>
                  </IonItem>
                  {isMeterActive() && report && activePeriod && <MeterChartComponent report={report} tenant={tenant} activePeriod={activePeriod} selectedMeter={selectedMeter} selectedParticipant={selectedParticipant}/>}
                </div>) :
              <></>
            }
          </div>
        </div>
        <div className="pane-content-details">
          <div className="pane-content-details-content">
            {dynamicComponent(activeMenu)}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ParticipantDetailsPaneComponent;