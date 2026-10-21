#!/usr/bin/env python3
import json,pathlib,sys,numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
stem=sys.argv[1];data=json.load(open(stem+'.summary.json'))['groups'];names=list(data);fig,ax=plt.subplots(1,3,figsize=(15,4.5),constrained_layout=True)
rates=np.array([data[n]['stellarRateObserved'] for n in names]);ci=[data[n]['wilsonKnownOnly'] for n in names];lower=[rates[i]-ci[i][0] if ci[i] else 0 for i in range(len(names))];upper=[ci[i][1]-rates[i] if ci[i] else 0 for i in range(len(names))]
ax[0].barh(names,rates,xerr=[lower,upper],color='#4385ae',capsize=3);ax[0].set_xlim(0,1.05);ax[0].set_xlabel('Stellar integrity / Wilson 95% CI');ax[0].axvspan(.7,.8,color='green',alpha=.1)
for i,n in enumerate(names):ax[0].text(.02,i,f"{data[n]['stellarSuccesses']}/{data[n]['n']}",va='center',color='white' if rates[i]>.2 else 'black')
for i,n in enumerate(names):
 d=data[n]['survivorDistribution'];x=[r['matureStableFraction'] if r['matureStableFraction'] is not None else r['stableFraction'] for r in d.values()];ax[1].scatter(x,np.full(len(x),i),s=15,alpha=.65,label=n);allseed=data[n]['matureStableAllSeedsMean'];ax[1].scatter(allseed if allseed is not None else data[n]['stableAllSeedsMean'],i,marker='x',color='black',s=45)
 ftle=data[n].get('matureConditionalFTLESurvivorsMean') or data[n].get('fullConditionalFTLESurvivorsMean');active=data[n].get('controlActiveFrameFractionMean')
 if ftle is not None and active is not None:ax[2].scatter(max(active,1e-7),ftle,s=80);ax[2].annotate(n,(max(active,1e-7),ftle),xytext=(4,3),textcoords='offset points',fontsize=7)
ax[1].set_yticks(range(len(names)),names);ax[1].axvspan(.1,.15,color='green',alpha=.12);ax[1].set_xlabel('Mature stable fraction (full if <=10k years)\nSurvivor dots / all-seed x; same time window');ax[1].set_xlim(0,1)
ax[2].set_xscale('log');ax[2].set_xlabel('Control-active frame fraction');ax[2].set_ylabel('Conditional stellar FTLE / display year')
for a in ax:a.grid(alpha=.2,axis='x')
fig.suptitle(pathlib.Path(stem).name+' — measured horizon only; survivors shown separately');fig.savefig(stem+'.png',dpi=180);fig.savefig(stem+'.svg');print(stem+'.png')
