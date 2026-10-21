// Inspired by the novel and historical eras; thresholds are wallpaper game rules.
// Only actual safe production years count. Dormancy preserves progress without advancing it.
export const technologyRevision=2;
export const civilizationLevels = [
  {level:1,years:0,zh:'旧石器时代',en:'Paleolithic age',resilience:1,climate:0,storage:0},
  {level:2,years:200,zh:'新石器时代',en:'Neolithic age',resilience:1.08,climate:1,storage:5},
  {level:3,years:800,zh:'青铜时代',en:'Bronze age',resilience:1.18,climate:2,storage:10},
  {level:4,years:1800,zh:'铁器时代',en:'Iron age',resilience:1.35,climate:3,storage:20},
  {level:5,years:3500,zh:'古典文明',en:'Classical civilization',resilience:1.55,climate:5,storage:30},
  {level:6,years:6000,zh:'中世纪文明',en:'Medieval civilization',resilience:1.8,climate:8,storage:45},
  {level:7,years:9000,zh:'蒸汽时代',en:'Steam age',resilience:2.1,climate:11,storage:60},
  {level:8,years:12000,zh:'电气时代',en:'Electrical age',resilience:2.5,climate:15,storage:80},
  {level:9,years:16000,zh:'原子时代',en:'Atomic age',resilience:3,climate:20,storage:105},
  {level:10,years:21000,zh:'信息时代',en:'Information age',resilience:3.6,climate:27,storage:135},
  {level:11,years:28000,zh:'航天时代',en:'Spaceflight age',resilience:4.6,climate:35,storage:165},
  {level:12,years:40000,zh:'星际远航准备',en:'Interstellar preparation',resilience:6,climate:45,storage:200}
];
export function levelFor(years=0,enabled=true){let stage=civilizationLevels[0];if(enabled)for(const candidate of civilizationLevels)if(years>=candidate.years)stage=candidate;return stage;}
export function developmentSnapshot(years,settings,alive){
  if(!alive)return null;
  const stage=levelFor(years,settings.civilizationLevels),next=settings.civilizationLevels?civilizationLevels[stage.level]:null;
  return {...stage,technologyRevision,enabled:settings.civilizationLevels,label:settings.cnen2?stage.en:stage.zh,developmentYears:years,nextYears:next?.years??null,progress:next?Math.min(1,(years-stage.years)/(next.years-stage.years)):1};
}
