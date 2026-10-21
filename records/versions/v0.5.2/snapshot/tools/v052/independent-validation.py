"""Independent force + SciPy DOP853; only initial states are imported from JS."""
import json,pathlib,numpy as np
from scipy.integrate import solve_ivp
root=pathlib.Path(__file__).resolve().parents[2]
samples=json.loads((root/'docs/v052/results/validation-samples.json').read_text())
keys=['x','y','z','vx','vy','vz'];results=[]
for sample in samples:
    masses=np.array([b['mass'] for b in sample['initial']]);G=sample['G'];end=sample['solverTime']
    y0=np.array([[b[k] for k in keys] for b in sample['initial']]).ravel()
    def rhs(t,y):
        bodies=y.reshape(4,6);acceleration=np.zeros((4,3))
        for i in range(4):
            for j in range(i+1,4):
                delta=bodies[j,:3]-bodies[i,:3]
                force_per_mass=G*delta/np.linalg.norm(delta)**3
                acceleration[i]+=masses[j]*force_per_mass
                acceleration[j]-=masses[i]*force_per_mass
        return np.concatenate((bodies[:,3:],acceleration),axis=1).ravel()
    ref=solve_ivp(rhs,(0,end),y0,method='DOP853',rtol=1e-12,atol=1e-14,dense_output=True)
    finer=solve_ivp(rhs,(0,end),y0,method='DOP853',rtol=1e-13,atol=1e-15)
    assert ref.success and finer.success
    reference_difference=float(np.max(np.abs(ref.y[:,-1]-finer.y[:,-1])))
    differences=[]
    for final in sample['finals']:
        state=np.array([[b[k] for k in keys] for b in final['bodies']]).ravel()
        differences.append({'maxStep':final['maxStep'],'adaptive':final['adaptive'],'maxStateDifference':float(np.max(np.abs(state-finer.y[:,-1])))})
    ratios=[differences[i]['maxStateDifference']/differences[i+1]['maxStateDifference'] for i in range(2)]
    assert differences[2]['maxStateDifference']<1e-7,(sample['seed'],differences)
    assert differences[3]['maxStateDifference']<1e-7,(sample['seed'],differences)
    if differences[0]['maxStateDifference']>1e-9:
        assert min(ratios)>10,(sample['seed'],ratios)
    # Audit contact validity independently on a dense reference trajectory.
    b=ref.sol(np.linspace(0,end,20001)).T.reshape(-1,4,6)
    minimum_surface_gap=min(float(np.min(np.linalg.norm(b[:,j,:3]-b[:,i,:3],axis=1)))-sample['radii'][i]-sample['radii'][j] for i in range(4) for j in range(i+1,4))
    results.append({'seed':sample['seed'],'solverTime':end,'referenceEvaluations':ref.nfev,'referenceToleranceDifference':reference_difference,'differences':differences,'fixedStepRatios':ratios,'minimumNominalSurfaceGap':minimum_surface_gap})
report={'passed':True,'reference':'Independently written pairwise Newton force, SciPy DOP853; rtol=1e-12/1e-13, atol=1e-14/1e-15','seedPolicy':'First four predetermined V052-INDEPENDENT seeds, none filtered','results':results}
(root/'docs/v052/results/independent-validation.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2))
