var y=await import("https://cdn.jsdelivr.net/pyodide/v0.28.0/full/pyodide.mjs"),d=(async()=>{let a=await y.loadPyodide({indexURL:"https://cdn.jsdelivr.net/pyodide/v0.28.0/full/"});await a.loadPackage("micropip");let s=a.pyimport("micropip");return await s.install("pandas"),await s.install("scikit-learn"),a})(),l=Promise.resolve();function f(a){let s=l,e;return l=new Promise(r=>e=r),s.then(()=>a().finally(e))}self.onmessage=async a=>{let s=await d;f(async()=>{try{switch(a.data.type){case"process":{let{fileName:e,buffer:r}=a.data;if(s.FS.writeFile(e,new Uint8Array(r)),!s.FS.analyzePath("processor.py").exists){let o=await fetch("assets/processor.py").then(p=>p.text());s.FS.writeFile("processor.py",o)}let t=await s.runPythonAsync(`
            import json, processor
            processor.process_csv_file("${e}")
          `).then(JSON.parse);postMessage({type:"processed",dataset:t});break}case"getJson":{let{file:e}=a.data,r=s.FS.readFile(e,{encoding:"utf8"});postMessage({type:"json",file:e,data:JSON.parse(r)});break}case"unzip":{let{fileName:e,buffer:r}=a.data,t=e.replace(/\.zip$/,""),o=`${t}.zip`;s.FS.writeFile(o,new Uint8Array(r));try{if(await s.runPythonAsync(`
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

              unpack_flat("${o}")
            `),!s.FS.analyzePath(`/${t}`).exists)throw new Error(`Unpack failed: folder /${t} not found`);let i=s.FS.readdir(`/${t}`).filter(n=>/\.(png|jpe?g|webp)$/i.test(n));postMessage({type:"unzipped",folder:t,images:i})}catch(p){postMessage({type:"error",message:`Unzip failed: ${p.message}`})}break}case"getThumb":{let e=a.data.file;try{let r=s.FS.readFile(`/${e}`,{encoding:"binary"});postMessage({type:"thumb",file:e,data:r.buffer},[r.buffer])}catch(r){postMessage({type:"error",message:`Thumbnail error: ${r.message}`})}break}case"profileData":{let{fileName:e,buffer:r}=a.data;if(s.FS.writeFile(e,new Uint8Array(r)),!s.FS.analyzePath("preprocessing_processor.py").exists){let p=await fetch("assets/preprocessing_processor.py").then(i=>i.text());s.FS.writeFile("preprocessing_processor.py",p)}let t=await s.runPythonAsync(`
            import preprocessing_processor
            preprocessing_processor.profile_data("${e}")
          `),o=JSON.parse(t);o.fileSize=r.byteLength,postMessage({type:"dataProfile",profile:o});break}case"computeHistogram":{let{fileName:e,columnName:r,bins:t=50}=a.data,o=await s.runPythonAsync(`
            import preprocessing_processor
            preprocessing_processor.compute_histogram("${e}", "${r}", ${t})
          `),p=JSON.parse(o);postMessage({type:"histogram",columnName:r,data:p});break}case"detectOutliers":{let{fileName:e,columnName:r,method:t}=a.data,o=await s.runPythonAsync(`
            import preprocessing_processor
            preprocessing_processor.detect_outliers("${e}", "${r}", "${t}")
          `),p=JSON.parse(o);postMessage({type:"outliers",columnName:r,data:p});break}case"detectDuplicates":{let{fileName:e,subsetColumns:r}=a.data,t;if(r&&r.length>0){let i=JSON.stringify(r);t=`
              import preprocessing_processor
              import json
              preprocessing_processor.detect_duplicates("${e}", ${i})
            `}else t=`
              import preprocessing_processor
              preprocessing_processor.detect_duplicates("${e}")
            `;let o=await s.runPythonAsync(t),p=JSON.parse(o);postMessage({type:"duplicates",data:p});break}case"processWithConfig":{let{fileName:e,config:r}=a.data;if(!s.FS.analyzePath("preprocessing_processor_config.py").exists){let n=await fetch("assets/preprocessing_processor_config.py").then(c=>c.text());s.FS.writeFile("preprocessing_processor_config.py",n)}let t=JSON.stringify(r);s.globals.set("sendProgress",(n,c,g)=>{postMessage({type:"processingProgress",step:n,progress:c,message:g})}),await s.runPythonAsync(`
import preprocessing_processor_config

# Create progress callback that calls the JavaScript function
def progress_callback(step, progress, message=''):
    sendProgress(step, progress, message)

preprocessing_processor_config.set_progress_callback(progress_callback)
          `);let o=`${e}.result.json`;await s.runPythonAsync(`
import preprocessing_processor_config
import json

preprocessing_processor_config.process_with_config(
    "${e}",
    '''${t.replace(/'/g,"\\'")}''',
    "${o}"
)
          `);let p=s.FS.readFile(o,{encoding:"utf8"}),i=JSON.parse(p);postMessage({type:"processed",dataset:i});try{s.FS.analyzePath(e).exists&&s.FS.unlink(e),s.FS.analyzePath(o).exists&&s.FS.unlink(o)}catch(n){console.warn("Failed to cleanup files:",n)}break}case"getProcessedFeatures":{try{let e=s.FS.readFile("processed_features.csv",{encoding:"utf8"});postMessage({type:"processedFeatures",data:e})}catch(e){postMessage({type:"error",message:`Failed to read processed features: ${e.message}`})}break}}}catch(e){postMessage({type:"error",message:e.message??String(e)})}})};
