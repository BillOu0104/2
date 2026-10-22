#!/usr/bin/env python3
"""Descriptive plots only; no simulation or sample filtering for selection."""
import hashlib,json,pathlib
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
D=pathlib.Path(__file__).parent/'results/precision-baselines';raw=D/'matched-h4.jsonl';rows=[json.loads(l) for l in raw.open()];review=json.load(open(D/'matched-review.json'))
profiles=['newton__h4','legacy-cage__h4','deflect4-trigger8__h4','reflect-trigger8__h4'];labels=['Newton','Old cage','Deflect + capture','Reflect + capture'];colors=['#697384','#b17a42','#197dbe','#bb426a']
fig,ax=plt.subplots(1,3,figsize=(15,4.5));rng=np.random.default_rng(20261022)
for i,p in enumerate(profiles):
 r=review['groups'][p];mean=r['stellarIntact']/r['n'];lo,hi=r['stellarWilson95'];ax[0].errorbar(i-.08,100*mean,yerr=[[100*(mean-lo)],[100*(hi-mean)]],fmt='o',color=colors[i],capsize=4);ax[0].scatter(i+.08,100*r['joint']/r['n'],marker='D',color=colors[i]);v=[q['matureStableFraction']*100 for q in rows if q['profile']==p];ax[1].scatter(i+rng.uniform(-.15,.15,len(v)),v,s=8,alpha=.35,color=colors[i]);ax[1].plot([i-.2,i+.2],[np.mean(v)]*2,color='black',linewidth=2)
for i,p in enumerate(profiles[2:],2):
 rr=[r for r in rows if r['profile']==p];x=np.array([r['control']['absoluteWork']/abs(r['initialEnergy']) for r in rr]);y=np.array([r['matureConditionalFTLE'] for r in rr]);assert np.all(x>0);ax[2].scatter(x,y,s=12,alpha=.65,color=colors[i],label=labels[i])
ax[0].set(ylim=(-3,106),ylabel='100,000-year outcomes (%)',title='Intact: circle + Wilson95; joint: diamond');ax[1].axhspan(10,15,color='green',alpha=.12);ax[1].set(ylabel='Mature stable-era fraction (%)',title='All128 Seeds; failed runs keep full denominator')
for a in ax[:2]:a.set_xticks(range(4),labels,rotation=20,ha='right');a.grid(axis='y',alpha=.2)
ax[2].set(xscale='log',xlabel='Cumulative absolute control work / |E0|',ylabel='Mature conditional stellar FTLE (1/year)',title='Cost vs sensitivity; per Seed, n=128 each');ax[2].axhline(.003,color='gray',linestyle='--');ax[2].legend(fontsize=8);ax[2].grid(alpha=.2)
fig.suptitle('Matched h4 precision, fixed128 initial conditions; diagnostic follow-up to frozen primary confirmation',fontsize=11);fig.tight_layout();fig.savefig(D/'matched-h4-overview.png',dpi=180);fig.savefig(D/'matched-h4-overview.pdf');json.dump({'input':str(raw),'inputSHA256':hashlib.sha256(raw.read_bytes()).hexdigest(),'rows':len(rows),'scope':'Descriptive matched h4 follow-up, not1280independent Seeds or additional primary confirmation; all failures retained'},open(D/'matched-h4-plot-provenance.json','w'),indent=2)
