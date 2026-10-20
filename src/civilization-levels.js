// Inspired by the novel; numerical progression and tolerance values are adjustable game rules.
export const civilizationLevels = [
  { level:1, years:0, zh:'初生聚落', en:'Early settlements', resilience:1, climate:0, storage:0 },
  { level:2, years:5, zh:'农耕文明', en:'Agrarian civilization', resilience:1.35, climate:3, storage:20 },
  { level:3, years:20, zh:'工业文明', en:'Industrial civilization', resilience:1.9, climate:8, storage:45 },
  { level:4, years:60, zh:'原子与信息文明', en:'Atomic and information age', resilience:2.8, climate:16, storage:80 },
  { level:5, years:150, zh:'航天文明', en:'Spaceflight civilization', resilience:4, climate:28, storage:130 },
  { level:6, years:350, zh:'星际远航准备', en:'Interstellar preparation', resilience:6, climate:45, storage:200 }
];
export function levelFor(years=0,enabled=true){let stage=civilizationLevels[0];if(enabled)for(const candidate of civilizationLevels)if(years>=candidate.years)stage=candidate;return stage;}
export function developmentSnapshot(years,settings,alive){
  if(!alive)return null;
  const stage=levelFor(years,settings.civilizationLevels),next=settings.civilizationLevels?civilizationLevels[stage.level]:null;
  return {...stage,enabled:settings.civilizationLevels,label:settings.cnen2?stage.en:stage.zh,developmentYears:years,nextYears:next?.years??null,progress:next?Math.min(1,(years-stage.years)/(next.years-stage.years)):1};
}
