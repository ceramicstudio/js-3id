import type { StoreBody, Store } from '../Types'

export const AcceptStore: Store = {
  loading: false,
  body: 'Accept',
  set: (value: StoreBody) => {
    AcceptStore.loading = value.loading
    AcceptStore.body = value.body
    AcceptStore.click = value?.click
    AcceptStore.class = value?.class
  },
  get: () => {
    return {
      loading: AcceptStore.loading,
      body: AcceptStore.body,
      click: AcceptStore.click,
      class: AcceptStore.class,
    }
  },
}

export const DeclineStore: Store = {
  loading: false,
  body: 'Decline',
  set: (value: StoreBody) => {
    DeclineStore.loading = value.loading
    DeclineStore.body = value.body
    DeclineStore.click = value?.click
    DeclineStore.class = value?.class
  },
  get: () => {
    return {
      loading: DeclineStore.loading,
      body: DeclineStore.body,
      click: DeclineStore.click,
      class: DeclineStore.class,
    }
  },
}
