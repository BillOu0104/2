import json,pathlib,collections
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
root=pathlib.Path(__file__).resolve().parent
load=lambda name:[json.loads(l) for l in (root/'results'/f'{name}.jsonl').read_text().splitlines()]
fig,axs=plt.subplots(1,3,figsize=(15,4),layout='constrained');colors=['#555555','#167b51','#d58e26'];names=['newton-random','figure8-perturb01','figure8-perturb05'];labels=['Random Newton','Figure-eight + 1%','Figure-eight + 5%']
data=load('geometry-confirm')
for i,(name,label,color) in enumerate(zip(names,labels,colors)):
 a=[r for r in data if r['profile']==name];axs[0].bar(i-.15,np.mean([r['survived'] for r in a]),.3,color=color);axs[0].bar(i+.15,np.mean([r['jointSurvived'] for r in a]),.3,color=color,alpha=.4)
axs[0].set(xticks=range(3),xticklabels=['Random','1% family','5% family'],ylim=(0,1.05),ylabel='Survivors / 64 new seeds');axs[0].set_title('Independent 1000-year confirmation\nSolid: planet; pale: planet + intact stellar triplet')
for name,label,color in zip(names[1:],labels[1:],colors[1:]):
 values=[]
 for file in ['geometry','geometry-extended-3000','geometry-extended-10000']:
  a=[r for r in load(file) if r['profile']==name];values.append(np.mean([r['jointSurvived'] for r in a]))
 axs[1].plot([1000,3000,10000],values,'o-',label=label,color=color)
axs[1].set(xscale='log',ylim=(-.02,1.02),xlabel='Display years',ylabel='Joint survivors / original 32 seeds');axs[1].legend(fontsize=8);axs[1].set_title('Long extension: fixed original cohort')
shadow=load('geometry-shadow')
for name,label,color in [('figure8-periodic-control','Nominal periodic IC','#634c9b'),('figure8-perturb01','1% family','#167b51'),('figure8-perturb05','5% family','#d58e26')]:
 for r in [x for x in shadow if x['profile']==name]:
  end=min(r['referenceFirstContact'] or 3001,r['shadowFirstContact'] or 3001);points=[p for p in r['points'] if 0<p['years']<end];axs[2].semilogy([p['years'] for p in points],[max(p['relativeSeparation']/r['initialSeparation'],1e-6) for p in points],color=color,alpha=.28,lw=.7)
 axs[2].plot([],[],color=color,label=label)
axs[2].set(xlabel='Display years, before first body contact',ylabel='Stellar perturbation amplification',ylim=(.1,1e10));axs[2].legend(fontsize=8);axs[2].set_title('16 shadow pairs per family\nNo post-contact point-mass claims')
fig.savefig(root/'figures/geometry-tradeoff.png',dpi=180)
