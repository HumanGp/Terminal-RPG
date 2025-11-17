class ShopSystem {
  private items: GameItem[];
  private name: string;

  constructor(name: string = "Adventurer's Shop") {
    this.name = name;
    this.items = ItemDefinitions.getShopItems();
  }

  getItems(): GameItem[] {
    return this.items;
  }

  buyItem(itemId: string, buyer: Character): boolean {
    const item = this.items.find((i) => i.id === itemId);

    if (!item || buyer.gold < item.value) {
      return false;
    }

    // Check if buyer has inventory space
    if (!buyer.inventory.addItem(this.createItemCopy(item))) {
      return false;
    }

    buyer.gold -= item.value;
    return true;
  }

  sellItem(itemId: string, seller: Character): boolean {
    const item = seller.inventory.getItem(itemId);

    if (!item) {
      return false;
    }

    const sellPrice = Math.floor(item.value * 0.7); // 70% of purchase price
    seller.gold += sellPrice;
    seller.inventory.removeItem(itemId);

    return true;
  }

  private createItemCopy(item: GameItem): GameItem {
    if (item.type === "CONSUMABLE") {
      const consumable = item as ConsumableItem;
      return new ConsumableItem(
        consumable.id,
        consumable.name,
        consumable.description,
        consumable.weight,
        consumable.value,
        consumable.effect,
        consumable.quantity
      );
    } else {
      const equipment = item as EquipmentItem;
      return new EquipmentItem(
        equipment.id,
        equipment.name,
        equipment.description,
        equipment.weight,
        equipment.value,
        equipment.slot,
        { ...equipment.stats },
        equipment.onEquip,
        equipment.onUnequip
      );
    }
  }
}
