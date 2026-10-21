"""Audit actual experiment records, cohort completeness and frozen source hashes."""
import pathlib,json,hashlib,collections,math

root=pathlib.Path(__file__).resolve().parent
configs=['phase1','phase2','numerics','ablation','phase3','candidate-convergence','candidate-convergence-rest','geometry','geometry-confirm']
checks=[];fresh=0
physical={'engulfed','disrupted','boundary-crossing','positive-energy-escape'}
for name in configs:
    cp=root/(name+'.json');cfg=json.loads(cp.read_text());output=root/cfg['output'];rows=[json.loads(l) for l in output.read_text().splitlines()]
    expected={(p['id'],f"{cfg['prefix']}-{i}") for i in range(cfg.get('start',0),cfg.get('start',0)+cfg['seeds']) for p in cfg['profiles']}
    keys=[(r['profile'],r['seed']) for r in rows];assert len(keys)==len(set(keys)) and set(keys)==expected,name
    h=hashlib.sha256((root/cfg.get('engine','./engine.mjs')).read_bytes()+cp.read_bytes()).hexdigest();assert h==json.loads(pathlib.Path(str(output)+'.manifest.json').read_text())['hash'],name
    for r in rows:
        assert len(r['initialBodies'])==4 and len(r['finalBodies'])==4
        assert all(b['mass']>0 for b in r['initialBodies']),('No hidden/inactive bodies',name)
        assert not r['error'],(name,r['seed'],r['error'])
        assert 0<=r['stableFraction']<=1 and 0<=r['jointStableFraction']<=r['stableFraction']+1e-12
        assert r['stableFraction']<=r['restrictedLife']/r['horizon']+1/60/r['horizon']+1e-12
        if r['survived']:assert r['lossAt'] is None and r['completed']
        if r['jointSurvived']:assert r['survived'] and r['starContactAt'] is None and r['starBoundaryAt'] is None
        assert all(math.isfinite(b[k]) for b in r['initialBodies'] for k in ['x','y','z','vx','vy','vz','mass'])
    for p in cfg['profiles']:
        settings=p.get('settings',{});assert settings.get('newproperty60',False) is False
        assert 'newproperty13' not in settings and 'epochWindow' not in settings
    fresh+=len(rows);checks.append({'config':name,'rows':len(rows),'cohortComplete':True,'noDuplicates':True,'sourceHashVerified':True})

extensions={}
for name,n in [('extended-3000',512),('extended-10000-v2',512),('candidate-fine-extended-3000',128),('candidate-fine-extended-10000',128),('geometry-extended-3000',64),('geometry-extended-10000',64)]:
    rr=[json.loads(l) for l in (root/'results'/f'{name}.jsonl').read_text().splitlines()];assert len(rr)==n and len({(r['profile'],r['seed']) for r in rr})==n
    unresolved=[r for r in rr if r['error'] and r['lossReason'] not in physical]
    assert not unresolved,(name,[(r['seed'],r['error']) for r in unresolved])
    for r in rr:
        if r.get('inheritedAbsorbingLoss'):assert r['lossReason'] in physical and r['lossAt'] is not None and not r['survived']
    extensions[name]={'rows':len(rr),'allPrimaryOutcomesKnown':True,'numericalStopsAfterKnownPhysicalLoss':sum(bool(r['error']) for r in rr),'fullyRecomputedThisStage':sum(r.get('integratedThisStage',False) for r in rr)}

old=[json.loads(l) for l in (root/'results/extended-10000.jsonl').read_text().splitlines()];assert sum(bool(r['error']) for r in old)==2
for r in old:
    if r['error']:assert r['lossReason']=='numerical-resource-limit'
report={'pass':True,'freshPrimaryTrials':fresh,'checks':checks,'extensions':extensions,'supersededOriginal10000YearFileContainsTwoBudgetStops':True,'canonical10000File':'extended-10000-v2.jsonl','note':'The geometry long run has one numerical stop AFTER an observed positive-energy escape; primary outcome known, later point-mass continuation unverified.'}
(root/'results/DATA_AUDIT.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2))
