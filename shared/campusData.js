module.exports = {
  CAMPUS_BUILDINGS: [
    { id:'b_main', name:'Main Building', center:[14.6394,121.0462], polygon:[[14.6397,121.0459],[14.6397,121.0465],[14.6391,121.0465],[14.6391,121.0459]], floors:[1,2,3], color:'#3b82f6' },
    { id:'b_science', name:'Science Building', center:[14.6399,121.0470], polygon:[[14.6401,121.0467],[14.6401,121.0473],[14.6397,121.0473],[14.6397,121.0467]], floors:[1,2], color:'#10b981' },
    { id:'b_library', name:'Library', center:[14.6389,121.0468], polygon:[[14.6391,121.0465],[14.6391,121.0471],[14.6387,121.0471],[14.6387,121.0465]], floors:[1], color:'#8b5cf6' },
    { id:'b_canteen', name:'Canteen', center:[14.6388,121.0458], polygon:[[14.6390,121.0455],[14.6390,121.0461],[14.6386,121.0461],[14.6386,121.0455]], floors:[1], color:'#f59e0b' },
    { id:'b_gym', name:'Gym / Covered Court', center:[14.6400,121.0456], polygon:[[14.6402,121.0453],[14.6402,121.0459],[14.6398,121.0459],[14.6398,121.0453]], floors:[1], color:'#ef4444' },
  ],
  CAMPUS_ROOMS: [
    { id:'r_m101', name:'Room M-101', buildingId:'b_main', floor:1, type:'Classroom', capacity:45, center:[14.63955,121.04605], exits:['Main corridor','East exit'], hazards:[], equipment:['Fire extinguisher (near door)','First-aid kit'], lastScan:'2026-10-20', scanStatus:'scanned', safetyScore:92 },
    { id:'r_m102', name:'Room M-102', buildingId:'b_main', floor:1, type:'Classroom', capacity:45, center:[14.63955,121.04635], exits:['Main corridor'], hazards:[{id:'h1',type:'other',severity:'moderate',description:'Cracked wall near window',status:'Verified'}], equipment:['Fire extinguisher'], lastScan:'2026-10-18', scanStatus:'awaiting_verification', safetyScore:74 },
    { id:'r_m103', name:'Faculty Room', buildingId:'b_main', floor:1, type:'Office', capacity:12, center:[14.63925,121.04605], exits:['Main corridor'], hazards:[], equipment:['First-aid kit'], lastScan:'2026-10-22', scanStatus:'scanned', safetyScore:88 },
    { id:'r_m201', name:'Science Lab A-201', buildingId:'b_main', floor:2, type:'Laboratory', capacity:40, center:[14.63955,121.04605], exits:['Lab corridor','Emergency exit'], hazards:[{id:'h2',type:'other',severity:'high',description:'Exposed wiring near rear bench (AI-suggested)',status:'Pending Verification'},{id:'h3',type:'other',severity:'moderate',description:'Exit pathway obstruction',status:'Pending Verification'}], equipment:['Fire extinguisher','Eye wash station','First-aid kit'], lastScan:'2026-10-15', scanStatus:'awaiting_verification', safetyScore:61 },
    { id:'r_m202', name:'Room M-202', buildingId:'b_main', floor:2, type:'Classroom', capacity:45, center:[14.63955,121.04635], exits:['Main corridor'], hazards:[], equipment:['Fire extinguisher'], lastScan:'2026-10-19', scanStatus:'scanned', safetyScore:90 },
    { id:'r_m301', name:'Library Hall M-301', buildingId:'b_main', floor:3, type:'Library', capacity:60, center:[14.6394,121.0462], exits:['Stairwell A','Stairwell B'], hazards:[], equipment:['Fire extinguisher','Emergency lighting'], lastScan:'2026-10-10', scanStatus:'overdue', safetyScore:85 },
    { id:'r_s101', name:'Physics Lab S-101', buildingId:'b_science', floor:1, type:'Laboratory', capacity:35, center:[14.6399,121.0469], exits:['Corridor','Side exit'], hazards:[{id:'h4',type:'fire',severity:'low',description:'Fire extinguisher partially obstructed',status:'Pending Verification'}], equipment:['Fire extinguisher','Safety shower'], lastScan:'2026-10-21', scanStatus:'scanned', safetyScore:80 },
    { id:'r_s201', name:'Chemistry Lab S-201', buildingId:'b_science', floor:2, type:'Laboratory', capacity:35, center:[14.6399,121.0471], exits:['Corridor','Emergency exit'], hazards:[{id:'h5',type:'other',severity:'high',description:'Improper chemical storage observed',status:'Pending Verification'}], equipment:['Fire extinguisher','Fume hood','First-aid kit'], scanStatus:'unscanned', safetyScore:55 },
    { id:'r_lib1', name:'Main Library', buildingId:'b_library', floor:1, type:'Library', capacity:80, center:[14.6389,121.0468], exits:['Main entrance','Rear exit'], hazards:[], equipment:['Fire extinguisher','Emergency lighting','AED'], lastScan:'2026-10-12', scanStatus:'scanned', safetyScore:95 },
    { id:'r_cant1', name:'Canteen Hall', buildingId:'b_canteen', floor:1, type:'Canteen', capacity:200, center:[14.6388,121.0458], exits:['Gate 1','Gate 2'], hazards:[{id:'h6',type:'flood',severity:'moderate',description:'Slippery floor near serving area',status:'Pending Verification'}], equipment:['Fire extinguisher','First-aid kit'], lastScan:'2026-10-16', scanStatus:'scanned', safetyScore:78 },
    { id:'r_gym1', name:'Covered Court', buildingId:'b_gym', floor:1, type:'Assembly', capacity:500, center:[14.6400,121.0456], exits:['North gate','South gate','East gate'], hazards:[], equipment:['Fire extinguisher (x4)','First-aid kit (x2)'], lastScan:'2026-10-14', scanStatus:'scanned', safetyScore:90 },
  ],
  ASSEMBLY_POINTS: [
    { id:'ap1', name:'Covered Court (Gym)', center:[14.6400,121.0456], capacity:500 },
    { id:'ap2', name:'Open Field (East)', center:[14.6394,121.0475], capacity:300 },
  ],
  EVAC_ROUTES: [
    { id:'route1', name:'Main Building -> Covered Court', path:[[14.6394,121.0462],[14.6397,121.0459],[14.6400,121.0456]] },
    { id:'route2', name:'Science Building -> Open Field', path:[[14.6399,121.0470],[14.6397,121.0465],[14.6394,121.0475]] },
  ],
};