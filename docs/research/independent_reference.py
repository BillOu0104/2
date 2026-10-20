"""Independent SciPy DOP853 cross-check; no project integrator code is reused."""
import json,pathlib,subprocess
import numpy as np
from scipy.integrate import solve_ivp

root=pathlib.Path(__file__).resolve().parents[2]
js="""import {initial,Integrator} from './docs/research/engine.mjs';
let output=[];
for(const config of [{},{planet:'bound',inPlane:true,radiusFraction:.2}]){
 const {bodies}=initial('INDEPENDENT-0',config),before=structuredClone(bodies),finals=[];
 for(const dt of [.00075,.000375,.0001875]){const p=new Integrator(structuredClone(before));for(let i=0;i<Math.round(4.5/dt);i++)p.step(dt);finals.push({dt,bodies:p.bodies});}
 output.push({config,initial:before,finals});
}console.log(JSON.stringify(output));"""
samples=json.loads(subprocess.check_output(['node','--input-type=module','-e',js],cwd=root,text=True))
G=1.3275440274585598e-8;results=[]
for sample in samples:
    masses=np.array([b['mass'] for b in sample['initial']])
    keys=['x','y','z','vx','vy','vz']
    y0=np.array([[b[k] for k in keys] for b in sample['initial']]).ravel()
    def rhs(t,y):
        b=y.reshape(4,6);a=np.zeros((4,3))
        for i in range(4):
            for j in range(i+1,4):
                dr=b[j,:3]-b[i,:3];r=np.linalg.norm(dr);f=G*dr/r**3
                a[i]+=masses[j]*f;a[j]-=masses[i]*f
        return np.concatenate((b[:,3:],a),axis=1).ravel()
    s=solve_ivp(rhs,(0,4.5),y0,method='DOP853',rtol=1e-12,atol=1e-14)
    differences=[]
    for final in sample['finals']:
        expected=np.array([[b[k] for k in keys] for b in final['bodies']]).ravel()
        differences.append({'dt':final['dt'],'maxStateDifference':float(np.max(np.abs(expected-s.y[:,-1])))})
    assert s.success and differences[-1]['maxStateDifference']<1e-7,(s.message,differences)
    assert differences[-1]['maxStateDifference']<differences[0]['maxStateDifference']
    results.append({'config':sample['config'],'solverTime':4.5,'differences':differences,'referenceEvaluations':s.nfev})
report={'pass':True,'reference':'SciPy DOP853 rtol=1e-12 atol=1e-14; independently written force','results':results}
(root/'docs/research/independent-validation.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2))
