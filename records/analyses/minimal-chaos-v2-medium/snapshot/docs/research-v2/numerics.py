#!/usr/bin/env python3
"""Independent DOP853 comparison for the exact same Newtonian initial state."""
import json,pathlib,subprocess,numpy as np
from scipy.integrate import solve_ivp
root=pathlib.Path(__file__).resolve().parents[2]
js="""
import fs from 'node:fs';import {initialize,keys} from './docs/research-v2/engine.mjs';import {GravityIntegrator} from './src/physics/gravity.js';
const {bodies,settings}=initialize('V2-INDEPENDENT-0');let samples=[];for(const factor of [1,.5,.25]){const b=structuredClone(bodies),g=new GravityIntegrator(b,1.3275440274585598e-8);for(let i=0;i<600;i++)g.advance(.0075,{maxStep:.00075*factor,eta:.0075*factor});samples.push({factor,bodies:b,diagnostics:g.diagnostics()});}console.log(JSON.stringify({initial:bodies,samples}));
"""
data=json.loads(subprocess.check_output(['node','--input-type=module','-e',js],cwd=root));b=data['initial'];fields=['x','y','z','vx','vy','vz'];y0=np.array([[x[k] for k in fields] for x in b]).flatten();m=np.array([x['mass'] for x in b]);G=1.3275440274585598e-8
def rhs(t,y):
 x=y.reshape(4,6);out=np.zeros((4,6));out[:,:3]=x[:,3:]
 for i in range(4):
  for j in range(i+1,4):
   r=x[j,:3]-x[i,:3];f=G*r/np.linalg.norm(r)**3;out[i,3:]+=m[j]*f;out[j,3:]-=m[i]*f
 return out.flatten()
ref=solve_ivp(rhs,[0,4.5],y0,method='DOP853',rtol=2.3e-14,atol=1e-15);assert ref.success
errors=[]
for x in data['samples']:
 y=np.array([[v[k] for k in fields] for v in x['bodies']]).flatten();errors.append({'stepFactor':x['factor'],'maxStateError':float(np.max(np.abs(y-ref.y[:,-1]))),'energyResidual':x['diagnostics']['maxRelativeEnergyError'],'steps':x['diagnostics']['steps']})
report={'seed':'V2-INDEPENDENT-0','solverTime':4.5,'displayYears':10,'independentMethod':'SciPy DOP853','rtol':2.3e-14,'atol':1e-15,'referenceSteps':len(ref.t),'convergence':errors,'note':'Smooth short-window Newtonian consistency; controlled event convergence requires matched ensembles separately.'}
assert errors[-1]['maxStateError']<1e-8,report
(root/'docs/research-v2/results/independent-numerics.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2))
