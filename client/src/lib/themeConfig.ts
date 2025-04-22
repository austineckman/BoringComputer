export const themeConfig = {
  colors: {
    spaceDarkest: '#06090C',
    spaceDark: '#0D1117',
    spaceMid: '#161B22',
    spaceLight: '#21262D',
    brandOrange: '#FF5B00',
    brandYellow: '#FF9300',
    brandGold: '#FFD800',
    brandLight: '#EFEFEF',
    resourceCloth: '#9C6ADE',
    resourceMetal: '#B4B4B4',
    resourceTechScrap: '#3ECDA2',
    resourceSensorCrystal: '#44A0FF',
    resourceCircuitBoard: '#00C781',
    resourceAlchemyInk: '#FF7EB9',
    resourceLootCrate: '#FFD800'
  },
  
  // Using adventure lines instead of kits for the new progression system
  adventureLines: [
    {
      id: 'lost-in-space',
      name: '30 Days Lost in Space',
      icon: 'rocket',
      color: '#FF5B00',
      imagePath: '30-days-pixelart.png'
    },
    {
      id: 'cogsworth-city',
      name: 'Cogsworth City',
      icon: 'cogs',
      color: '#00C781',
      imagePath: 'cogsworth-pixelart.png'
    },
    {
      id: 'pandoras-box',
      name: 'Pandora\'s Box',
      icon: 'box',
      color: '#9C6ADE',
      imagePath: 'pandora-pixelart.png'
    },
    {
      id: 'neon-realm',
      name: 'Neon Realm',
      icon: 'lightbulb',
      color: '#44A0FF',
      imagePath: 'neon-realm-pixelart.png'
    },
    {
      id: 'nebula-raiders',
      name: 'Nebula Raiders',
      icon: 'meteor',
      color: '#FF7EB9',
      imagePath: 'nebula-pixelart.png'
    }
  ],
  
  // Keep for backward compatibility
  adventureKits: [
    {
      id: 'lost-in-space',
      name: '30 Days Lost in Space',
      icon: 'rocket',
      color: '#FF5B00',
    },
    {
      id: 'cogsworth-city',
      name: 'Cogsworth City',
      icon: 'cogs',
      color: '#00C781',
    },
    {
      id: 'pandoras-box',
      name: 'Pandora\'s Box',
      icon: 'box',
      color: '#9C6ADE',
    },
    {
      id: 'neon-realm',
      name: 'Neon Realm',
      icon: 'lightbulb',
      color: '#44A0FF',
    },
    {
      id: 'nebula-raiders',
      name: 'Nebula Raiders',
      icon: 'meteor',
      color: '#FF7EB9',
    }
  ],
  
  resourceTypes: [
    {
      id: 'cloth',
      name: 'Cloth',
      icon: 'scroll',
      color: 'var(--resource-cloth)',
    },
    {
      id: 'metal',
      name: 'Metal',
      icon: 'cog',
      color: 'var(--resource-metal)',
    },
    {
      id: 'tech-scrap',
      name: 'Tech Scrap',
      icon: 'microchip',
      color: 'var(--resource-tech-scrap)',
    },
    {
      id: 'sensor-crystal',
      name: 'Sensor Crystal',
      icon: 'gem',
      color: 'var(--resource-sensor-crystal)',
    },
    {
      id: 'circuit-board',
      name: 'Circuit Board',
      icon: 'memory',
      color: 'var(--resource-circuit-board)',
    },
    {
      id: 'alchemy-ink',
      name: 'Alchemy Ink',
      icon: 'flask',
      color: 'var(--resource-alchemy-ink)',
    },
    {
      id: 'loot-crate',
      name: 'Salvage Crate',
      icon: 'box',
      color: 'var(--resource-loot-crate)',
    }
  ],
  
  achievementTiers: [
    {
      id: 'apprentice',
      name: 'Apprentice',
      color: '#44A0FF',
    },
    {
      id: 'journeyman',
      name: 'Journeyman',
      color: '#00C781',
    },
    {
      id: 'master',
      name: 'Master',
      color: '#FF9300',
    },
    {
      id: 'archmage',
      name: 'Archmage',
      color: '#FF5B00',
    }
  ]
};
