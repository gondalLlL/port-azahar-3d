export const CONFIG = {
  WORLD_SIZE: 1200, // world units width/height
  BLOCK_SIZE: 60,
  ROAD_WIDTH: 14,
  SIDEWALK_WIDTH: 4,
  MAX_WANTED: 5,
  DISTRICTS: [
    { name: 'Docks', color: 0x2c3e50, bounds: { xMin: -600, xMax: -200, zMin: 200, zMax: 600 } },
    { name: 'Neon Mile', color: 0x8e44ad, bounds: { xMin: -200, xMax: 200, zMin: -200, zMax: 200 } },
    { name: 'Old Town', color: 0xd35400, bounds: { xMin: -600, xMax: -200, zMin: -600, zMax: -200 } },
    { name: 'Marina', color: 0x16a085, bounds: { xMin: 200, xMax: 600, zMin: -600, zMax: -200 } },
    { name: 'The Hills', color: 0x27ae60, bounds: { xMin: 200, xMax: 600, zMin: 200, zMax: 600 } }
  ],
  MISSIONS: [
    {
      id: 1,
      title: "First Run",
      client: "Marisol Kane",
      dialogue: "Dario, pick up the package down at the Docks warehouse and deliver it across town to the Neon Mile before the timer runs out.",
      desc: "Drive to the Docks pickup zone, then deliver to Neon Mile.",
      targetPos: { x: -400, z: 400 },
      deliverPos: { x: 0, z: 0 },
      timeLimit: 120,
      reward: 1500
    },
    {
      id: 2,
      title: "Borrowed Wheels",
      client: "Marisol Kane",
      dialogue: "I need that azure sports car parked in Old Town. Steal it clean and bring it to our chop shop in Marina.",
      desc: "Steal the marked sports car in Old Town and drive it to Marina.",
      targetPos: { x: -400, z: -400 },
      deliverPos: { x: 400, z: -400 },
      timeLimit: 150,
      reward: 3000
    },
    {
      id: 3,
      title: "Heat",
      client: "Marisol Kane",
      dialogue: "The cops are breathing down our necks. Stir up trouble until you hit 3 stars heat, then lose them and reach the safehouse in The Hills.",
      desc: "Reach 3 Wanted stars, then escape to The Hills safehouse.",
      targetPos: { x: 400, z: 400 },
      timeLimit: 180,
      reward: 5000
    },
    {
      id: 4,
      title: "Three Drops",
      client: "Marisol Kane",
      dialogue: "Time to collect from our associates across the city. Hit all three cash drops while the police pressure rises.",
      desc: "Collect 3 cash drop boxes located around the city.",
      drops: [
        { x: -300, z: 200 },
        { x: 200, z: -300 },
        { x: 350, z: 300 }
      ],
      timeLimit: 200,
      reward: 7500
    },
    {
      id: 5,
      title: "Last Boat",
      client: "Marisol Kane",
      dialogue: "Federal task force is raiding the city. Get to the marina boat and escape Port Azahar once and for all!",
      desc: "Drive to the Marina and board the escape boat.",
      targetPos: { x: 500, z: -500 },
      timeLimit: 160,
      reward: 15000
    }
  ]
};
