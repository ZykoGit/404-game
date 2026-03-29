export const MapLoader = {
  async load(url){
    const res = await fetch(url);
    const json = await res.json();
    // normalize triggers map
    const triggers = {};
    (json.triggers || []).forEach(t => {
      triggers[`${t.x},${t.y}`] = { ...t, used:false };
    });
    return {
      layout: json.layout,
      tileSize: json.tileSize || 1,
      width: json.layout[0].length,
      height: json.layout.length,
      spawn: json.spawn,
      exit: json.exit,
      triggers
    };
  },

  getTile(map, x, y){
    if (x < 0 || y < 0 || y >= map.layout.length || x >= map.layout[0].length) return 1;
    return map.layout[y][x];
  },

  triggerAt(map, x, y){
    return map.triggers[`${x},${y}`] || null;
  },

  markTriggerUsed(map, id){
    for(const k in map.triggers){
      if(map.triggers[k].id === id) map.triggers[k].used = true;
    }
  }
};
