import React, {FC, useEffect, useState} from "react";
import {
  IonCard,
  IonCardSubtitle, IonCardTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonPage, IonSelect, IonSelectOption,
  IonToggle, SelectCustomEvent
} from "@ionic/react";
import RateDetailPaneComponent from "../components/RateDetailPane.component";
import InputFormComponent from "../components/form/InputForm.component";
import {useAppDispatch, useAppSelector} from "../store";
import {eegSelector, selectedTenant, selectTenant} from "../store/eeg";
import {Controller, useForm} from "react-hook-form";
import SelectForm from "../components/form/SelectForm.component";

import "./Eeg.page.scss"
import {useTenants} from "../store/hook/AuthProvider";

const EegPage: FC = () => {

  const eeg = useAppSelector(eegSelector);
  const tenant = useAppSelector(selectedTenant);
  const dispatcher = useAppDispatch();

  const {handleSubmit, control, watch} = useForm({defaultValues: eeg, values: eeg})
  const [tenantsState, setTenantsState] = useState<string[]>([])
  const tenants = useTenants()

  useEffect(() => {
    // setTenantState(tenant);
    setTenantsState(tenants.map(t => t.toUpperCase()))
  }, [tenants])

  const onSwitchTenant = (e: SelectCustomEvent<string>) => {
    const tenant = e.detail.value;
    localStorage.setItem("tenant", tenant.toUpperCase())
    dispatcher(selectTenant(tenant))
  }

  return (
    <IonPage>
      <IonContent fullscreen>
        <div style={{flexGrow: "1", background: "#EAE7D9", height: "100vh"}}>
          <div style={{display: "flex", flexDirection: "row"}}>
            <div style={{display: "flex", flexDirection: "column", flexGrow: "1"}}>
              <div className={"eeg-property-card"}>
                <div className={"header"}>Einstellungen</div>
                <IonCard color="eeglight">
                  <div className="form-element">
                    {/*<IonItem fill="outline">*/}
                      {/*<IonLabel position="floating">RC Nummer</IonLabel>*/}
                      <IonSelect fill="outline" label="RC Nummer" labelPlacement={"floating"} className="select-box" value={tenant}
                                 onIonChange={onSwitchTenant}>
                        {tenantsState && tenantsState.map((o, idx) => (
                            <IonSelectOption key={idx} value={o}>{o}</IonSelectOption>
                          )
                        )}
                      </IonSelect>
                    {/*</IonItem>*/}
                  </div>
                  <SelectForm label={"Abrechnungszeitraum"} placeholder={"Abrechnungszeitraum"} control={control}
                              name={"settlementInterval"} options={[
                    {key: "MONTHLY", value: "Monatlich"},
                    {key: "ANNUAL", value: "Jährlich"},
                    {key: "BIANNUAL", value: "Halbjährlich"},
                  ]}></SelectForm>
                  <IonItem lines="none">
                    {/*<IonLabel slot="start">SEPA aktiv</IonLabel>*/}
                    <Controller
                      name={"accountInfo.sepa"}
                      control={control}
                      render={({field}) => {
                        const {onChange, value} = field;
                        return (<IonToggle
                          style={{width: "100%"}}
                          slot="start"
                          labelPlacement="start"
                          checked={value}
                          onIonChange={(e) => {
                            onChange(e.detail.checked);
                        }}>SEPA aktiv</IonToggle>)
                      }
                      }
                    />
                  </IonItem>
                </IonCard>
              </div>
              <div className={"eeg-property-card"}>
                <div className={"header"}>Allgemeines</div>
                <IonCard color="eeglight">

                  <InputFormComponent name={"rcNumber"} label="RC Nummer" control={control} rules={{}} type="text"
                                      readonly={true}/>

                  <InputFormComponent name={"legal"} label="Rechtsform" control={control} rules={{}} type="text"
                                      readonly={true}/>
                  {/*<SelectForm name={"legal"} label="Rechtsform" control={control} options={[*/}
                  {/*  {key: "verein", value: "Verein"},*/}
                  {/*  {key: "genossenschaft", value: "Genossenschaft"},*/}
                  {/*  {key: "gesellschaft", value: "Gesellschaft"}]} placeholder="Rechtsform" readonly={true}/>*/}
                  <InputFormComponent name={"salesTax"} label="Umsatzsteuer ID" control={control} rules={{}} type="text"
                                      readonly={true}/>
                  <InputFormComponent name={"taxNumber"} label="Steuernummer" control={control} rules={{}} type="text"
                                      readonly={true}/>
                  <InputFormComponent name={"allocationMode"} label="Abrechnung" control={control} rules={{}}
                                      type="text" readonly={true}/>
                  {/*<SelectForm name={"settlement"} label="Abrechnung" control={control} options={[*/}
                  {/*  {key: "static", value: "Statisch"},*/}
                  {/*  {key: "dynamic", value: "Dynamisch"}]} placeholder="Abrechnung" readonly={true}/>*/}
                </IonCard>
              </div>
            </div>
            <div style={{display: "flex", flexDirection: "column", flexGrow: "1"}}>

              <div className={"eeg-property-card"}>
                <div className={"header"}>Adresse</div>
                <IonCard color="eeglight">

                  <InputFormComponent name={"address.street"} label="Straße" control={control} rules={{}} type="text"
                                      readonly={true}/>
                  <InputFormComponent name={"address.streetNumber"} label="Hausnummer" control={control} rules={{}}
                                      type="text" readonly={true}/>
                  <InputFormComponent name={"address.zip"} label="Postleitzahl" control={control} rules={{}} type="text"
                                      readonly={true}/>
                  <InputFormComponent name={"address.city"} label="Ort" control={control} rules={{}} type="text"
                                      readonly={true}/>
                </IonCard>
              </div>

              <div className={"eeg-property-card"}>
                <div className={"header"}>Kontakt</div>
                <IonCard color="eeglight">
                  <InputFormComponent name={"contact.phone"} label="Telefon" control={control} rules={{}} type="text"
                                      readonly={true}/>
                  <InputFormComponent name={"contact.email"} label="E-Mail" control={control}
                                      rules={{regex: /[a-z\.]@[a-z]\.\w{3}/}} type="text" readonly={true}/>
                </IonCard>
              </div>

              <div className={"eeg-property-card"}>
                <div className={"header"}>Bankdaten</div>
                <IonCard color="eeglight">
                  <InputFormComponent name={"accountInfo.iban"} label="IBAN" control={control} rules={{}} type="text"
                                      readonly={true}/>
                  <InputFormComponent name={"accountInfo.owner"} label="Kontoinhaber" control={control}
                                      rules={{regex: /[a-zA-Z\s]*/}} type="text" readonly={true}/>
                </IonCard>
              </div>

              <div className={"eeg-property-card"}>
                <div className={"header"}>Optional</div>
                <IonCard color="eeglight">
                  <InputFormComponent name={"optionals.website"} label="Webseite" control={control}
                                      rules={{regex: /[a-z\.]*\.\w{3}/}} type="text" readonly={true}/>
                </IonCard>
              </div>

            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  )
}
export default EegPage;