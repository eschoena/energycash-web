import {createContext, FC, ReactNode, useCallback, useContext, useEffect, useState} from "react";
import {EegParticipant} from "../../models/members.model";
import {useAppDispatch, useAppSelector} from "../index";
import {
  activeParticipantsSelector1,
  selectParticipant
} from "../participant";
import {EegTariff, RateTypeEnum} from "../../models/eeg.model";
import {fetchEnergyReportV2, selectedPeriodSelector} from "../energy";
import {selectedTenant} from "../eeg";
import {MeterReport, ParticipantReport, SelectedPeriod} from "../../models/energy.model";


export interface ParicipantState {
  participants: EegParticipant[]
  activePeriod?: SelectedPeriod
  // selectedParticipant: EegParticipant | undefined
  // selectedParticipants: string[]
  // rates: EegTariff[]
  createNewRate: () => void
  selectRate: (rate: EegTariff | undefined) => void
  createNewParticipant?: () => void
  selectedRate?: EegTariff
  detailsPageOpen: boolean
  showDetailsPage: (participant: EegParticipant) => void
  closeDetailPage: (open: boolean) => void
  billingEnabled: boolean
  setBillingEnabled: (enabled: boolean) => void
  showAddMeterPane: boolean
  setShowAddMeterPane: (show: boolean) => void
  showAddInverter: boolean
  setShowAddInverter: (show: boolean) => void
  checkedParticipant: Record<string, boolean>
  setCheckedParticipant: (participantId: string, checked: boolean) => void
}

const initialState: ParicipantState = {
  participants: [],
  activePeriod: undefined,
  // selectedParticipant: undefined,
  // selectedParticipants: [],
  // rates: [],
  createNewRate: () => {},
  selectRate: (e:EegTariff | undefined) => {},
  detailsPageOpen: false,
  showDetailsPage: (p: EegParticipant) => {},
  closeDetailPage: (open: boolean) => {},
  billingEnabled: false,
  setBillingEnabled: (enabled: boolean) => {},
  showAddMeterPane: false,
  setShowAddMeterPane: (show: boolean) => {},
  showAddInverter: false,
  setShowAddInverter: (show: boolean) => {},
  checkedParticipant: {},
  setCheckedParticipant: (participantId: string, checked: boolean) => {}
}

export const ParticipantContext = createContext(initialState)

const ParticipantProvider: FC<{children: ReactNode}> = ({children}) => {

  const dispatch = useAppDispatch();
  const tenant = useAppSelector(selectedTenant)
  const activePeriod = useAppSelector(selectedPeriodSelector)
  const participants = useAppSelector(activeParticipantsSelector1)

  const [state, setState] = useState<ParicipantState>(initialState);
  const [detailOpen, setDetailOpen] = useState<boolean>(false);
  const [enableBilling, setEnableBilling] = useState<boolean>(false)
  const [showAddMeterPane, setShowAddMeterPane] = useState<boolean>(false)
  const [showAddInverter, setShowAddInverter] = useState<boolean>(false)
  const [checkedParticipants, setCheckedParticipants] = useState<Record<string, boolean>>({})

  const newRateFn = () => {
    setState({
      ...state,
      selectedRate: {name: RateTypeEnum.AHEAD} as EegTariff
    });
  }

  const selectRateFn = (rate: EegTariff | undefined) => {
    setState( {
      ...state,
      selectedRate: rate
    })
  }

  const showDetailPageFn = (participant: EegParticipant) => {
    dispatch(selectParticipant(participant.id))
    // setState({
    //   ...state,
    //   // selectedParticipant: participant
    // });
    setDetailOpen(true);
  }

  const closeDetailPageFn = (state: boolean) => {
    setDetailOpen(state);
  }

  const setEnableBillingFn = (state: boolean) => {
    setEnableBilling(state);
    // if (!state) {
    //   setCheckedParticipants({})
    // }
  }

  const value = {
    participants: participants,
    activePeriod: activePeriod,
    selectedRate: undefined,
    detailsPageOpen: detailOpen,
    createNewRate: useCallback<()=>void>(newRateFn, []),
    selectRate: selectRateFn,
    showDetailsPage: showDetailPageFn,
    closeDetailPage: closeDetailPageFn,
    billingEnabled: enableBilling,
    setBillingEnabled: setEnableBillingFn,
    checkedParticipant: checkedParticipants,
    showAddMeterPane: showAddMeterPane,
    setShowAddMeterPane: setShowAddMeterPane,
    showAddInverter: showAddInverter,
    setShowAddInverter: setShowAddInverter,
    setCheckedParticipant: (participantId: string, checked: boolean) => { setCheckedParticipants((s) => {
      const newS = {...s}
      if (!checked) {
        delete newS[participantId];
      } else {
        newS[participantId] = checked
      }
      return newS;
      }
    )}
  } as ParicipantState

  // useEffect(() => {
  //   Promise.all([
  //     dispatch(fetchParticipantModel({tenant: "RC130100"}))
  //     // dispatch(fetchRatesModel({tenant: "RC130100"}))
  //     ]
  //   )
  // }, [])

  // useEffect(() => {
  //   if (activePeriod) {
  //     dispatch(fetchParticipantModel({tenant: tenant, period: activePeriod}))
  //   }
  // }, [activePeriod]);

  useEffect(() => {
    if (activePeriod && participants && participants.length > 0) {
      const participantsReport = participants.map(p => {
        return {
          participantId: p.id,
          meters: p.meters.filter(m => !!m.participantState).map(m => {
            return {meterId: m.meteringPoint, meterDir: m.direction,
              from: new Date(m.participantState.activeSince).getTime(),
              until: new Date(m.participantState.inactiveSince).getTime()} as MeterReport})
        } as ParticipantReport
      })
      dispatch(fetchEnergyReportV2({tenant: tenant, year: activePeriod.year, segment: activePeriod.segment, type: activePeriod.type, participants: participantsReport.filter(p => p.meters.length > 0)}))
    }
  },[activePeriod, participants])

  return (
    <ParticipantContext.Provider value={value}>
      {children}
    </ParticipantContext.Provider>
  )
}

export default ParticipantProvider;


export const useParticipants = () => {
  const {participants} = useContext(ParticipantContext)
  return participants;
}

// export const useRates = () => {
//   const {rates} = useContext(ParticipantContext);
//   return rates;
// }