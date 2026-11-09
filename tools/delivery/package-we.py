#!/usr/bin/env python3
"""Package an unchanged production build as a clean Web wallpaper project."""
import argparse,datetime,hashlib,json,pathlib,shutil,subprocess,zipfile
ROOT=pathlib.Path(__file__).resolve().parents[2]
sha=lambda b:hashlib.sha256(b).hexdigest()
def prepare(target):
    if target.exists():raise SystemExit('Refusing to overwrite an existing staging directory')
    shutil.copytree(ROOT/'dist',target)
    shutil.rmtree(target/'.openai',ignore_errors=True)
    # Build-only Scene source metadata is not needed by the browser runtime.
    (target/'assets/original-project.json').unlink(missing_ok=True)
    p=json.loads((target/'project.json').read_text())
    allowed={'slider','bool','combo','color','textinput','file','directory'}
    original=p['general']['properties'];properties={k:v for k,v in original.items()if v.get('type')in allowed}
    p['general']={'properties':properties,'supportsaudioprocessing':True}
    p.update(title='三体 · 实时演算 v0.6.1',preview='preview.jpg',type='web',file='index.html',contentrating='Everyone',description='SYKM原版资源基础上的Web重建。v0.6.1设置界面、V2转向控制与P5行星重生。Three.js + Worker，全部资源离线。原场景：SYKM；音乐：Melodysheep — Ether。保留原资源非商用声明，再发布须核实授权。')
    for key in ['workshopid','workshopId','id','workshopurl']:p.pop(key,None)
    (target/'project.json').write_text(json.dumps(p,ensure_ascii=False,indent=2)+'\n')
    info={'applicationVersion':'0.6.1','sourceCommit':'ea50c8075aeb2275897098baf356eff5312bb6e9','releaseTag':'v0.6.1','releaseTagCommit':'e9a3b3ee6451e3554517a5bad0e3529a65b428a8','packagedOn':'2026-11-09','sourceRepository':'https://github.com/BillOu0104/2','nativeActionableProperties':len(properties),'omittedNativeSceneOnlyGroupsAndNotes':len(original)-len(properties),'runtimeSourceChanged':False,'metadataOnlyAdaptations':['Local preview image reference','Version/title/attribution metadata','Only documented Web property types; Scene groups/notes omitted from native metadata; all in-page 220 settings retained','Removed private-hosting configuration and build-only Scene project JSON'],'notes':['Main is still v0.6.0; latest published tag/private release is v0.6.1, PR5 remains draft','Native Windows Wallpaper Engine/Steam publishing not executed in this Linux environment']}
    (target/'RELEASE-INFO.json').write_text(json.dumps(info,ensure_ascii=False,indent=2)+'\n');print(json.dumps(info,ensure_ascii=False))
def archive(target,out):
    p=json.loads((target/'project.json').read_text());assert p['type']=='web'
    for key in ['file','preview']:assert (target/p[key]).is_file()
    files=sorted(x for x in target.rglob('*')if x.is_file())
    forbidden={'node_modules','.git','.openai','src','tools','tests','records','research'}
    assert all(not (set(x.relative_to(target).parts)&forbidden)and not x.is_symlink()for x in files)
    for path in files:
        if path.name in ['app.js','app.css','style.css','index.html']:
            assert path.read_bytes()==(ROOT/'dist'/path.name).read_bytes(),path
    original=json.loads((ROOT/'assets/original/manifest.json').read_text())
    for item in original['assets']:
        if 'outputSha256'in item:assert sha((target/'assets/original'/item['output']).read_bytes())==item['outputSha256']
    manifest={'format':1,'package':'three-body-v0.6.1-wallpaper-engine.zip','sourceCommit':'ea50c8075aeb2275897098baf356eff5312bb6e9','files':[{'path':x.relative_to(target).as_posix(),'bytes':x.stat().st_size,'sha256':sha(x.read_bytes())}for x in files]}
    if out.exists():raise SystemExit('Refusing to overwrite an existing archive')
    with zipfile.ZipFile(out,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9)as z:
        for path in files:
            i=zipfile.ZipInfo(path.relative_to(target).as_posix(),(2026,11,9,0,0,0));i.compress_type=zipfile.ZIP_DEFLATED;i.external_attr=0o100644<<16;z.writestr(i,path.read_bytes())
    with zipfile.ZipFile(out)as z:assert z.testzip()is None
    manifest['archiveBytes']=out.stat().st_size;manifest['archiveSHA256']=sha(out.read_bytes())
    (out.parent/'MANIFEST.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'files':len(files),'bytes':manifest['archiveBytes'],'sha256':manifest['archiveSHA256']}))
if __name__=='__main__':
    a=argparse.ArgumentParser();a.add_argument('--prepare',type=pathlib.Path);a.add_argument('--project',type=pathlib.Path);a.add_argument('--zip',type=pathlib.Path);v=a.parse_args()
    if v.prepare:prepare(v.prepare.resolve())
    elif v.project and v.zip:archive(v.project.resolve(),v.zip.resolve())
    else:a.error('Use --prepare DIR, or --project DIR --zip ARCHIVE')
