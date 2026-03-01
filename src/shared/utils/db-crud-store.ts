import { supabase, type Database } from '../../shared/supabase'

export type CrudState<T> = { data: T[]; loading: boolean; itemLoading: boolean }

type SupabaseTable = keyof Database['public']['Tables']
type SupabaseRow<TableName extends SupabaseTable> =
  Database['public']['Tables'][TableName] extends { Row: infer TRow } ? TRow : never
type SupabaseInsert<TableName extends SupabaseTable> =
  Database['public']['Tables'][TableName] extends { Insert: unknown }
    ? Database['public']['Tables'][TableName]['Insert']
    : never
type SupabaseUpdate<TableName extends SupabaseTable> =
  Database['public']['Tables'][TableName] extends { Update: unknown }
    ? Database['public']['Tables'][TableName]['Update']
    : never
type SupabaseId<TableName extends SupabaseTable> =
  SupabaseRow<TableName> extends { id: infer TId } ? TId : string

type CrudActions<
  T,
  TInsert = Partial<T>,
  TUpdate = Partial<T>,
  TId = string,
> = {
  refreshData: () => Promise<void>
  addItem: (item: TInsert) => Promise<T>
  patch: (id: string, val: TUpdate) => Promise<T>
  removeItem: (id: TId) => Promise<void>
  getById: (id: TId) => Promise<T | null>
}

type CrudStoreThis<
  T,
  TInsert = Partial<T>,
  TUpdate = Partial<T>,
  TId = string,
> = CrudState<T> & CrudActions<T, TInsert, TUpdate, TId>

type CrudStoreOptions<
  T,
  TInsert = Partial<T>,
  TUpdate = Partial<T>,
  TId = string,
> = {
  state: () => CrudState<T>
  actions: CrudActions<T, TInsert, TUpdate, TId>
}

export function createDbCrudStoreOptions<TableName extends SupabaseTable>(
  tableName: TableName,
): CrudStoreOptions<
  SupabaseRow<TableName>,
  SupabaseInsert<TableName>,
  SupabaseUpdate<TableName>,
  SupabaseId<TableName>
> {
  const table = supabase.from(tableName)

  return {
    state: (): CrudState<SupabaseRow<TableName>> => ({ loading: true, itemLoading: false, data: [] }),
    actions: {
      async refreshData(
        this: CrudStoreThis<
          SupabaseRow<TableName>,
          SupabaseInsert<TableName>,
          SupabaseUpdate<TableName>,
          SupabaseId<TableName>
        >
      ) {
        const res = await table.select('*').match({})
        this.data = (res.data as SupabaseRow<TableName>[] | null) ?? []
        this.loading = false
      },

      async addItem(
        this: CrudStoreThis<
          SupabaseRow<TableName>,
          SupabaseInsert<TableName>,
          SupabaseUpdate<TableName>,
          SupabaseId<TableName>
        >,
        item: SupabaseInsert<TableName>,
      ) {
        const res = await table.insert(item).select('*')
        const createdItem = (res.data as SupabaseRow<TableName>[] | null)?.[0]
        if (!createdItem) {
          throw new Error('Failed to create item')
        }
        await this.refreshData()
        return createdItem
      },

      async patch(
        this: CrudStoreThis<
          SupabaseRow<TableName>,
          SupabaseInsert<TableName>,
          SupabaseUpdate<TableName>,
          SupabaseId<TableName>
        >,
        id: string,
        val: SupabaseUpdate<TableName>,
      ) {
        const res = await table.update(val).match({ id }).select('*')
        const patchedItem = (res.data as SupabaseRow<TableName>[] | null)?.[0]
        if (!patchedItem) {
          throw new Error('Failed to patch item')
        }
        await this.refreshData()
        return patchedItem
      },

      async removeItem(
        this: CrudStoreThis<
          SupabaseRow<TableName>,
          SupabaseInsert<TableName>,
          SupabaseUpdate<TableName>,
          SupabaseId<TableName>
        >,
        id: SupabaseId<TableName>,
      ) {
        await table.delete().match({ id })
        await this.refreshData()
      },

      async getById(
        this: CrudStoreThis<
          SupabaseRow<TableName>,
          SupabaseInsert<TableName>,
          SupabaseUpdate<TableName>,
          SupabaseId<TableName>
        >,
        id: SupabaseId<TableName>,
      ) {
        this.itemLoading = true
        try {
          const res = await table.select('*').match({ id })
          return ((res.data as SupabaseRow<TableName>[] | null)?.[0] ??
            null) as SupabaseRow<TableName> | null
        } finally {
          this.itemLoading = false
        }
      },
    },
  }
}
