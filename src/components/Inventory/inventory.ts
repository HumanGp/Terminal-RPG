class InventorySystem {
  private items: GameItem[] = [];
  private capacity: number = 20;
  private equipment: EquipmentSlots;

  constructor() {
    this.equipment = {
      weapon: null,
      armor: null,
      accessory: null,
    };
  }

  addItem(item: GameItem): boolean {
    if (this.items.length >= this.capacity) {
      return false;
    }

    // Stack consumables if possible
    if (item.type === "CONSUMABLE") {
      const existingItem = this.items.find(
        (i) => i.id === item.id && i.type === "CONSUMABLE"
      );

      if (existingItem) {
        (existingItem as ConsumableItem).quantity += (
          item as ConsumableItem
        ).quantity;
        return true;
      }
    }

    this.items.push(item);
    return true;
  }

  removeItem(itemId: string, quantity: number = 1): boolean {
    const itemIndex = this.items.findIndex((item) => item.id === itemId);

    if (itemIndex === -1) return false;

    const item = this.items[itemIndex];

    if (item.type === "CONSUMABLE") {
      const consumable = item as ConsumableItem;
      if (consumable.quantity > quantity) {
        consumable.quantity -= quantity;
        return true;
      } else if (consumable.quantity === quantity) {
        this.items.splice(itemIndex, 1);
        return true;
      }
    } else {
      this.items.splice(itemIndex, 1);
      return true;
    }

    return false;
  }

  useItem(itemId: string, target: Character): boolean {
    const item = this.items.find((i) => i.id === itemId);

    if (!item || item.type !== "CONSUMABLE") {
      return false;
    }

    const consumable = item as ConsumableItem;
    consumable.use(target);

    // Remove item if quantity reaches 0
    if (consumable.quantity <= 0) {
      this.removeItem(itemId);
    }

    return true;
  }

  equipItem(itemId: string, character: Character): boolean {
    const item = this.items.find((i) => i.id === itemId);

    if (!item || item.type !== "EQUIPMENT") {
      return false;
    }

    const equipment = item as EquipmentItem;

    // Unequip current item in slot if exists
    const currentEquipped = this.equipment[equipment.slot];
    if (currentEquipped) {
      this.unequipItem(currentEquipped.id, character);
    }

    // Equip new item
    this.equipment[equipment.slot] = equipment;
    equipment.equip(character);
    this.removeItem(itemId);

    return true;
  }

  unequipItem(itemId: string, character: Character): boolean {
    const slot = Object.keys(this.equipment).find(
      (slot) => this.equipment[slot as keyof EquipmentSlots]?.id === itemId
    ) as keyof EquipmentSlots;

    if (!slot) return false;

    const equipment = this.equipment[slot]!;
    equipment.unequip(character);
    this.equipment[slot] = null;
    this.addItem(equipment);

    return true;
  }

  getItemsByType(type: ItemType): GameItem[] {
    return this.items.filter((item) => item.type === type);
  }

  getEquippedItems(): EquipmentItem[] {
    return Object.values(this.equipment).filter(Boolean) as EquipmentItem[];
  }

  hasItem(itemId: string): boolean {
    return this.items.some((item) => item.id === itemId);
  }

  getItemCount(itemId: string): number {
    const item = this.items.find((i) => i.id === itemId);
    if (!item) return 0;

    if (item.type === "CONSUMABLE") {
      return (item as ConsumableItem).quantity;
    }

    return 1;
  }

  getInventoryWeight(): number {
    return this.items.reduce((total, item) => total + item.weight, 0);
  }

  getCapacity(): number {
    return this.capacity;
  }

  getUsedSlots(): number {
    return this.items.length;
  }
}

// Item Base Classes and Interfaces
abstract class GameItem {
  constructor(
    public id: string,
    public name: string,
    public description: string,
    public type: ItemType,
    public weight: number,
    public value: number
  ) {}

  abstract use(target: Character): void;
}

class ConsumableItem extends GameItem {
  public quantity: number;

  constructor(
    id: string,
    name: string,
    description: string,
    weight: number,
    value: number,
    public effect: (target: Character) => void,
    quantity: number = 1
  ) {
    super(id, name, description, "CONSUMABLE", weight, value);
    this.quantity = quantity;
  }

  use(target: Character): void {
    if (this.quantity > 0) {
      this.effect(target);
      this.quantity--;
    }
  }
}

class EquipmentItem extends GameItem {
  constructor(
    id: string,
    name: string,
    description: string,
    weight: number,
    value: number,
    public slot: EquipmentSlot,
    public stats: EquipmentStats,
    public onEquip?: (character: Character) => void,
    public onUnequip?: (character: Character) => void
  ) {
    super(id, name, description, "EQUIPMENT", weight, value);
  }

  use(target: Character): void {
    // Equipment must be equipped, not used directly
    throw new Error("Equipment must be equipped, not used directly");
  }

  equip(character: Character): void {
    character.attack += this.stats.attack || 0;
    character.defense += this.stats.defense || 0;
    character.speed += this.stats.speed || 0;
    character.maxHealth += this.stats.health || 0;

    // Apply current health bonus
    if (this.stats.health) {
      character.health += this.stats.health;
    }

    this.onEquip?.(character);
  }

  unequip(character: Character): void {
    character.attack -= this.stats.attack || 0;
    character.defense -= this.stats.defense || 0;
    character.speed -= this.stats.speed || 0;
    character.maxHealth -= this.stats.health || 0;

    // Ensure health doesn't exceed new max
    character.health = Math.min(character.health, character.maxHealth);

    this.onUnequip?.(character);
  }
}

// Type Definitions
type ItemType = "CONSUMABLE" | "EQUIPMENT" | "QUEST";

type EquipmentSlot = "weapon" | "armor" | "accessory";

interface EquipmentStats {
  attack?: number;
  defense?: number;
  health?: number;
  speed?: number;
  criticalChance?: number;
  special?: string;
}

interface EquipmentSlots {
  weapon: EquipmentItem | null;
  armor: EquipmentItem | null;
  accessory: EquipmentItem | null;
}
