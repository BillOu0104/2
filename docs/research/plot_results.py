import json,pathlib,collections
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

root=pathlib.Path(__file__).resolve().parent;out=root/'figures';out.mkdir(exist_ok=True)
plt.rcParams.update({'font.size':10,'axes.spines.top':False,'axes.spines.right':False,'figure.dpi':130})
rows=[json.loads(l) for l in (root/'results/phase3.jsonl').read_text().splitlines()]
g=collections.defaultdict(list)
for r in rows:g[r['profile']].append(r)
if len(rows)!=512:raise RuntimeError('Complete frozen holdout first')
names=['legacy-random','newton-random','retro12-originalQ','candidate'];labels=['Original, cage off','Newton, random','Newton, bound retrograde','Newton, bound retrograde + Q=1'];colors=['#555555','#d68e24','#3a8eab','#136e45'];grid=np.linspace(0,1000,501)
fig,axs=plt.subplots(2,2,figsize=(12,8),layout='constrained')
for name,label,color in zip(names,labels,colors):
    rr=g[name];times=np.array([r['lossAt'] if r['lossAt'] is not None else np.inf for r in rr]);s=np.mean(times[:,None]>grid[None,:],axis=0);axs[0,0].plot(grid,s,label=label,color=color)
axs[0,0].set(xlabel='Project display years (same physical duration)',ylabel='Planet survival fraction',ylim=(0,1.02));axs[0,0].legend(fontsize=8);axs[0,0].set_title('Independent matched cohort: 128 seeds per group')
rng=np.random.default_rng(20261020)
for j,(name,color) in enumerate(zip(names,colors)):
    a=np.array([r['stableFraction'] for r in g[name]]);boot=a[rng.integers(0,len(a),(10000,len(a)))].mean(axis=1);lo,hi=np.quantile(boot,[.025,.975]);axs[0,1].bar(j,a.mean(),color=color);axs[0,1].errorbar(j,a.mean(),yerr=[[a.mean()-lo],[hi-a.mean()]],color='black',capsize=4)
axs[0,1].set(xticks=range(4),xticklabels=['Original','Newton random','Bound retro','Candidate'],ylabel='Stable-era time / full 1000-year window',ylim=(0,1));axs[0,1].set_title('95% seed-bootstrap intervals; loss counts as zero')
base={r['seed']:r for r in g['legacy-random']};candidate={r['seed']:r for r in g['candidate']}
dx=[candidate[s]['restrictedLife']-base[s]['restrictedLife'] for s in base];dy=[candidate[s]['stableFraction']-base[s]['stableFraction'] for s in base]
axs[1,0].scatter(dx,dy,s=22,alpha=.7,color=colors[-1]);axs[1,0].axhline(0,color='gray',lw=.7);axs[1,0].axvline(0,color='gray',lw=.7);axs[1,0].set(xlabel='Paired change in restricted lifetime (display years)',ylabel='Paired change in full-window stable fraction');axs[1,0].set_title('All 128 paired seeds, including adverse outcomes')
for r in g['candidate']:axs[1,1].scatter(r['compactNonhierFraction'],r['stableFraction'],c=colors[-1] if r['jointSurvived'] else '#aaaaaa',s=24,alpha=.75)
axs[1,1].set(xlabel='Time fraction: compact, rmax/rmin < 3, no star contact',ylabel='Full-window stable fraction',xlim=(0,1),ylim=(0,1));axs[1,1].set_title('Candidate: green = planet + intact stellar triplet survives')
fig.savefig(out/'holdout.png',dpi=180);plt.close(fig)

fig,axs=plt.subplots(1,2,figsize=(12,4),layout='constrained')
for name,label,color in zip(names,labels,colors):
    ss=[]
    for file in ['phase3','extended-3000','extended-10000-v2']:
        rr=[json.loads(l) for l in (root/'results'/f'{file}.jsonl').read_text().splitlines()];a=[r for r in rr if r['profile']==name];ss.append(np.mean([r['survived'] for r in a]))
    axs[0].plot([1000,3000,10000],ss,'o-',color=color,label=label)
axs[0].set(xscale='log',xlabel='Horizon (display years)',ylabel='Survivors / original 128 seeds',ylim=(-.01,1));axs[0].legend(fontsize=8);axs[0].set_title('Entire holdout cohort retained at each horizon')
for name,label,color in [('candidate','Candidate','#136e45'),('hierarchy-control','Hierarchical control','#634c9b')]:
    rr=[json.loads(l) for l in (root/'results/chaos.jsonl').read_text().splitlines()];a=[r for r in rr if r['profile']==name];array=np.array([[p['relativeStellarSeparation']/r['initialRelativeSeparation'] for p in r['points']] for r in a]);t=[p['years'] for p in a[0]['points']];med=np.median(array,axis=0);axs[1].semilogy(t,np.maximum(med,1e-3),color=color,label=label)
axs[1].set(xlabel='Display years',ylabel='Median stellar perturbation amplification');axs[1].legend();axs[1].set_title('16 shadow pairs; finite-time sensitivity only')
fig.savefig(out/'long-horizon-and-chaos.png',dpi=180);plt.close(fig)

fig,axs=plt.subplots(1,2,figsize=(12,4),layout='constrained')
for ax,seed in zip(axs,['EXPLORE-A-3','EXPLORE-A-15']):
    data=np.genfromtxt(root/'results'/f'slingshot-{seed}.csv',delimiter=',',names=True);work=data['workStar1']+data['workStar2']+data['workStar3'];ep0=json.load(open(root/'results/slingshot-summary.json'))['reports'][0 if seed.endswith('-3') else 1]['initialPlanetSpecificEnergy'];ax.plot(data['years'],data['planetSpecificEnergy'],label='Planet specific energy');ax.plot(data['years'],ep0+work,'--',label='Initial energy + integrated stellar work');ax.axhline(0,color='gray',lw=.8);ax.set(xlabel='Display years',ylabel='Inertial planet specific energy',title=seed);ax.legend(fontsize=8)
fig.savefig(out/'slingshot-work.png',dpi=180);plt.close(fig)
print('Saved:',*[str(p) for p in out.glob('*.png')])
