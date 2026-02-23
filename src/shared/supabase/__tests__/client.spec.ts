import { describe, it, expect } from 'vitest'
import { supabase } from '../client'

describe('Supabase connection test', () => {
  it('should establish a connection', async () => {
    const res = await supabase.from('todo_items').select('*').limit(5)
    expect(res?.count).not.toBe(undefined)
  })
})
