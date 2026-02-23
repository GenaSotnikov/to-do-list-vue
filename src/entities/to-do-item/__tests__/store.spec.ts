import { describe, beforeEach, it, expect } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useToDoItemsStore } from '../store'

const wait = (time = 1000) =>
  new Promise((res) => {
    setTimeout(() => {
      res(null)
    }, time)
  })

describe('Counter Store', () => {
  beforeEach(() => {
    // creates a fresh pinia and makes it active
    // so it's automatically picked up by any useStore() call
    // without having to pass it to it: `useStore(pinia)`
    setActivePinia(createPinia())
  })

  it('should fetch data and give completed and pedning tasks', async () => {
    const store = useToDoItemsStore()
    await store.refreshData()
    expect(store.loading).toBe(false)

    // eslint-disable-next-line vitest/valid-expect
    expect(store.pendingList.map((el) => el.completed)).not.to.include(true)
    // eslint-disable-next-line vitest/valid-expect
    expect(store.completedList.map((el) => el.completed)).not.to.include(false)
  })

  it('should create an item, toggle complete value twice and remove it', async () => {
    const store = useToDoItemsStore()
    const res = await store.addItem({ text: '123', completed: false, description: 'asd' })
    await wait(1000)
    expect(store.data.map((el) => el.id)).to.include(res.id)
    expect(res.completed).toBe(false)

    await store.toggleComplete(res.id)
    await wait(1000)
    const toggledEl = store.data.find((el) => el.id === res.id)
    expect(toggledEl?.completed).toBe(true)
    await store.toggleComplete(res.id)
    await wait(1000)
    const toggledEl2 = store.data.find((el) => el.id === res.id)
    expect(toggledEl2?.completed).toBe(false)

    await store.removeItem(res.id)
    await wait(1000)

    // eslint-disable-next-line vitest/valid-expect
    expect(store.data.map((el) => el.id)).not.to.include(res.id)
  })
})
