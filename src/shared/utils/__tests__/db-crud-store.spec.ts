import { describe, expect, it } from 'vitest'
import { createDbCrudStoreOptions } from '../db-crud-store'
import { type ToDoItem } from '../../../entities/to-do-item/types'

describe('createDbCrudStoreOptions', () => {
  const options = createDbCrudStoreOptions<ToDoItem>('todo_items')
  it('should create store options', () => {
    expect(options).not.toBe(undefined)
    expect(options).not.toBe(null)
    expect(options?.state).toBeTypeOf('function')

    const initialState = options.state()
    expect(initialState.loading).toBe(true)
    expect(initialState.data).toHaveLength(0)
  })

  it('should add, get and remove an item', async () => {
    const newInstance = { text: '123', completed: false, description: 'asd' }
    const res = await options.actions.addItem(newInstance)
    expect(res).toMatchObject(newInstance)
    const itemInDb = await options.actions.getById(res.id)
    expect(itemInDb?.id).toBe(res.id)
    await options.actions.removeItem(res.id)
    const emptyRes = await options.actions.getById(res.id)
    expect(emptyRes).toBe(null)
  })
})
