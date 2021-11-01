import { atom } from 'jotai'
import { ButtonType, UIState as UIStateType } from '../Types'

export const AcceptState = atom<ButtonType>({
  loading: false,
  class: 'primary',
  body: 'Accept',
})

export const DeclineState = atom<ButtonType>({
  loading: false,
  class: 'secondary',
  body: 'Decline',
})

export const UIState = atom<UIStateType>({
  // @ts-ignore TODO: resolve this
  params: {
    type: 'unknown',
  },
  acceptButton: AcceptState,
  declineButton: DeclineState,
  closeNode: () => {},
})
