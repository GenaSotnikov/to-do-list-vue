// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => {
  const selectMatch = vi.fn()
  const select = vi.fn(() => ({ match: selectMatch }))

  const insertSelect = vi.fn()
  const insert = vi.fn(() => ({ select: insertSelect }))

  const updateSelect = vi.fn()
  const updateMatch = vi.fn(() => ({ select: updateSelect }))
  const update = vi.fn(() => ({ match: updateMatch }))

  const deleteMatch = vi.fn()
  const remove = vi.fn(() => ({ match: deleteMatch }))

  const from = vi.fn(() => ({
    select,
    insert,
    update,
    delete: remove,
  }))

  return {
    selectMatch,
    select,
    insertSelect,
    insert,
    updateSelect,
    updateMatch,
    update,
    deleteMatch,
    remove,
    from,
  }
})

vi.mock('../../supabase', () => ({
  supabase: {
    from: mocks.from,
  },
}))

import { createDbCrudStoreOptions } from '../db-crud-store'

type Crud = ReturnType<typeof createDbCrudStoreOptions<'todo_items'>>
type CrudCtx = ReturnType<Crud['state']> & Crud['actions']

describe('createDbCrudStoreOptions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.selectMatch.mockResolvedValue({ data: [] })
    mocks.insertSelect.mockResolvedValue({ data: [] })
    mocks.updateSelect.mockResolvedValue({ data: [] })
    mocks.deleteMatch.mockResolvedValue({ data: [] })
  })

  it('creates initial state', () => {
    const crud = createDbCrudStoreOptions('todo_items')
    const initialState = crud.state()

    expect(initialState.loading).toBe(true)
    expect(initialState.itemLoading).toBe(false)
    expect(initialState.data).toEqual([])
  })

  it('refreshes data', async () => {
    const crud = createDbCrudStoreOptions('todo_items')
    const ctx = { ...crud.state(), ...crud.actions } as CrudCtx
    const row = {
      id: 'task-id',
      text: 'Task',
      description: 'Description',
      completed: false,
      created_at: '2026-03-01T00:00:00.000Z',
      updated_at: '2026-03-01T00:00:00.000Z',
    }
    mocks.selectMatch.mockResolvedValueOnce({ data: [row] })

    await crud.actions.refreshData.call(ctx)

    expect(mocks.select).toHaveBeenCalledWith('*')
    expect(mocks.selectMatch).toHaveBeenCalledWith({})
    expect(ctx.loading).toBe(false)
    expect(ctx.data).toEqual([row])
  })

  it('adds an item and refreshes list', async () => {
    const crud = createDbCrudStoreOptions('todo_items')
    const ctx = { ...crud.state(), ...crud.actions } as CrudCtx
    const payload = { text: 'New', description: 'Desc', completed: false }
    const created = {
      ...payload,
      id: 'new-id',
      created_at: '2026-03-01T00:00:00.000Z',
      updated_at: '2026-03-01T00:00:00.000Z',
    }
    mocks.insertSelect.mockResolvedValueOnce({ data: [created] })
    mocks.selectMatch.mockResolvedValueOnce({ data: [created] })

    const result = await crud.actions.addItem.call(ctx, payload)

    expect(mocks.insert).toHaveBeenCalledWith(payload)
    expect(mocks.insertSelect).toHaveBeenCalledWith('*')
    expect(result).toEqual(created)
    expect(ctx.data).toEqual([created])
    expect(ctx.loading).toBe(false)
  })

  it('patches an item and refreshes list', async () => {
    const crud = createDbCrudStoreOptions('todo_items')
    const ctx = { ...crud.state(), ...crud.actions } as CrudCtx
    const patchPayload = { text: 'Patched title' }
    const patched = {
      id: 'task-id',
      text: 'Patched title',
      description: 'Description',
      completed: false,
      created_at: '2026-03-01T00:00:00.000Z',
      updated_at: '2026-03-01T00:00:01.000Z',
    }
    mocks.updateSelect.mockResolvedValueOnce({ data: [patched] })
    mocks.selectMatch.mockResolvedValueOnce({ data: [patched] })

    const result = await crud.actions.patch.call(ctx, 'task-id', patchPayload)

    expect(mocks.update).toHaveBeenCalledWith(patchPayload)
    expect(mocks.updateMatch).toHaveBeenCalledWith({ id: 'task-id' })
    expect(mocks.updateSelect).toHaveBeenCalledWith('*')
    expect(result).toEqual(patched)
    expect(ctx.data).toEqual([patched])
    expect(ctx.loading).toBe(false)
  })

  it('throws when patch does not return updated row', async () => {
    const crud = createDbCrudStoreOptions('todo_items')
    const ctx = { ...crud.state(), ...crud.actions } as CrudCtx
    mocks.updateSelect.mockResolvedValueOnce({ data: [] })

    await expect(crud.actions.patch.call(ctx, 'task-id', { text: 'Patched title' })).rejects.toThrow(
      'Failed to patch item',
    )
  })

  it('removes an item and refreshes list', async () => {
    const crud = createDbCrudStoreOptions('todo_items')
    const ctx = { ...crud.state(), ...crud.actions } as CrudCtx
    mocks.deleteMatch.mockResolvedValueOnce({ data: [] })
    mocks.selectMatch.mockResolvedValueOnce({ data: [] })

    await crud.actions.removeItem.call(ctx, 'task-id')

    expect(mocks.remove).toHaveBeenCalled()
    expect(mocks.deleteMatch).toHaveBeenCalledWith({ id: 'task-id' })
    expect(ctx.loading).toBe(false)
    expect(ctx.data).toEqual([])
  })

  it('sets itemLoading while getById is pending and resets after resolve', async () => {
    const crud = createDbCrudStoreOptions('todo_items')
    const ctx = { ...crud.state(), ...crud.actions } as CrudCtx
    const row = {
      id: 'task-id',
      text: 'Task',
      description: 'Description',
      completed: false,
      created_at: '2026-03-01T00:00:00.000Z',
      updated_at: '2026-03-01T00:00:00.000Z',
    }

    let resolveMatch: (value: { data: typeof row[] }) => void = () => {}
    const matchPromise = new Promise<{ data: typeof row[] }>((resolve) => {
      resolveMatch = resolve
    })
    mocks.selectMatch.mockReturnValueOnce(matchPromise)

    const getByIdPromise = crud.actions.getById.call(ctx, 'task-id')
    expect(ctx.itemLoading).toBe(true)

    resolveMatch({ data: [row] })
    const res = await getByIdPromise

    expect(res).toEqual(row)
    expect(ctx.itemLoading).toBe(false)
  })

  it('resets itemLoading when getById fails', async () => {
    const crud = createDbCrudStoreOptions('todo_items')
    const ctx = { ...crud.state(), ...crud.actions } as CrudCtx
    mocks.selectMatch.mockRejectedValueOnce(new Error('boom'))

    await expect(crud.actions.getById.call(ctx, 'task-id')).rejects.toThrow('boom')
    expect(ctx.itemLoading).toBe(false)
  })
})
