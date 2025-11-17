class ItemDefinitions {
  static createConsumables(): { [key: string]: ConsumableItem } {
    return {
      HEALTH_POTION: new ConsumableItem(
        "health_potion",
        "Health Potion",
        "Restores 50 HP",
        0.5,
        50,
        (target: Character) => {
          const healAmount = 50;
          target.heal(healAmount);
        },
        3
      ),

      MANA_POTION: new ConsumableItem(
        "mana_potion",
        "Mana Potion",
        "Restores 30 MP",
        0.5,
        75,
        (target: Character) => {
          if (target instanceof Mage) {
            (target as Mage).mana = Math.min(100, (target as Mage).mana + 30);
          }
        },
        2
      ),

      ENERGY_DRINK: new ConsumableItem(
        "energy_drink",
        "Energy Drink",
        "Restores 40 Energy",
        0.5,
        60,
        (target: Character) => {
          if (target instanceof Rogue) {
            (target as Rogue).energy = Math.min(
              100,
              (target as Rogue).energy + 40
            );
          }
        },
        2
      ),

      RAGE_POTION: new ConsumableItem(
        "rage_potion",
        "Rage Potion",
        "Instantly fills Rage",
        0.5,
        80,
        (target: Character) => {
          if (target instanceof Warrior) {
            (target as Warrior).rage = 100;
          }
        },
        1
      ),

      ANTIDOTE: new ConsumableItem(
        "antidote",
        "Antidote",
        "Cures poison effects",
        0.3,
        25,
        (target: Character) => {
          target.statusEffects = target.statusEffects.filter(
            (effect) => effect.type !== "POISON"
          );
        },
        2
      ),
    };
  }

  static createEquipment(): { [key: string]: EquipmentItem } {
    return {
      IRON_SWORD: new EquipmentItem(
        "iron_sword",
        "Iron Sword",
        "A sturdy iron sword",
        3.0,
        200,
        "weapon",
        { attack: 5 }
      ),

      STEEL_SWORD: new EquipmentItem(
        "steel_sword",
        "Steel Sword",
        "A sharp steel sword",
        4.0,
        500,
        "weapon",
        { attack: 8, criticalChance: 0.05 }
      ),

      LEATHER_ARMOR: new EquipmentItem(
        "leather_armor",
        "Leather Armor",
        "Basic protective leather",
        5.0,
        150,
        "armor",
        { defense: 3, health: 10 }
      ),

      CHAIN_MAIL: new EquipmentItem(
        "chain_mail",
        "Chain Mail",
        "Interlocking metal rings",
        8.0,
        400,
        "armor",
        { defense: 6, health: 20, speed: -1 }
      ),

      WIZARD_ROBE: new EquipmentItem(
        "wizard_robe",
        "Wizard Robe",
        "Enchanted robe for mages",
        2.0,
        300,
        "armor",
        { defense: 2, health: 15 },
        (character: Character) => {
          if (character instanceof Mage) {
            (character as Mage).maxMana += 20;
            (character as Mage).mana += 20;
          }
        },
        (character: Character) => {
          if (character instanceof Mage) {
            (character as Mage).maxMana -= 20;
            (character as Mage).mana = Math.min(
              (character as Mage).mana,
              (character as Mage).maxMana
            );
          }
        }
      ),

      AGILE_BOOTS: new EquipmentItem(
        "agile_boots",
        "Agile Boots",
        "Boots that enhance movement",
        1.5,
        250,
        "accessory",
        { speed: 3, defense: 1 }
      ),

      AMULET_OF_HEALTH: new EquipmentItem(
        "amulet_health",
        "Amulet of Health",
        "Increases maximum health",
        0.5,
        350,
        "accessory",
        { health: 25 }
      ),
    };
  }

  static getShopItems(): GameItem[] {
    const consumables = Object.values(this.createConsumables());
    const equipment = Object.values(this.createEquipment());

    return [...consumables, ...equipment].filter((item) =>
      ["HEALTH_POTION", "MANA_POTION", "IRON_SWORD", "LEATHER_ARMOR"].includes(
        item.id
      )
    );
  }
}
