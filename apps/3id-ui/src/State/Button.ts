import type { AtomType, Store } from '../Types'

export const AcceptStore: Store = {
  loading: false,
  body: 'Accept',
  set: (value: AtomType) => {
    AcceptStore.loading = value.loading
    AcceptStore.body = value.body
  },
  get: () => {
    return {
      loading: AcceptStore.loading,
      body: AcceptStore.body,
    }
  },
}

export const DeclineStore: Store = {
  loading: false,
  body: 'Decline',
  set: (value: AtomType) => {
    DeclineStore.loading = value.loading
    DeclineStore.body = value.body
  },
  get: () => {
    return {
      loading: DeclineStore.loading,
      body: DeclineStore.body,
    }
  },
}
