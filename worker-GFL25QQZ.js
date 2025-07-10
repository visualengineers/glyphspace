var l=await import("https://cdn.jsdelivr.net/pyodide/v0.28.0/full/pyodide.mjs"),d=(async()=>{let s=await l.loadPyodide({indexURL:"https://cdn.jsdelivr.net/pyodide/v0.28.0/full/"});await s.loadPackage("micropip");let t=s.pyimport("micropip");return await t.install("pandas"),await t.install("scikit-learn"),s})(),n=Promise.resolve();function y(s){let t=n,e;return n=new Promise(a=>e=a),t.then(()=>s().finally(e))}self.onmessage=async s=>{let t=await d;y(async()=>{try{switch(s.data.type){case"process":{let{fileName:e,buffer:a}=s.data;if(t.FS.writeFile(e,new Uint8Array(a)),!t.FS.analyzePath("processor.py").exists){let i=await fetch("assets/processor.py").then(o=>o.text());t.FS.writeFile("processor.py",i)}let r=await t.runPythonAsync(`
            import json, processor
            processor.process_csv_file("${e}")
          `).then(JSON.parse);postMessage({type:"processed",dataset:r});break}case"getJson":{let{file:e}=s.data,a=t.FS.readFile(e,{encoding:"utf8"});postMessage({type:"json",file:e,data:JSON.parse(a)});break}case"unzip":{let{fileName:e,buffer:a}=s.data,r=e.replace(/\.zip$/,""),i=`${r}.zip`;t.FS.writeFile(i,new Uint8Array(a));try{if(await t.runPythonAsync(`
              import zipfile, os, shutil

              def unpack_flat(zip_path):
                  base = "/" + os.path.splitext(os.path.basename(zip_path))[0]
                  if os.path.exists(base):
                      shutil.rmtree(base)
                  os.mkdir(base)

                  with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                      for member in zip_ref.namelist():
                          if member.endswith('/'): continue
                          source = zip_ref.open(member)
                          target_path = os.path.join(base, os.path.basename(member))
                          with open(target_path, 'wb') as target:
                              shutil.copyfileobj(source, target)
                  print("Unpacked to", base)

              unpack_flat("${i}")
            `),!t.FS.analyzePath(`/${r}`).exists)throw new Error(`Unpack failed: folder /${r} not found`);let p=t.FS.readdir(`/${r}`).filter(c=>/\.(png|jpe?g|webp)$/i.test(c));postMessage({type:"unzipped",folder:r,images:p})}catch(o){postMessage({type:"error",message:`Unzip failed: ${o.message}`})}break}case"getThumb":{let e=s.data.file;try{let a=t.FS.readFile(`/${e}`,{encoding:"binary"});postMessage({type:"thumb",file:e,data:a.buffer},[a.buffer])}catch(a){postMessage({type:"error",message:`Thumbnail error: ${a.message}`})}break}}}catch(e){postMessage({type:"error",message:e.message??String(e)})}})};
