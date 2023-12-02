// Remnant 2 has a lot of different types of items
// Because a loadout can have multiple of the same item type,
// we need to split the definitions into two types:
type BaseItemType =
  | 'helm'
  | 'torso'
  | 'legs'
  | 'gloves'
  | 'relic'
  | 'amulet'
  | 'mainhand'
  | 'offhand'
  | 'melee'

// The type of a single item category
export type ItemType =
  | BaseItemType
  | 'archtype'
  | 'concoction'
  | 'consumable'
  | 'mod'
  | 'mutator'
  | 'relicfragment'
  | 'ring'
  | 'trait'

// The type of a single item slot in a loadout
export type LoadoutItemType =
  | BaseItemType
  | 'archtypes'
  | 'concoctions'
  | 'consumables'
  | 'mods'
  | 'mutators'
  | 'relicfragments'
  | 'rings'
  | 'traits'

// The type of a single item stored in the database
export interface Item {
  id: string
  type: ItemType
  name: string
  path: string
  description?: string
  howToGet?: string
  wikiLinks?: string[]
}

// The type of a single item stored in a loadout
export interface LoadoutItem extends Omit<Item, 'type'> {
  type: LoadoutItemType
}

// The type of a loadout
export interface Loadout {
  name: string
  items: {
    helm: LoadoutItem | null
    torso: LoadoutItem | null
    legs: LoadoutItem | null
    gloves: LoadoutItem | null
    relic: LoadoutItem | null
    amulet: LoadoutItem | null
    rings: LoadoutItem[] | null
    mainhand: LoadoutItem | null
    offhand: LoadoutItem | null
    melee: LoadoutItem | null
    archtypes: LoadoutItem[] | null
    concoctions: LoadoutItem[] | null
    consumables: LoadoutItem[] | null
    mods: LoadoutItem[] | null
    mutators: LoadoutItem[] | null
    relicfragments: LoadoutItem[] | null
    traits: LoadoutItem[] | null
  }
}
